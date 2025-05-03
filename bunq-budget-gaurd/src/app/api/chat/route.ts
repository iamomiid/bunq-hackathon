import { openai } from "@ai-sdk/openai";
import { streamText, CoreMessage, createDataStreamResponse, tool, Message } from "ai";
import { NextRequest } from "next/server";
import { setDailyLimit } from "../../../../actions/daily-limit";
import { getLimitById } from "../../../../actions/budget-limits";
import { SelectBudgetLimit } from "../../../../db/schema/views";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define tools
const tools = {
  makeTransactionDecision: tool({
    description: "Make a decision on whether to approve or deny a budget limit exception",
    parameters: z.object({
      decision: z.enum(["APPROVED", "DENIED"]),
      reason: z.string().describe("Brief reason for the decision"),
    }),
    execute: async ({ decision, reason }) => {
      console.log(`Decision: ${decision}, Reason: ${reason}`);

      if (decision === "APPROVED") {
        try {
          // Set a high daily limit to allow the transaction
          await setDailyLimit(10_000);
          return { status: "success", message: "Card temporarily unblocked for this transaction." };
        } catch (error) {
          console.error("Failed to update unblock status:", error);
          return { status: "error", message: "Failed to unblock card." };
        }
      }

      return {
        status: "declined",
        message: "Transaction remains blocked. " + reason,
      };
    },
  }),
};

// Define the system message function that incorporates limit details
const getSystemMessage = (limitDetails: SelectBudgetLimit | null): CoreMessage => {
  return {
    role: "system",
    content: `You are a budget assistant for Bunq bank. 
A user has exceeded the following budget limit on their designated 'Budget Card':
Limit ID: ${limitDetails?.id || "Unknown"}
Limit Description: ${limitDetails?.title || "Unknown"}
Limit Amount: ${limitDetails?.amount || "Unknown"} EUR
Current Spending: ${limitDetails?.currentUsage ? Number(limitDetails.currentUsage).toFixed(2) : "Unknown"} EUR
Exceeded By: ${
      limitDetails?.currentUsage && limitDetails?.amount
        ? (Number(limitDetails.currentUsage) - Number(limitDetails.amount)).toFixed(2)
        : "Unknown"
    } EUR
Strictness Level: ${limitDetails?.strictnessLevel || "Medium"}

The user's card is currently blocked due to exceeding this limit. 
Their goal is to provide a justification for exceeding the limit to potentially unblock the card for this transaction.

Evaluate their justification based on:
1. The necessity of the purchase
2. The strictness level of the limit (Stricter limits require stronger justification)
3. How much they've exceeded the limit

Ask clarifying questions if needed, but ultimately decide if the justification is reasonable enough to temporarily allow the transaction.
Use the makeTransactionDecision tool to communicate your decision about unblocking the card.`,
  };
};

export async function POST(req: NextRequest) {
  try {
    const { messages, limitId }: { messages: Message[]; limitId?: string } = await req.json();

    // Get limit details if limitId is provided
    let limitDetails: SelectBudgetLimit | null = null;
    if (limitId) {
      try {
        limitDetails = await getLimitById(limitId);
      } catch (error) {
        console.error("Error fetching limit details:", error);
      }
    }

    // Create the system message with limit details
    const systemPrompt = getSystemMessage(limitDetails);

    // Add the system message to the beginning of the message history
    const messagesWithSystemPrompt = [
      systemPrompt,
      ...messages.filter((m) => m.role !== "system"), // Filter out any existing system messages
    ] as Message[];

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const result = await streamText({
          model: openai("gpt-4o"),
          messages: messagesWithSystemPrompt,
          temperature: 0.7,
          tools,
          maxSteps: 3, // Allow multiple steps for a conversational flow
          onStepFinish: ({ text, toolCalls, toolResults, finishReason }) => {
            // Log step completion for monitoring
            console.log(`Step finished: ${finishReason}`, {
              toolCalls: toolCalls.length,
              toolResults: toolResults.length,
            });
          },
        });

        result.mergeIntoDataStream(dataStream);
      },
    });
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
