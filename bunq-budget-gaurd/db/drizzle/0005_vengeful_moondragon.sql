DROP VIEW "public"."budget_limits_with_usage";--> statement-breakpoint
CREATE VIEW "public"."budget_limits_with_usage" AS (select "id", "user_id", "category", "amount", "period", "strictness_level", "created_at", "title", 
    COALESCE(
      (
        SELECT SUM(
          CAST(
            CASE 
              WHEN (t.json->'NotificationUrl'->'object'->'Payment'->'amount'->>'value') IS NOT NULL 
              AND (t.json->'NotificationUrl'->'object'->'Payment'->'amount'->>'value')::text ~ '^-?[0-9]+(.[0-9]+)?$'
              THEN (t.json->'NotificationUrl'->'object'->'Payment'->'amount'->>'value')::numeric 
              ELSE 0 
            END AS numeric
          )
        )
        FROM "transaction" t
        JOIN "transaction_to_budget_limit" ttb ON t.id = ttb.transaction_id
        WHERE 
          ttb.budget_limit_id = "id"
          AND EXTRACT(MONTH FROM t.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM t.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      ),
      '0'
    )::numeric
   as "current_usage" from "budget_limit");