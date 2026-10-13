import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // bcrypt hashed, null for OAuth users
  googleId: varchar("googleId", { length: 255 }).unique(), // Google OAuth ID
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  emailVerified: int("emailVerified").default(0).notNull(), // 0 = false, 1 = true
  authProvider: mysqlEnum("authProvider", ["email", "google"]).default("email").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// Refresh tokens for JWT rotation
export const refreshTokens = mysqlTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  tokenHash: varchar("tokenHash", { length: 255 }).notNull().unique(), // SHA-256 of token
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Credit balance per user (1 credit = 1 standard operation)
export const credits = mysqlTable("credits", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  balance: int("balance").notNull().default(0),
  totalEarned: int("totalEarned").notNull().default(0),
  totalSpent: int("totalSpent").notNull().default(0),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Credit = typeof credits.$inferSelect;
export type InsertCredit = typeof credits.$inferInsert;

// Credit transactions (top-up and spend history)
export const creditTransactions = mysqlTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["purchase", "usage", "refund", "bonus"]).notNull(),
  amount: int("amount").notNull(), // positive for purchase, negative for usage
  description: varchar("description", { length: 255 }),
  metadata: json("metadata"), // payment id, operation details, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

// AI processing projects
export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  name: varchar("name", { length: 255 }),
  toolType: mysqlEnum("toolType", ["vectorize", "bg_remove", "upscale", "mockup_extract"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  inputUrl: text("inputUrl"),
  outputUrl: text("outputUrl"),
  outputUrls: json("outputUrls"), // { svg: "...", png: "...", zip: "..." }
  creditsUsed: int("creditsUsed").notNull().default(0),
  settings: json("settings"), // precision mode, upscale factor, etc.
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Pricing plans (credit packages)
export const pricingPlans = mysqlTable("pricing_plans", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  credits: int("credits").notNull(),
  priceUsd: varchar("priceUsd", { length: 20 }).notNull(),
  priceTry: varchar("priceTry", { length: 20 }),
  description: text("description"),
  features: json("features"),
  isPopular: int("isPopular").default(0).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
});

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;

// Payment records
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  planId: bigint("planId", { mode: "number", unsigned: true }).references(() => pricingPlans.id),
  provider: mysqlEnum("provider", ["paddle", "lemon_squeezy", "iyzico", "manual"]).notNull(),
  providerPaymentId: varchar("providerPaymentId", { length: 255 }),
  amount: varchar("amount", { length: 20 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  creditsAdded: int("creditsAdded").notNull().default(0),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// TODO: Add your tables here. See docs/Database.md for schema examples and patterns.
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
