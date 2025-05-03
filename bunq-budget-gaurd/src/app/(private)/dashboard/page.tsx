"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

// Mock data for budget limits - this would be fetched from your API/database
const initialBudgetLimits = [
  {
    id: "1",
    description: "Limit spending on groceries to €200 per month",
    category: "Groceries",
    amount: 200,
    period: "Monthly",
    currentSpent: 120,
    strictness: "Moderate",
  },
  {
    id: "2",
    description: "Don't spend more than €50 on takeaways this week",
    category: "Food & Dining",
    amount: 50,
    period: "Weekly",
    currentSpent: 35,
    strictness: "Strict",
  },
  {
    id: "3",
    description: "Keep entertainment expenses under €100 this month",
    category: "Entertainment",
    amount: 100,
    period: "Monthly",
    currentSpent: 45,
    strictness: "Flexible",
  },
];

export default function Dashboard() {
  const [budgetLimits, setBudgetLimits] = useState(initialBudgetLimits);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteLimit = (id: string) => {
    // In a real app, this would call your API to delete the limit
    setBudgetLimits(budgetLimits.filter(limit => limit.id !== id));
    setDeleteConfirmId(null);
  };

  const actionButton = (
    <Button asChild>
      <Link href="/dashboard/create-limit">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Limit
      </Link>
    </Button>
  );

  return (
    <>
      <PageHeader title="Budget Limits" action={actionButton} />
      
      {budgetLimits.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No budget limits yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first budget limit to start tracking your spending
          </p>
          <Button asChild>
            <Link href="/dashboard/create-limit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Limit
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgetLimits.map((limit) => (
            <Card key={limit.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{limit.category}</CardTitle>
                <CardDescription className="line-clamp-2">{limit.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {limit.period} limit: €{limit.amount.toFixed(2)}
                  </p>
                  <p className="text-sm font-medium mb-1">
                    Spent: €{limit.currentSpent.toFixed(2)}
                  </p>
                  <p className="text-sm font-medium mb-2">
                    Remaining: €{(limit.amount - limit.currentSpent).toFixed(2)}
                  </p>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(limit.currentSpent / limit.amount) * 100}%` }}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDeleteConfirmId(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteLimit(limit.id)}
                    >
                      Confirm
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setDeleteConfirmId(limit.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
} 