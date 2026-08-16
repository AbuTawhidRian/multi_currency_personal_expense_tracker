"use server";

import { revalidatePath } from "next/cache";
import { transactionSchema, TransactionInput } from "@/lib/validations/transaction";
// import prisma from "@/lib/prisma"; // Assuming you will have prisma setup

export async function createTransaction(data: TransactionInput) {
  try {
    // 1. Validate data
    const validatedData = transactionSchema.parse(data);

    // 2. Mock calculation of converted amount (since rate is manually entered)
    const convertedAmount = validatedData.amount * validatedData.exchangeRate;

    // 3. Prepare data for database
    const transactionData = {
      ...validatedData,
      convertedAmount,
      // userId: "user-id", // To be retrieved from NextAuth session
    };

    console.log("Mocking transaction save:", transactionData);
    
    // Uncomment when Prisma is fully connected
    /*
    const transaction = await prisma.transaction.create({
      data: transactionData,
    });
    */

    revalidatePath("/dashboard"); // or wherever the transactions list is
    return { success: true, message: "Transaction added successfully" };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return { success: false, error: error.message || "Failed to create transaction" };
  }
}
