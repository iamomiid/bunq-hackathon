import { sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { budgetLimit, transaction, transactionToBudgetLimit } from "./tables";

// Use a SQL-based approach for creating the view to avoid type errors
export const budgetLimitsWithUsage = pgView("budget_limits_with_usage").as((qb) => {
  const monthlyTransactionSum = sql`
    COALESCE(
      (
        SELECT SUM(
          CAST(
            CASE 
              WHEN (t.json->'NotificationUrl'->'object'->'Payment'->'amount'->>'value') IS NOT NULL 
              AND (t.json->'NotificationUrl'->'object'->'Payment'->'amount'->>'value')::text ~ '^-?[0-9]+(\.[0-9]+)?$'
              THEN (t.json->'NotificationUrl'->'object'->'Payment'->'amount'->>'value')::numeric 
              ELSE 0 
            END AS numeric
          )
        )
        FROM ${transaction} t
        JOIN ${transactionToBudgetLimit} ttb ON t.id = ttb.transaction_id
        WHERE 
          ttb.budget_limit_id = ${budgetLimit.id}
          AND EXTRACT(MONTH FROM t.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM t.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      ),
      '0'
    )::numeric
  `;

  return qb
    .select({
      id: budgetLimit.id,
      userId: budgetLimit.userId,
      category: budgetLimit.category,
      amount: budgetLimit.amount,
      period: budgetLimit.period,
      strictnessLevel: budgetLimit.strictnessLevel,
      createdAt: budgetLimit.createdAt,
      title: budgetLimit.title,
      currentUsage: monthlyTransactionSum.as("current_usage"),
    })
    .from(budgetLimit);
});
