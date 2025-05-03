"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { SelectBudgetLimit } from "@/db/schema/views";

interface LimitExceededClientProps {
  limitDetails: SelectBudgetLimit;
  isAccountLimited: boolean;
}

export default function LimitExceededClient({ limitDetails, isAccountLimited }: LimitExceededClientProps) {
  // Initialize chat with the limitId
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    // Pass the limitId to the API
    body: {
      limitId: limitDetails.id,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-4">Limit Exceeded</h1>

      <div className="mb-4 p-4 bg-red-20 border border-red-200 rounded">
        <h2 className="text-lg font-semibold">{limitDetails.title || limitDetails.category}</h2>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <p className="text-sm text-gray-600">Limit</p>
            <p>{Number(limitDetails.amount).toFixed(2)} EUR</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Spending</p>
            <p>{Number(limitDetails.currentUsage).toFixed(2)} EUR</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Exceeded By</p>
            <p className={`${isAccountLimited ? "text-red-600" : "text-yellow-600"}`}>
              {(Number(limitDetails.currentUsage) - Number(limitDetails.amount)).toFixed(2)} EUR
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Strictness</p>
            <p>{limitDetails.strictnessLevel}</p>
          </div>
        </div>
        <p className={`mt-3 ${isAccountLimited ? "text-red-600" : "text-yellow-600"} font-medium`}>
          {isAccountLimited ? "Your card is currently blocked." : "Your card is has been temporarily unblocked."}
        </p>
      </div>

      {/* Chat UI */}
      <div className="flex-grow overflow-y-auto mb-4 border rounded p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              <div
                className={`p-2 rounded ${
                  m.role === "user" ? "bg-blue-100 text-right ml-auto" : "bg-gray-100 text-left mr-auto"
                }`}
                style={{ maxWidth: "80%" }}
              >
                <span className="font-bold capitalize">{m.role}: </span>
                {m.content}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chat with the AI agent to justify exceeding the limit.</p>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex">
        <input
          className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          placeholder="Explain why you needed to exceed the limit..."
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
