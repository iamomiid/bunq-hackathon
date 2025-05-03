import { createOpenAI, openai } from "@ai-sdk/openai";
import { streamText, CoreMessage, createDataStreamResponse, tool, Message } from "ai";
import { NextRequest } from "next/server";
import { setUserDailyLimit } from "@/actions/daily-limit";
import { getBudgetLimits, getLimitById } from "@/actions/budget-limits";
import { SelectBudgetLimit } from "@/db/schema/views";
import { z } from "zod";
import { convincingPrompt } from "@/prompts/convincing";
import { getAllTransactions } from "@/actions/transactions";
import { redirect } from "next/navigation";
import redirectToDashboard from "@/actions/redirect-to-dashboard";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { setTimeout } from "node:timers/promises";

const nvidia = createOpenAI({
  baseURL: process.env.NVIDIA_BASE_URL,
  apiKey: process.env.NVIDIA_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define tools
const tools = {
  makeTransactionDecision: tool({
    description:
      "Make a decision on whether to approve or deny a budget limit exception. Also send the decision as a message to user.",
    parameters: z.object({
      decision: z.enum(["APPROVED", "DENIED"]),
      reason: z.string().describe("Brief reason for the decision"),
    }),
    execute: async ({ decision, reason }) => {
      console.log(`\n\nDecision: ${decision}, Reason: ${reason}\n\n`);

      if (decision === "APPROVED") {
        try {
          // Set a high daily limit to allow the transaction
          await setUserDailyLimit(10_000);
          console.log("Unblocking card, redirecting to dashboard");
          return {
            status: "success",
            message: "Card temporarily unblocked for this transaction.",
          };
          // Return decision as a system message string
        } catch (error) {
          console.error("Failed to update unblock status:", error);
        }
      }
      return {
        status: "error",
        message: "Failed to unblock card. Reason: " + reason,
      };
    },
  }),
};

// Define the system message function that incorporates limit details
const getSystemMessage = (
  limitDetails: SelectBudgetLimit | null,
  allCategories: string[],
  transactions: Record<string, string | Date | unknown>[],
  currentTransaction: Record<string, string | Date | unknown>,
  strictnessLevel: string | null,
): CoreMessage => {
  return {
    role: "system",
    content: !!limitDetails
      ? convincingPrompt(
          {
            id: limitDetails.id,
            title: limitDetails.title,
            amount: limitDetails.amount,
            currentUsage: limitDetails.currentUsage.toString(),
            strictnessLevel: limitDetails.strictnessLevel.toString(),
          },
          allCategories,
          transactions,
          currentTransaction,
          strictnessLevel,
        )
      : "",
  };
};

export async function POST(req: NextRequest) {
  try {
    const { messages, limitId }: { messages: Message[]; limitId?: string } = await req.json();

    const allLimits = await getBudgetLimits();
    const allCategories = allLimits.map((limit) => limit.category) ?? [];
    const allTransactions = await getAllTransactions();
    const lastTransaction = allTransactions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

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
    const systemPrompt = getSystemMessage(
      limitDetails,
      allCategories,
      allTransactions,
      lastTransaction,
      limitDetails?.strictnessLevel?.toString() ?? "5",
    );

    // Add the system message to the beginning of the message history
    const messagesWithSystemPrompt = [
      systemPrompt,
      ...messages.filter((m) => m.role !== "system"), // Filter out any existing system messages
    ] as Message[];

    return createDataStreamResponse({
      execute: async (dataStream) => {
        const result = await streamText({
          model: openai("gpt-4.1"),
          messages: messagesWithSystemPrompt,
          temperature: 0.7,
          tools,
          maxSteps: 3, // Allow multiple steps for a conversational flow
          onStepFinish: async ({ text, toolCalls, toolResults, finishReason }) => {
            console.log({ text, toolCalls, toolResults, finishReason });

            if (toolCalls.length > 0) {
              const toolCall = toolCalls[0];
              const toolResult = toolResults[0];
              console.log({ toolCall, toolResult });
              if (toolCall.toolName === "makeTransactionDecision") {
                await setTimeout(1000);
                redirect("/dashboard");
              }
            }

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
