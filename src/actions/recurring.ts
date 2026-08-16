"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const recurringSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  countryId: z.string().min(1, "Country is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  currencyId: z.string().min(1, "Currency is required"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type RecurringInput = z.infer<typeof recurringSchema>;

export async function createRecurringTransaction(data: RecurringInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = recurringSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId: session.user.id,
        type: parsed.data.type,
        countryId: parsed.data.countryId,
        categoryId: parsed.data.categoryId,
        amount: parsed.data.amount,
        currencyId: parsed.data.currencyId,
        frequency: parsed.data.frequency,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/recurring");
    revalidatePath("/dashboard");

    return { success: true, recurring };
  } catch (error) {
    console.error("Create recurring transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateRecurringTransaction(id: string, data: RecurringInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = recurringSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    const existing = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Recurring transaction not found or unauthorized" };
    }

    const recurring = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        type: parsed.data.type,
        countryId: parsed.data.countryId,
        categoryId: parsed.data.categoryId,
        amount: parsed.data.amount,
        currencyId: parsed.data.currencyId,
        frequency: parsed.data.frequency,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/recurring");
    revalidatePath("/dashboard");

    return { success: true, recurring };
  } catch (error) {
    console.error("Update recurring transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteRecurringTransaction(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Recurring transaction not found or unauthorized" };
    }

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    revalidatePath("/recurring");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete recurring transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function executeRecurringTransaction(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const recurring = await prisma.recurringTransaction.findUnique({
      where: { id },
      include: {
        category: true,
        country: true,
        currency: true,
      },
    });

    if (!recurring || recurring.userId !== session.user.id) {
      return { success: false, error: "Recurring template not found or unauthorized" };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.reportingCurrencyId) {
      return { success: false, error: "Reporting currency not configured" };
    }

    // Determine exchange rate
    let exchangeRate = 1;
    if (recurring.currencyId !== profile.reportingCurrencyId) {
      const customRate = await prisma.exchangeRate.findFirst({
        where: {
          userId: session.user.id,
          fromCurrencyId: recurring.currencyId,
          toCurrencyId: profile.reportingCurrencyId,
        },
      });
      if (customRate) {
        exchangeRate = Number(customRate.rate);
      }
    }

    const amountNum = Number(recurring.amount);
    const convertedAmount = amountNum * exchangeRate;

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: recurring.type,
        countryId: recurring.countryId,
        categoryId: recurring.categoryId,
        amount: recurring.amount,
        currencyId: recurring.currencyId,
        reportingCurrencyId: profile.reportingCurrencyId,
        exchangeRate,
        convertedAmount,
        date: new Date(),
        description: recurring.description || `${recurring.frequency} ${recurring.category.name}`,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/transfers");
    revalidatePath("/recurring");

    return { success: true, transaction };
  } catch (error) {
    console.error("Execute recurring transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}
