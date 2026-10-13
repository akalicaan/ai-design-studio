import { z } from "zod";
import { sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pricingPlans } from "../db/schema";

export const pricingRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const plans = await db
      .select()
      .from(pricingPlans)
      .where(sql`${pricingPlans.isActive} = 1`)
      .orderBy(pricingPlans.sortOrder);
    return plans;
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [plan] = await db
        .select()
        .from(pricingPlans)
        .where(sql`${pricingPlans.slug} = ${input.slug}`)
        .limit(1);
      return plan ?? null;
    }),
});
