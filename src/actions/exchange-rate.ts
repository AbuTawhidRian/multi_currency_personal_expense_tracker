"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const exchangeRateSchema = z.object({
  fromCurrencyId: z.string().min(1, "From Currency is required"),
  toCurrencyId: z.string().min(1, "To Currency is required"),
  rate: z.number().positive("Rate must be positive"),
});

export type ExchangeRateInput = z.infer<typeof exchangeRateSchema>;

export async function createExchangeRate(data: ExchangeRateInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = exchangeRateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    if (parsed.data.fromCurrencyId === parsed.data.toCurrencyId) {
      return { success: false, error: "Cannot create exchange rate for the same currency" };
    }

    // Check if an exchange rate already exists for this pair
    const existingRate = await prisma.exchangeRate.findFirst({
      where: {
        userId: session.user.id,
        fromCurrencyId: parsed.data.fromCurrencyId,
        toCurrencyId: parsed.data.toCurrencyId,
      },
    });

    if (existingRate) {
      return { success: false, error: "An exchange rate for this currency pair already exists. Please edit it instead." };
    }

    const exchangeRate = await prisma.exchangeRate.create({
      data: {
        userId: session.user.id,
        fromCurrencyId: parsed.data.fromCurrencyId,
        toCurrencyId: parsed.data.toCurrencyId,
        rate: parsed.data.rate,
      },
    });

    revalidatePath("/settings/exchange-rates");
    revalidatePath("/add");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Create exchange rate error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateExchangeRate(id: string, data: ExchangeRateInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = exchangeRateSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    if (parsed.data.fromCurrencyId === parsed.data.toCurrencyId) {
      return { success: false, error: "Cannot create exchange rate for the same currency" };
    }

    const existingRate = await prisma.exchangeRate.findUnique({
      where: { id },
    });

    if (!existingRate) {
      return { success: false, error: "Exchange rate not found" };
    }

    if (existingRate.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if updating to a pair that already exists (and is not this one)
    const duplicateRate = await prisma.exchangeRate.findFirst({
      where: {
        userId: session.user.id,
        fromCurrencyId: parsed.data.fromCurrencyId,
        toCurrencyId: parsed.data.toCurrencyId,
        id: { not: id },
      },
    });

    if (duplicateRate) {
      return { success: false, error: "An exchange rate for this currency pair already exists." };
    }

    const exchangeRate = await prisma.exchangeRate.update({
      where: { id },
      data: {
        fromCurrencyId: parsed.data.fromCurrencyId,
        toCurrencyId: parsed.data.toCurrencyId,
        rate: parsed.data.rate,
      },
    });

    revalidatePath("/settings/exchange-rates");
    revalidatePath("/add");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/reports");

    return { success: true, exchangeRate };
  } catch (error) {
    console.error("Update exchange rate error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteExchangeRate(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingRate = await prisma.exchangeRate.findUnique({
      where: { id },
    });

    if (!existingRate || existingRate.userId !== session.user.id) {
      return { success: false, error: "Exchange rate not found or unauthorized" };
    }

    await prisma.exchangeRate.delete({
      where: { id },
    });

    revalidatePath("/settings/exchange-rates");
    revalidatePath("/add");

    return { success: true };
  } catch (error) {
    console.error("Delete exchange rate error:", error);
    return { success: false, error: "Internal server error" };
  }
}
