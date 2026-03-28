import { bigint, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { email } from "zod";

// Account Table
export const AccountTable = pgTable("account", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar().notNull(),
  acc_no: integer().notNull(),
  name: varchar().notNull(),
  institution: varchar().notNull(),
  type: varchar().default("savings"),
  balance: integer().default(0),
  icon: varchar().default("https://imgs.search.brave.com/Egp4rnbyveVsS3JHe4Vs1Qh0G_p87v5xiPAKw3PIxU8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/aWNvbnNjb3V0LmNv/bS9pY29uL3ByZW1p/dW0vcG5nLTI1Ni10/aHVtYi9iYW5rLWlj/b24tc3ZnLWRvd25s/b2FkLXBuZy0xNDk1/MjQzLnBuZz9mPXdl/YnAmdz0xMjg"),
});
export type Account = typeof AccountTable.$inferSelect;
export type NewAccount = typeof AccountTable.$inferInsert;

// Transaction Table
export const TransactionTable = pgTable("transaction", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  acc_no: integer().notNull(),
  amount: integer().notNull(),
  date: varchar().notNull(),
  description: varchar().notNull(),
  category: varchar().notNull(),
});
export type Transaction = typeof TransactionTable.$inferSelect;
export type NewTransaction = typeof TransactionTable.$inferInsert;