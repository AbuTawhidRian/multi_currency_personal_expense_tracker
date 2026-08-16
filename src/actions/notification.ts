"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Checks all active budgets for the given user against current period expenses.
 * Triggers warning (>= 80%) or exceeded (>= 100%) notifications if not yet generated this period.
 */
export async function checkBudgetAlerts(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { reportingCurrency: true },
    });

    if (!profile?.reportingCurrencyId) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    const [budgets, transactions, exchangeRates, existingAlerts] = await Promise.all([
      prisma.budget.findMany({
        where: { userId },
        include: {
          category: true,
          currency: true,
          country: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startOfYear, lte: endOfYear },
        },
        include: {
          currency: true,
        },
      }),
      prisma.exchangeRate.findMany({
        where: { userId },
      }),
      prisma.notification.findMany({
        where: {
          userId,
          type: "BUDGET_ALERT",
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    if (budgets.length === 0) return;

    // Currency conversion helpers
    const convertFromReporting = (reportingAmount: number, targetCurrencyId: string): number => {
      if (targetCurrencyId === profile.reportingCurrencyId) return reportingAmount;
      const directRate = exchangeRates.find(
        (r) => r.fromCurrencyId === profile.reportingCurrencyId && r.toCurrencyId === targetCurrencyId
      );
      if (directRate) return reportingAmount * Number(directRate.rate);
      const inverseRate = exchangeRates.find(
        (r) => r.fromCurrencyId === targetCurrencyId && r.toCurrencyId === profile.reportingCurrencyId
      );
      if (inverseRate && Number(inverseRate.rate) > 0) return reportingAmount / Number(inverseRate.rate);
      return reportingAmount;
    };

    const newNotifications: {
      userId: string;
      title: string;
      message: string;
      type: string;
    }[] = [];

    for (const b of budgets) {
      const budgetAmount = Number(b.amount);
      if (budgetAmount <= 0) continue;

      const isMonthly = b.period === "MONTHLY";
      const startDate = isMonthly ? startOfMonth : startOfYear;
      const endDate = isMonthly ? endOfMonth : endOfYear;

      // Filter transactions matching this budget
      const matchingTransactions = transactions.filter((tx) => {
        if (tx.categoryId !== b.categoryId) return false;
        if (b.countryId && tx.countryId !== b.countryId) return false;
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });

      // Calculate spent amount in budget currency
      let spent = 0;
      matchingTransactions.forEach((tx) => {
        if (tx.currencyId === b.currencyId) {
          spent += Number(tx.amount);
        } else {
          spent += convertFromReporting(Number(tx.convertedAmount), b.currencyId);
        }
      });

      const percentage = (spent / budgetAmount) * 100;
      const categoryName = b.category.name;
      const formattedBudget = `${budgetAmount.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} ${b.currency.code}`;
      const formattedSpent = `${spent.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} ${b.currency.code}`;
      const periodLabel = isMonthly ? "monthly" : "yearly";

      // 1. Check if Exceeded (>= 100%)
      if (percentage >= 100) {
        const alertTag = `[BUDGET_EXCEEDED:${b.id}:${now.getFullYear()}-${now.getMonth() + 1}]`;
        const alreadyAlerted = existingAlerts.some((a) => a.message.includes(alertTag));

        if (!alreadyAlerted) {
          newNotifications.push({
            userId,
            title: `🚨 Budget Exceeded: ${categoryName}`,
            message: `You have spent ${formattedSpent} (${percentage.toFixed(
              1
            )}%) of your ${formattedBudget} ${periodLabel} budget. ${alertTag}`,
            type: "BUDGET_ALERT",
          });
        }
      }
      // 2. Check if Warning (>= 80% and < 100%)
      else if (percentage >= 80) {
        const warningTag = `[BUDGET_WARNING:${b.id}:${now.getFullYear()}-${now.getMonth() + 1}]`;
        const alreadyWarned = existingAlerts.some(
          (a) => a.message.includes(warningTag) || a.message.includes(`[BUDGET_EXCEEDED:${b.id}:`)
        );

        if (!alreadyWarned) {
          newNotifications.push({
            userId,
            title: `⚠️ Budget Warning: ${categoryName}`,
            message: `You have reached ${percentage.toFixed(
              1
            )}% (${formattedSpent} of ${formattedBudget}) of your ${periodLabel} budget. ${warningTag}`,
            type: "BUDGET_ALERT",
          });
        }
      }
    }

    if (newNotifications.length > 0) {
      await prisma.notification.createMany({
        data: newNotifications,
      });
      revalidatePath("/budgets");
      revalidatePath("/dashboard");
    }
  } catch (error) {
    console.error("Error checking budget alerts:", error);
  }
}

/**
 * Get all notifications for current user with unread count
 */
export async function getNotifications(): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { notifications: [], unreadCount: 0 };
    }

    const [notificationsRaw, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ]);

    const notifications: NotificationItem[] = notificationsRaw.map((n) => ({
      id: n.id,
      title: n.title,
      // Strip internal alert tag from display message
      message: n.message.replace(/\[BUDGET_(EXCEEDED|WARNING):[^\]]+\]/g, "").trim(),
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));

    return { notifications, unreadCount };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * Delete a single notification
 */
export async function deleteNotification(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.notification.deleteMany({
      where: { id, userId: session.user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * Clear all notifications for current user
 */
export async function clearAllNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await prisma.notification.deleteMany({
      where: { userId: session.user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return { success: false, error: "Internal server error" };
  }
}
