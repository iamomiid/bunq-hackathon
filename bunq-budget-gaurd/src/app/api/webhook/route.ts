import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse, type NextRequest } from "next/server";
import z from "zod";
import { db } from "@/db";
import { budgetLimit, transaction, transactionToBudgetLimit, user } from "@/db/schema/tables";
import { eq, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { budgetLimitsWithUsage } from "@/db/schema/views";

const webhookSchema = z.object({
  NotificationUrl: z.object({
    target_url: z.string(),
    category: z.literal("PAYMENT"),
    event_type: z.literal("PAYMENT_CREATED"),
    object: z.object({
      Payment: z.object({
        monetary_account_id: z.number(),
        amount: z.object({
          value: z.string(),
          currency: z.string(),
        }),
        description: z.string(),
      }),
    }),
  }),
});

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const parseOutput = webhookSchema.safeParse(body);

  if (!parseOutput.success) {
    return new Response("Invalid request body", { status: 200 });
  }

  const parsedBody = parseOutput.data;

  if (!parsedBody.NotificationUrl.object.Payment.amount.value.startsWith("-")) {
    return new Response("Not an outgoing payment", { status: 200 });
  }

  const paymentUser = await db.query.user.findFirst({
    where: eq(user.accountId, parsedBody.NotificationUrl.object.Payment.monetary_account_id.toString()),
  });

  if (!paymentUser) {
    return new Response("User not found", { status: 200 });
  }

  const amount = parseFloat(parsedBody.NotificationUrl.object.Payment.amount.value);

  const description = parsedBody.NotificationUrl.object.Payment.description;

  const userCategories = await db
    .select({
      id: budgetLimit.id,
      category: budgetLimit.category,
    })
    .from(budgetLimit)
    .where(eq(budgetLimit.userId, paymentUser.id));

  const { object } = await generateObject({
    model: openai("gpt-4.1-mini"),
    prompt: `You are a multi‑label transaction categorisation assistant.
Context
• A “category” is a user‑defined spending bucket (e.g. “Groceries”, “Ride‑hailing”, “Kids’ school fees”).
• Each transaction may belong to zero, one, or several categories.

Rules
1. Use only the category names provided in the current request — no inventing new ones.
2. A match is valid when the category description or keywords clearly apply to the transaction.
3. If several categories match, return all of them (max 10).  
   If none match, return an empty list [].

Transaction Description: "${description}"
Categories: "${userCategories.map((c) => `ID: ${c.id}, Category: ${c.category}`).join(", ")}"
`,
    schema: z.object({
      categories: z.array(z.string()).describe("ID of the categories that match the transaction"),
    }),
    temperature: 0.1,
  });

  const [newTransaction] = await db
    .insert(transaction)
    .values({
      id: uuidv4(),
      json: body,
      userId: paymentUser.id,
    })
    .returning();

  if (object.categories.length > 0) {
    await db.insert(transactionToBudgetLimit).values(
      object.categories.map((category) => ({
        transactionId: newTransaction.id,
        budgetLimitId: category,
      })),
    );
  }

  const threshold = await db
    .select()
    .from(budgetLimitsWithUsage)
    .where(gte(budgetLimitsWithUsage.currentUsage, budgetLimitsWithUsage.amount));

  if (threshold.length > 0) {
    return new Response("Threshold exceeded", { status: 200 });
  }

  return NextResponse.json({
    success: true,
  });
};
