import {
  pgTable,
  uuid,
  text,
  decimal,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  apiKey: text("api_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const category = pgTable("category", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  userId: uuid("user_id").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgetLimit = pgTable("budget_limit", {
  id: uuid("id").primaryKey(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").default("month").notNull(),
  strictnessLevel: integer("strictness_level").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transaction = pgTable("transaction", {
  id: uuid("id").primaryKey(),
  budgetLimit: uuid("budget_limit").references(() => budgetLimit.id),
  json: jsonb("json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
