import { sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { budgetLimit, transaction, transactionToBudgetLimit } from "./tables";
import { alias } from "drizzle-orm/pg-core";

// Define the view using SQL builder directly without db instance
export const budgetLimitsWithUsage = pgView("budget_limits_with_usage").as((qb) => {
  const t = alias(transaction, "t"); // Alias the transaction table as 't'

  // Define the monthly sums CTE
  const monthlySumsSubquery = qb.$with("monthly_sums").as(
    qb
      .select({
        budgetLimitId: transactionToBudgetLimit.budgetLimitId,
        // Use explicit casting and SUM aggregate function, referencing the alias 't'
        totalUsage: sql<number>`SUM(
            CAST(
              CASE 
                WHEN (${t.json}->'NotificationUrl'->'object'->'Payment'->'amount'->>'value') IS NOT NULL 
                AND (${t.json}->'NotificationUrl'->'object'->'Payment'->'amount'->>'value')::text ~ '^-?[0-9]+(\.[0-9]+)?$'
                THEN (${t.json}->'NotificationUrl'->'object'->'Payment'->'amount'->>'value')::numeric 
                ELSE 0 
              END AS numeric
            )
          )`.as("total_usage"),
      })
      .from(transactionToBudgetLimit)
      // Use the aliased table in the join
      .innerJoin(t, sql`${t.id} = ${transactionToBudgetLimit.transactionId}`)
      .where(
        // Reference the alias 't' in the where clause
        sql`EXTRACT(MONTH FROM ${t.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM ${t.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      )
      .groupBy(transactionToBudgetLimit.budgetLimitId),
  );

  return (
    qb
      .with(monthlySumsSubquery) // Include the CTE in the main query
      .select({
        id: budgetLimit.id,
        userId: budgetLimit.userId,
        category: budgetLimit.category,
        amount: budgetLimit.amount,
        period: budgetLimit.period,
        strictnessLevel: budgetLimit.strictnessLevel,
        createdAt: budgetLimit.createdAt,
        title: budgetLimit.title,
        // Use COALESCE to default to 0 if no matching sum is found
        currentUsage: sql<number>`ABS(COALESCE(${monthlySumsSubquery.totalUsage}, 0))`.as("current_usage"),
      })
      .from(budgetLimit)
      // Left join the budget limits with the pre-calculated monthly sums
      .leftJoin(monthlySumsSubquery, sql`${budgetLimit.id} = ${monthlySumsSubquery.budgetLimitId}`)
  );
});
export type SelectBudgetLimit = typeof budgetLimitsWithUsage.$inferSelect;
