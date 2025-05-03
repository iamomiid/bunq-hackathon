import { pgTable, uuid, text, decimal, timestamp, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  apiKey: text("api_key").notNull(),
  accountId: text("account_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  categories: many(category),
  budgetLimits: many(budgetLimit),
}));

export const category = pgTable("category", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  userId: uuid("user_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoryRelations = relations(category, ({ one }) => ({
  user: one(user, {
    fields: [category.userId],
    references: [user.id],
  }),
}));

export const budgetLimit = pgTable("budget_limit", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => user.id),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").default("month").notNull(),
  strictnessLevel: integer("strictness_level").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  title: text("title"),
});

export const budgetLimitRelations = relations(budgetLimit, ({ one, many }) => ({
  user: one(user, {
    fields: [budgetLimit.userId],
    references: [user.id],
  }),
  transactionsToBudgetLimits: many(transactionToBudgetLimit),
}));

export const transaction = pgTable("transaction", {
  id: uuid("id").primaryKey(),
  json: jsonb("json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionRelations = relations(transaction, ({ many }) => ({
  transactionsToBudgetLimits: many(transactionToBudgetLimit),
}));

export const transactionToBudgetLimit = pgTable(
  "transaction_to_budget_limit",
  {
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transaction.id),
    budgetLimitId: uuid("budget_limit_id")
      .notNull()
      .references(() => budgetLimit.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.transactionId, t.budgetLimitId] }),
  }),
);

export const transactionToBudgetLimitRelations = relations(transactionToBudgetLimit, ({ one }) => ({
  transaction: one(transaction, {
    fields: [transactionToBudgetLimit.transactionId],
    references: [transaction.id],
  }),
  budgetLimit: one(budgetLimit, {
    fields: [transactionToBudgetLimit.budgetLimitId],
    references: [budgetLimit.id],
  }),
}));
