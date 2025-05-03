"use server";
import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { budgetLimitsWithUsage } from "../db/schema/views";
import { transaction, transactionToBudgetLimit } from "../db/schema/tables";
import { notFound } from "next/navigation";

export type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  date: string;
};

export type BudgetLimitWithTransactions = {
  id: string;
  category: string;
  amount: number;
  currentSpent: number;
  period: string;
  strictness: string;
  description: string;
  transactions: Transaction[];
};

// Define a type for the payment data structure in the JSON
type TransactionJson = {
  NotificationUrl?: {
    object?: {
      Payment?: {
        amount?: {
          value?: string;
        };
        counterparty_alias?: {
          display_name?: string;
        };
      };
    };
  };
};

export async function getLimitDetails(limitId: string): Promise<BudgetLimitWithTransactions> {
  // Fetch the budget limit from the view
  const limitResult = await db
    .select()
    .from(budgetLimitsWithUsage)
    .where(eq(budgetLimitsWithUsage.id, limitId))
    .limit(1);

  if (limitResult.length === 0) {
    notFound();
  }

  const limit = limitResult[0];

  // Fetch the transactions associated with this budget limit
  const transactionsResult = await db
    .select({
      id: transaction.id,
      json: transaction.json,
      createdAt: transaction.createdAt,
    })
    .from(transaction)
    .innerJoin(transactionToBudgetLimit, eq(transaction.id, transactionToBudgetLimit.transactionId))
    .where(eq(transactionToBudgetLimit.budgetLimitId, limitId))
    .orderBy(sql`${transaction.createdAt} DESC`)
    .limit(10);

  // Map the transaction data to the format needed for the UI
  const transactions: Transaction[] = transactionsResult.map((t) => {
    // Extract merchant and amount from the JSON
    const jsonData = t.json as TransactionJson;
    const paymentData = jsonData?.NotificationUrl?.object?.Payment;
    const merchant = paymentData?.counterparty_alias?.display_name || "Unknown Merchant";
    const amount = parseFloat(paymentData?.amount?.value || "0");

    return {
      id: t.id,
      merchant,
      amount: Math.abs(amount), // Use absolute value for display
      date: t.createdAt.toISOString(),
    };
  });

  // Map strictness level to a readable format
  const strictnessMap: Record<number, string> = {
    1: "Very Flexible",
    2: "Flexible",
    3: "Moderate",
    4: "Strict",
    5: "Very Strict",
  };

  // Return the data in the format expected by the component
  return {
    id: limit.id,
    category: limit.category,
    amount: parseFloat(limit.amount.toString()),
    currentSpent: parseFloat(limit.currentUsage.toString()),
    period: limit.period,
    strictness: strictnessMap[limit.strictnessLevel] || "Moderate",
    description: limit.title || `${limit.category} budget limit`,
    transactions,
  };
}
