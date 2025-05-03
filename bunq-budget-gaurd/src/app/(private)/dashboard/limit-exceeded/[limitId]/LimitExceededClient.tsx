"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { SelectBudgetLimit } from "@/db/schema/views";
import ReactMarkdown from "react-markdown";

interface LimitExceededClientProps {
  limitDetails: SelectBudgetLimit;
  isAccountLimited: boolean;
}

export default function LimitExceededClient({ limitDetails, isAccountLimited }: LimitExceededClientProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat with the limitId
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    // Pass the limitId to the API
    body: {
      limitId: limitDetails.id,
    },
  });

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container mx-auto px-4 flex h-[calc(100vh-9rem)]">
      {/* Left column - Limit details */}
      <div className="w-1/3 pr-4">
        <h1 className="text-2xl font-bold mb-4">Limit Exceeded</h1>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">{limitDetails.title || limitDetails.category}</h2>
          <div className="grid grid-cols-1 gap-4 mt-3">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-600 font-medium">Limit</p>
              <p className="text-lg">{Number(limitDetails.amount).toFixed(2)} EUR</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-600 font-medium">Current Spending</p>
              <p className="text-lg">{Number(limitDetails.currentUsage).toFixed(2)} EUR</p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-600 font-medium">Exceeded By</p>
              <p className={`text-lg ${isAccountLimited ? "text-red-600" : "text-yellow-600"} font-medium`}>
                {(Number(limitDetails.currentUsage) - Number(limitDetails.amount)).toFixed(2)} EUR
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-600 font-medium">Strictness</p>
              <p className="text-lg">{limitDetails.strictnessLevel}</p>
            </div>
          </div>
          <div
            className={`mt-4 p-3 rounded-lg font-medium ${
              isAccountLimited ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isAccountLimited ? "Your card is currently blocked." : "Your card has been temporarily unblocked."}
          </div>
        </div>
      </div>

      {/* Right column - Chat UI */}
      <div className="w-2/3 pl-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">AI Agent Chat</h2>

        {/* Chat messages */}
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto mb-4 border rounded-lg p-4 space-y-4 bg-gray-50"
        >
          {messages.length > 0 ? (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`whitespace-pre-wrap p-3 rounded-lg shadow-sm max-w-[80%] ${
                    m.role === "user" ? "bg-blue-500 text-white" : "bg-white border border-gray-200"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none markdown-content dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          p: ({ children, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props}>
                              {children}
                            </p>
                          ),
                          ul: ({ children, ...props }) => (
                            <ul className="list-disc pl-4 mb-2" {...props}>
                              {children}
                            </ul>
                          ),
                          ol: ({ children, ...props }) => (
                            <ol className="list-decimal pl-4 mb-2" {...props}>
                              {children}
                            </ol>
                          ),
                          li: ({ children, ...props }) => (
                            <li className="mb-1" {...props}>
                              {children}
                            </li>
                          ),
                          a: ({ children, ...props }) => (
                            <a className="text-blue-600 hover:underline" {...props}>
                              {children}
                            </a>
                          ),
                          strong: ({ children, ...props }) => (
                            <strong className="font-bold" {...props}>
                              {children}
                            </strong>
                          ),
                          h1: ({ children, ...props }) => (
                            <h1 className="text-xl font-bold mb-2" {...props}>
                              {children}
                            </h1>
                          ),
                          h2: ({ children, ...props }) => (
                            <h2 className="text-lg font-bold mb-2" {...props}>
                              {children}
                            </h2>
                          ),
                          h3: ({ children, ...props }) => (
                            <h3 className="text-base font-bold mb-2" {...props}>
                              {children}
                            </h3>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Chat with the AI agent to justify exceeding the limit.</p>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex items-center space-x-2 max-w-[80%]">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
                <span className="text-gray-500 text-sm">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex">
          <input
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={input}
            placeholder="Explain why you needed to exceed the limit..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`${
              isLoading ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-6 py-3 rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-medium`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
