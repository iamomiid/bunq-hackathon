"use server";

import { db } from "@/db";
import { transaction } from "@/db/schema/tables";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function getAllTransactions() {
  const session = await getSession();
  const userId = session?.userId;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const transactions = await db.select().from(transaction).where(eq(transaction.userId, userId)); // Filter by userId

    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions.");
  }
}
