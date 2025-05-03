CREATE TABLE "transaction_to_budget_limit" (
	"transaction_id" uuid NOT NULL,
	"budget_limit_id" uuid NOT NULL,
	CONSTRAINT "transaction_to_budget_limit_transaction_id_budget_limit_id_pk" PRIMARY KEY("transaction_id","budget_limit_id")
);
--> statement-breakpoint
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_budget_limit_budget_limit_id_fk";
--> statement-breakpoint
ALTER TABLE "budget_limit" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "transaction_to_budget_limit" ADD CONSTRAINT "transaction_to_budget_limit_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_to_budget_limit" ADD CONSTRAINT "transaction_to_budget_limit_budget_limit_id_budget_limit_id_fk" FOREIGN KEY ("budget_limit_id") REFERENCES "public"."budget_limit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_limit" ADD CONSTRAINT "budget_limit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN "budget_limit";