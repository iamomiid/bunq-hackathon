"use server";

import { budgetLimit, transaction, transactionToBudgetLimit } from "../db/schema/tables";
import { eq } from "drizzle-orm";
import db from "../db";
import { v4 as uuidv4 } from "uuid";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { getSession } from "../src/lib/auth";
import { z } from "zod";
import { budgetLimitsWithUsage } from "../db/schema/views";
import { createLimitPrompt } from "../prompts/create-limit";
// Define the transaction JSON structure we expect
interface TransactionJson {
  amount?: string | number;
  [key: string]: unknown;
}

const limitDetailsSchema = z.object({
  category: z.string(),
  amount: z.number(),
  currency: z.string(),
  period: z.string(),
  strictness: z.enum(["flexible", "moderate", "strict"]),
  title: z.string(),
});

export async function getBudgetLimits() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      throw new Error("Unauthorized - Missing User ID in session");
    }

    const limits = await db
      .select()
      .from(budgetLimitsWithUsage)
      .where(eq(budgetLimitsWithUsage.userId, session.userId));

    // Get transaction info for each budget limit to calculate current spent amount
    const limitsWithSpending = await Promise.all(
      limits.map(async (limit) => {
        // Get transactions related to this budget limit through the junction table
        const relatedTransactions = await db
          .select({
            transaction: transaction,
          })
          .from(transaction)
          .innerJoin(transactionToBudgetLimit, eq(transaction.id, transactionToBudgetLimit.transactionId))
          .where(eq(transactionToBudgetLimit.budgetLimitId, limit.id));

        // Calculate current spent amount based on transactions
        const currentSpent = relatedTransactions.reduce((acc, { transaction: tx }) => {
          // Safely cast json to TransactionJson type
          const txJson = tx.json as TransactionJson;
          const txAmount = txJson.amount ? parseFloat(txJson.amount.toString()) : 0;
          return acc + txAmount;
        }, 0);

        return {
          id: limit.id,
          description: `Limit spending on ${limit.category} to €${limit.amount} per ${limit.period}`,
          category: limit.category,
          amount: parseFloat(limit.amount.toString()),
          period: limit.period.charAt(0).toUpperCase() + limit.period.slice(1),
          currentSpent,
          strictness: getStrictnessLabel(limit.strictnessLevel),
          title: limit.title,
          currentUsage: parseFloat(limit.currentUsage.toString()),
        };
      }),
    );

    return limitsWithSpending;
  } catch (error) {
    console.error("Error fetching budget limits:", error);
    throw new Error("Failed to fetch budget limits");
  }
}

export const getLimitById = async (id: string) => {
  const limit = await db.select().from(budgetLimitsWithUsage).where(eq(budgetLimitsWithUsage.id, id));
  return limit[0];
};

// Helper function to convert strictness level to label
function getStrictnessLabel(level: number): string {
  if (level <= 3) return "Flexible";
  if (level <= 7) return "Moderate";
  return "Strict";
}

export async function deleteBudgetLimit(id: string) {
  try {
    // Delete related transactions from junction table first
    await db.delete(transactionToBudgetLimit).where(eq(transactionToBudgetLimit.budgetLimitId, id));

    // Then delete the budget limit
    await db.delete(budgetLimit).where(eq(budgetLimit.id, id));

    return { success: true };
  } catch (error) {
    console.error("Error deleting budget limit:", error);
    throw new Error("Failed to delete budget limit");
  }
}

export async function extractLimitDetails(description: string) {
  try {
    if (!description || typeof description !== "string") {
      throw new Error("Description is required");
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: createLimitPrompt(description),
      temperature: 0.1,
      schema: limitDetailsSchema,
    });

    return object;
  } catch (error) {
    console.error("Error extracting limit details:", error);
    throw new Error("Failed to extract limit details");
  }
}

export async function createBudgetLimit(description: string, strictnessValue?: number) {
  try {
    const session = await getSession();

    // Check for authentication
    if (!session?.apiKey) {
      throw new Error("Unauthorized - Missing API Key");
    }

    // Assuming userId is needed and stored in session
    const userId = session?.userId;
    if (!userId) {
      throw new Error("Unauthorized - Missing User ID in session");
    }

    // Extract limit details from description
    const limitDetails = await extractLimitDetails(description);

    // Map strictness level from text to number
    const strictnessMap = {
      flexible: 1,
      moderate: 5,
      strict: 10,
    };

    // Create budget limit - use provided strictnessValue if available
    const [newBudgetLimit] = await db
      .insert(budgetLimit)
      .values({
        id: uuidv4(),
        category: limitDetails.category,
        amount: String(limitDetails.amount), // Convert amount to string for DB schema
        period: limitDetails.period,
        strictnessLevel: strictnessValue || strictnessMap[limitDetails.strictness] || 5,
        title: limitDetails.title,
        userId,
      })
      .returning();

    return { success: true, budgetLimit: newBudgetLimit };
  } catch (error) {
    console.error("Error creating budget limit:", error);
    throw new Error(`Failed to create budget limit: ${error instanceof Error ? error.message : String(error)}`);
  }
}
