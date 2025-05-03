CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY NOT NULL,
	"budget_limit" uuid,
	"json" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget_limit" DROP CONSTRAINT "budget_limit_category_category_id_fk";
--> statement-breakpoint
ALTER TABLE "budget_limit" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "budget_limit" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_budget_limit_budget_limit_id_fk" FOREIGN KEY ("budget_limit") REFERENCES "public"."budget_limit"("id") ON DELETE no action ON UPDATE no action;