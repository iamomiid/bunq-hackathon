"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

interface BudgetLimit {
  category: string;
  amount: number;
  currency: string;
  period: string;
  strictness: "flexible" | "moderate" | "strict";
}

export default function CreateLimit() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedLimit, setExtractedLimit] = useState<BudgetLimit | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const extractLimitDetails = async (
    description: string
  ): Promise<BudgetLimit> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch("/api/extract-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract limit details");
      }

      const data = await response.json();
      return data.limitDetails;
    } catch (error) {
      console.error("Error extracting limit details:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const saveBudgetLimit = async (): Promise<void> => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/extract-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: input,
          shouldSave: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save budget limit");
      }

      setSuccess("Budget limit saved successfully!");

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving budget limit:", error);
      setError("Failed to save budget limit. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      setError("Please enter a budget limit description");
      return;
    }

    try {
      const limitDetails = await extractLimitDetails(input);
      setExtractedLimit(limitDetails);
      console.log("Extracted limit details:", limitDetails);
    } catch {
      setError(
        "Failed to parse your budget limit. Please try again with a clearer description."
      );
    }
  };

  const backButton = (
    <Button variant="outline" size="sm" asChild>
      <Link href="/dashboard">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader title="Create Budget Limit" action={backButton} />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Budget Limit</CardTitle>
          <CardDescription>
            Describe your budget limit in natural language and our AI will
            interpret it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="limitDescription"
                  className="text-sm font-medium block mb-1"
                >
                  Describe your budget limit
                </label>
                <div className="space-y-2">
                  <Input
                    id="limitDescription"
                    placeholder="e.g., Limit spending on groceries to €200 per month"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-24"
                  />
                  <p className="text-sm text-muted-foreground">
                    Examples: &ldquo;Don&apos;t spend more than €50 on takeaways
                    this week&rdquo;, &ldquo;Keep entertainment expenses under
                    €100 this month&rdquo;
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {extractedLimit && (
                <Alert>
                  <AlertTitle>Extracted Budget Limit</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <p>
                        <strong>Category:</strong> {extractedLimit.category}
                      </p>
                      <p>
                        <strong>Amount:</strong> {extractedLimit.currency}
                        {extractedLimit.amount}
                      </p>
                      <p>
                        <strong>Time Period:</strong> {extractedLimit.period}
                      </p>
                      <p>
                        <strong>Strictness:</strong> {extractedLimit.strictness}
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Extract Limit"
            )}
          </Button>

          {extractedLimit && (
            <Button
              onClick={saveBudgetLimit}
              className="w-full"
              disabled={isSaving}
              variant="default"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Budget Limit"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
