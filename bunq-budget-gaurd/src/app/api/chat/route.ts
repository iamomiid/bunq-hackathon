import { createOpenAI } from "@ai-sdk/openai";
import { streamText, CoreMessage, createDataStreamResponse, tool, Message } from "ai";
import { NextRequest } from "next/server";
import { setDailyLimit } from "@/actions/daily-limit";
import { getLimitById } from "@/actions/budget-limits";
import { SelectBudgetLimit } from "@/db/schema/views";
import { z } from "zod";
import { convincingPrompt } from "@/prompts/convincing";

const nvidia = createOpenAI({
  baseURL: "https://api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

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
    content: !!limitDetails
      ? convincingPrompt({
          ...limitDetails,
          currentUsage: limitDetails.currentUsage.toString(),
          strictnessLevel: limitDetails.strictnessLevel.toString(),
        })
      : "",
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
          model: nvidia("gpt-4o"),
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
