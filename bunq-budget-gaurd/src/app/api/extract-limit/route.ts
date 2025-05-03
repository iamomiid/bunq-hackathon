import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import db from "../../../../db";
import { budgetLimit, category } from "../../../../db/schema/tables";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "../../../lib/auth";

interface LimitDetails {
  category: string;
  amount: number;
  currency: string;
  period: string;
  strictness: "flexible" | "moderate" | "strict";
}

// Define expected session structure (adjust if different)
interface SessionData {
  apiKey: string;
  userId?: string; // Assuming userId is stored in the session
  // Add other session properties if needed
}

export async function POST(req: Request) {
  try {
    const session = (await getSession()) as SessionData | null; // Get session data

    // Check for API key in session for authentication
    if (!session?.apiKey) {
      return NextResponse.json(
        { error: "Unauthorized - Missing API Key" },
        { status: 401 }
      );
    }

    // Assuming userId is needed and stored in session
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Missing User ID in session" },
        { status: 401 }
      );
    }

    const { description, shouldSave = false } = await req.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: openai("gpt-4.1-mini"),
      prompt: `Extract budget limit details from this user input: "${description}". 
              Return a JSON object with these properties:
              - category: The spending category (e.g., groceries, entertainment, takeaways)
              - amount: The monetary amount (as a number)
              - currency: The currency symbol (e.g., €, $)
              - period: The time period (e.g., day, week, month)
              - strictness: Estimated strictness level (flexible, moderate, strict) based on wording`,
      temperature: 0.1,
      output: "no-schema",
    });

    console.log("Object:", object);

    // Parse the response as JSON - Use unknown for safer type assertion
    const limitDetails = object as unknown as LimitDetails;

    // Save to database if requested
    if (shouldSave) {
      await saveBudgetLimit(limitDetails, userId);
    }

    return NextResponse.json({ limitDetails });
  } catch (error) {
    console.error("Error extracting limit details:", error);
    return NextResponse.json(
      { error: "Failed to extract limit details" },
      { status: 500 }
    );
  }
}

async function saveBudgetLimit(limitDetails: LimitDetails, userId: string) {
  // Map strictness level from text to number
  const strictnessMap = {
    flexible: 1,
    moderate: 5,
    strict: 10,
  };

  // Find or create category
  let categoryId;
  const existingCategory = await db
    .select()
    .from(category)
    .where(
      and(eq(category.name, limitDetails.category), eq(category.userId, userId))
    )
    .limit(1);

  if (existingCategory.length > 0) {
    categoryId = existingCategory[0].id;
  } else {
    // Create new category
    const [newCategory] = await db
      .insert(category)
      .values({
        id: uuidv4(),
        name: limitDetails.category,
        userId,
      })
      .returning();

    categoryId = newCategory.id;
  }

  // Create budget limit
  const [newBudgetLimit] = await db
    .insert(budgetLimit)
    .values({
      id: uuidv4(),
      category: categoryId,
      amount: String(limitDetails.amount), // Convert amount to string for DB schema
      period: limitDetails.period,
      strictnessLevel: strictnessMap[limitDetails.strictness] || 5,
    })
    .returning();

  return newBudgetLimit;
}
