"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  reportingCurrencyId: string;
  currentCountryId: string;
  homeCountryId: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        reportingCurrencyId: data.reportingCurrencyId,
        currentCountryId: data.currentCountryId,
        homeCountryId: data.homeCountryId,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/add");
    revalidatePath("/transactions");
    revalidatePath("/reports");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}
