"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const paymentMethodSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
});

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

export async function createPaymentMethod(data: PaymentMethodInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = paymentMethodSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    // Check for duplicate name for this user
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: parsed.data.name, mode: "insensitive" },
      },
    });

    if (existing) {
      return { success: false, error: "A payment method with this name already exists." };
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        isDefault: false,
      },
    });

    revalidatePath("/settings/payment-methods");
    revalidatePath("/add");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return { success: true, paymentMethod };
  } catch (error) {
    console.error("Create payment method error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updatePaymentMethod(id: string, data: PaymentMethodInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = paymentMethodSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Payment method not found" };
    }

    if (existing.userId !== session.user.id) {
      return { success: false, error: "Unauthorized or cannot edit system default payment methods" };
    }

    // Check for duplicate name
    const duplicate = await prisma.paymentMethod.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: parsed.data.name, mode: "insensitive" },
        id: { not: id },
      },
    });

    if (duplicate) {
      return { success: false, error: "Another payment method with this name already exists." };
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        name: parsed.data.name,
      },
    });

    revalidatePath("/settings/payment-methods");
    revalidatePath("/add");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return { success: true, paymentMethod };
  } catch (error) {
    console.error("Update payment method error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Payment method not found or unauthorized to delete" };
    }

    // Check if any transactions are using this payment method
    const txCount = await prisma.transaction.count({
      where: { paymentMethodId: id },
    });

    if (txCount > 0) {
      return {
        success: false,
        error: `Cannot delete payment method because it is used by ${txCount} transaction(s).`,
      };
    }

    await prisma.paymentMethod.delete({
      where: { id },
    });

    revalidatePath("/settings/payment-methods");
    revalidatePath("/add");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return { success: true };
  } catch (error) {
    console.error("Delete payment method error:", error);
    return { success: false, error: "Internal server error" };
  }
}
