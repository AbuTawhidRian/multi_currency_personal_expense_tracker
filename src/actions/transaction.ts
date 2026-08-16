"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const addTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().positive(),
  currencyId: z.string().min(1, "Currency is required"),
  countryId: z.string().min(1, "Country is required"),
  categoryId: z.string().min(1, "Category is required"),
  exchangeRate: z.coerce.number().positive().default(1),
  date: z.string(), // ISO Date string
  description: z.string().optional(),
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
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    
    return { success: true, transaction };
  } catch (error: any) {
    console.error("Add transaction error:", error);
    return { success: false, error: "Internal server error" };
  }
}
