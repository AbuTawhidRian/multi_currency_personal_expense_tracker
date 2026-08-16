"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INCOME", "EXPENSE", "BOTH"]),
  icon: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export async function createCategory(data: CategoryInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        type: parsed.data.type,
        icon: parsed.data.icon,
        isDefault: false,
        isActive: true,
      },
    });

    revalidatePath("/settings/categories");
    revalidatePath("/add");
    revalidatePath("/dashboard");

    return { success: true, category };
  } catch (error: any) {
    console.error("Create category error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function updateCategory(id: string, data: CategoryInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid data", details: parsed.error.issues };
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    if (existingCategory.userId !== session.user.id) {
      return { success: false, error: "Unauthorized or cannot edit default categories" };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        icon: parsed.data.icon,
      },
    });

    revalidatePath("/settings/categories");
    revalidatePath("/add");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/reports");

    return { success: true, category };
  } catch (error: any) {
    console.error("Update category error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory || existingCategory.userId !== session.user.id) {
      return { success: false, error: "Category not found or cannot delete default categories" };
    }

    // Check if category is in use
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionsCount > 0) {
      return { success: false, error: "Cannot delete category because it is used by existing transactions" };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/settings/categories");
    revalidatePath("/add");

    return { success: true };
  } catch (error: any) {
    console.error("Delete category error:", error);
    return { success: false, error: "Internal server error" };
  }
}
