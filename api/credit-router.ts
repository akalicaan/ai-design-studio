import { z } from "zod";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm/sql/expressions/select";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { credits, creditTransactions } from "../db/schema";

export const creditRouter = createRouter({
  // Get current user's credit balance
  balance: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [credit] = await db
      .select()
      .from(credits)
      .where(sql`${credits.userId} = ${ctx.user.id}`)
      .limit(1);
    return credit ?? { balance: 0, totalEarned: 0, totalSpent: 0 };
  }),

  // Get transaction history
  history: authedQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const txs = await db
        .select()
        .from(creditTransactions)
        .where(sql`${creditTransactions.userId} = ${ctx.user.id}`)
        .orderBy(desc(creditTransactions.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return txs;
    }),

  // Spend credits (called internally by project router)
  spend: authedQuery
    .input(
      z.object({
        amount: z.number().min(1),
        description: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check balance
      const [credit] = await db
        .select()
        .from(credits)
        .where(sql`${credits.userId} = ${ctx.user.id}`)
        .limit(1);

      if (!credit || credit.balance < input.amount) {
        throw new Error("Insufficient credits");
      }

      // Deduct credits
      await db
        .update(credits)
        .set({
          balance: credit.balance - input.amount,
          totalSpent: credit.totalSpent + input.amount,
        })
        .where(sql`${credits.userId} = ${ctx.user.id}`);

      // Record transaction
      await db.insert(creditTransactions).values({
        userId: ctx.user.id,
        type: "usage",
        amount: -input.amount,
        description: input.description,
        metadata: input.metadata ?? {},
      });

      return { success: true, remainingBalance: credit.balance - input.amount };
    }),
});
