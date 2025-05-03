"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getBudgetLimits, deleteBudgetLimit } from "../../../../actions/budget-limits";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the budget limit type
interface BudgetLimit {
  id: string;
  description: string;
  category: string;
  amount: number;
  period: string;
  currentUsage: number;
  strictness: string;
  title: string | null;
}

export default function Dashboard({ isAccountLimited }: { isAccountLimited: boolean }) {
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const exceededBudgetLimits = useMemo(() => budgetLimits.filter((bl) => bl.currentUsage > bl.amount), [budgetLimits]);

  console.log("Exceeded budget limits:", exceededBudgetLimits);
  // Fetch budget limits from the database
  useEffect(() => {
    const fetchBudgetLimits = async () => {
      try {
        setIsLoading(true);
        const limits = await getBudgetLimits();
        setBudgetLimits(limits);
        setError(null);
      } catch (error) {
        console.error("Error fetching budget limits:", error);
        setError("Failed to load budget limits");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetLimits();
  }, []);

  const handleDeleteLimit = async (id: string) => {
    try {
      await deleteBudgetLimit(id);
      setBudgetLimits(budgetLimits.filter((limit) => limit.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting budget limit:", error);
      setError("Failed to delete budget limit");
    }
  };

  const actionButton = (
    <Button asChild>
      <Link href="/dashboard/create-limit">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Limit
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <>
        <PageHeader title="Budget Limits" action={actionButton} />
        <div className="flex justify-center items-center py-10">
          <p>Loading budget limits...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Budget Limits" action={actionButton} />
        <div className="bg-destructive/10 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2 text-destructive">Error</h3>
          <p className="mb-4">{error}</p>
          {/* <Button onClick={() => window?.location.reload()}>Try Again</Button> */}
        </div>
      </>
    );
  }

  return (
    <>
      {exceededBudgetLimits.length > 0 &&
        (isAccountLimited ? (
          <Alert variant="destructive" className="border-2 border-red-500 mb-10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How dare you pass your budget limits?</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>
                I have blocked your account! Convince me that your purchase was necessary. Only then you can continue
                using your account.
              </p>
              <div className="flex flex-row w-full justify-between items-end">
                <p>Best regards, The Budget Guard</p>
                <Button variant="outline" size="lg">
                  <Link href={`/dashboard/limit-exceeded/${exceededBudgetLimits[0].id}`}>Try to convince me</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="border-2 border-yellow-500 mb-10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You have passed your budget limits</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>
                Though you have passed your budget limits, since you have convinced me, your account is not blocked now.
                Please be more careful with your spending in the future.
              </p>
              <p>Best regards, The Budget Guard</p>
            </AlertDescription>
          </Alert>
        ))}
      {budgetLimits.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No budget limits yet</h3>
          <p className="text-muted-foreground mb-4">Create your first budget limit to start tracking your spending</p>
          <Button asChild>
            <Link href="/dashboard/create-limit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Limit
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgetLimits.map((limit) => {
            const isLimitExceeded = limit.currentUsage > limit.amount;
            const isUserAccountLimited = isAccountLimited;
            const cardType = isLimitExceeded ? (isUserAccountLimited ? "error" : "warn") : null;
            return (
              <Card
                key={limit.id}
                className={`overflow-hidden ${
                  cardType === "error"
                    ? "border-2 border-red-500"
                    : cardType === "warn"
                    ? "border-2 border-yellow-500"
                    : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{limit.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{limit.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {limit.period} limit: €{limit.amount.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium mb-1">Spent: €{limit.currentUsage.toFixed(2)}</p>
                    <p className={`text-sm font-medium mb-2 ${cardType === "error" ? "text-red-500" : ""}`}>
                      Remaining: €{(limit.amount - limit.currentUsage).toFixed(2)}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          cardType === "error" ? "bg-red-500" : cardType === "warn" ? "bg-yellow-500" : "bg-primary"
                        }`}
                        style={{
                          width: `${(limit.currentUsage / limit.amount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <span className="font-medium">Strictness:</span>
                    <span className="ml-1">{limit.strictness}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-1 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/limits/${limit.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </Link>
                  </Button>
                  {deleteConfirmId === limit.id ? (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteLimit(limit.id)}>
                        Confirm
                      </Button>
                    </div>
                  ) : (
                    <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmId(limit.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
