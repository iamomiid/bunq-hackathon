"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { BudgetLimitWithTransactions, getLimitDetails, Transaction } from "@/actions/getLimitDetails";

export default function LimitDetailsPage() {
  const { id } = useParams();
  const [limit, setLimit] = useState<BudgetLimitWithTransactions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLimit() {
      try {
        // Ensure id is a string
        const limitId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
        const data = await getLimitDetails(limitId);
        setLimit(data);
      } catch (error) {
        console.error("Error fetching limit details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLimit();
  }, [id]);

  if (!isLoading && !limit) {
    // Only return notFound after we've attempted to load the limit
    return notFound();
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading budget limit...</p>
      </div>
    );
  }

  // At this point, we know limit is not null
  const limitData = limit!;
  const backButton = (
    <Button variant="outline" size="sm" asChild>
      <Link href="/dashboard">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  );

  const percentUsed = Math.round((limitData.currentSpent / limitData.amount) * 100);

  return (
    <>
      <PageHeader title={`${limitData.category} Budget Limit`} action={backButton} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{limitData.description}</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Budget Amount:</span>
                <span className="font-bold">€{limitData.amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Spent:</span>
                <span className="font-bold">€{limitData.currentSpent.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Remaining:</span>
                <span className="font-bold">€{(limitData.amount - limitData.currentSpent).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Percentage Used:</span>
                <span className="font-bold">{percentUsed}%</span>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${percentUsed > 80 ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${percentUsed}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{limitData.period} budget</span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>{limitData.strictness} strictness</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {limitData.transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No transactions for this budget category yet.</p>
            ) : (
              <div className="space-y-4">
                {limitData.transactions.map((transaction: Transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{transaction.merchant}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <time dateTime={transaction.date}>{new Date(transaction.date).toLocaleDateString()}</time>
                      </div>
                    </div>
                    <span className="font-medium">€{transaction.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
