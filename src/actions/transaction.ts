"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { checkBudgetAlerts } from "@/actions/notification";

const addTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().positive(),
  currencyId: z.string().min(1, "Currency is required"),
  countryId: z.string().min(1, "Country is required"),
  categoryId: z.string().min(1, "Category is required"),
  exchangeRate: z.coerce.number().positive().default(1),
  date: z.string(), // ISO Date string
  description: z.string().optional(),
  paymentMethodId: z.string().optional().nullable(),
});

export type AddTransactionInput = z.infer<typeof addTransactionSchema>;

export async function addTransaction(data: AddTransactionInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = addTransactionSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    const {
      type,
      amount,
      currencyId,
      countryId,
      categoryId,
      exchangeRate,
      date,
      description,
      paymentMethodId,
    } = parsed.data;

    // Fetch user profile to get reporting currency
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { reportingCurrency: true },
    });

    if (!profile?.reportingCurrencyId) {
      return { success: false, error: "User profile or reporting currency not found" };
    }

    // Calculate converted amount based on the provided exchange rate
    const convertedAmount = amount * exchangeRate;

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        amount,
        currencyId,
        countryId,
        categoryId,
        exchangeRate,
        convertedAmount,
        date: new Date(date),
        reportingCurrencyId: profile.reportingCurrencyId,
        description,
        paymentMethodId: paymentMethodId || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/transfers");
    revalidatePath("/budgets");

    if (type === "EXPENSE") {
      await checkBudgetAlerts(session.user.id);
    }
    
    return { success: true, transaction };
  } catch (error) {
    console.error("Add transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return { success: false, error: "Transaction not found or unauthorized" };
    }

    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/transfers");
    revalidatePath("/reports");

    return { success: true };
  } catch (error) {
    console.error("Delete transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateTransaction(id: string, data: AddTransactionInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = addTransactionSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    // Verify ownership
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction || existingTransaction.userId !== session.user.id) {
      return { success: false, error: "Transaction not found or unauthorized" };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.reportingCurrencyId) {
      return { success: false, error: "User profile or reporting currency not found" };
    }

    const { type, amount, currencyId, countryId, categoryId, exchangeRate, date, description, paymentMethodId } = parsed.data;
    const convertedAmount = amount * exchangeRate;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount,
        currencyId,
        countryId,
        categoryId,
        exchangeRate,
        convertedAmount,
        date: new Date(date),
        reportingCurrencyId: profile.reportingCurrencyId,
        description,
        paymentMethodId: paymentMethodId || null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/income");
    revalidatePath("/expenses");
    revalidatePath("/transfers");
    revalidatePath("/reports");
    revalidatePath("/budgets");

    if (type === "EXPENSE") {
      await checkBudgetAlerts(session.user.id);
    }

    return { success: true, transaction };
  } catch (error) {
    console.error("Update transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}

