"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { checkBudgetAlerts } from "@/actions/notification";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  currencyId: z.string().min(1, "Currency is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  period: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  countryId: z.string().optional().nullable(),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

export async function createBudget(data: BudgetInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = budgetSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    // Check if duplicate budget exists for same user, category, period, and country
    const existing = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId: parsed.data.categoryId,
        period: parsed.data.period,
        countryId: parsed.data.countryId || null,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A budget for this category, period, and country scope already exists. Please edit it instead.",
      };
    }

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId: parsed.data.categoryId,
        currencyId: parsed.data.currencyId,
        amount: parsed.data.amount,
        period: parsed.data.period,
        countryId: parsed.data.countryId || null,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    await checkBudgetAlerts(session.user.id);

    return { success: true, budget };
  } catch (error) {
    console.error("Create budget error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateBudget(id: string, data: BudgetInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = budgetSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existingBudget || existingBudget.userId !== session.user.id) {
      return { success: false, error: "Budget not found or unauthorized" };
    }

    // Check if updating creates a duplicate
    const duplicate = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId: parsed.data.categoryId,
        period: parsed.data.period,
        countryId: parsed.data.countryId || null,
        id: { not: id },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "Another budget with this category, period, and country scope already exists.",
      };
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        categoryId: parsed.data.categoryId,
        currencyId: parsed.data.currencyId,
        amount: parsed.data.amount,
        period: parsed.data.period,
        countryId: parsed.data.countryId || null,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    await checkBudgetAlerts(session.user.id);

    return { success: true, budget };
  } catch (error) {
    console.error("Update budget error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteBudget(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existingBudget || existingBudget.userId !== session.user.id) {
      return { success: false, error: "Budget not found or unauthorized" };
    }

    await prisma.budget.delete({
      where: { id },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Delete budget error:", error);
    return { success: false, error: "Internal server error" };
  }
}
