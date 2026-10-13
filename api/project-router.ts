import { z } from "zod";
import { sql } from "drizzle-orm";
import { desc } from "drizzle-orm/sql/expressions/select";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects, credits, creditTransactions } from "../db/schema";
import { env } from "./lib/env";

// Credit costs per operation
const CREDIT_COSTS: Record<string, number> = {
  vectorize: 1,
  vectorize_precision: 2,
  bg_remove: 1,
  upscale: 2,
  mockup_extract: 2,
  pattern_extract: 3,
  pattern_generate: 2,
};

// Replicate model mappings - using best price/performance models
// BG Remove: 851-labs/background-remover - $0.00044/run, 0.7s, T4 GPU
// Upscale: nightmareai/real-esrgan - $0.002/run, 2.6s, 100M+ runs
// Vectorize: handled server-side with potrace (free, no GPU needed)
const REPLICATE_MODELS: Record<string, string> = {
  bg_remove: "851-labs/background-remover:e1eb941d9c177f7582a0ce1740dee9a2d861bb1ab5e81af393c91e1c8a82f09f",
  upscale: "nightmareai/real-esrgan:f121d920bd57277f1e962f2254c44f698fe9760c9469f72ea63c9483d61f8bf6",
  vectorize: "", // server-side potrace, no Replicate needed
};

async function createReplicatePrediction(modelWithVersion: string, input: Record<string, any>): Promise<{ id: string }> {
  if (!env.replicateApiToken) {
    throw new Error("REPLICATE_API_TOKEN not configured. Add it to your environment variables.");
  }
  const version = modelWithVersion.split(":")[1];
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${env.replicateApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate error: ${err}`);
  }
  return res.json() as Promise<{ id: string }>;
}

async function getReplicatePrediction(id: string) {
  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Token ${env.replicateApiToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch prediction");
  return res.json() as Promise<{ status: string; output: any; error?: string }>;
}

async function pollPrediction(id: string, maxAttempts = 60, delayMs = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const pred = await getReplicatePrediction(id);
    if (["succeeded", "failed", "canceled"].includes(pred.status)) return pred;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("AI processing timed out");
}

export const projectRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(projects)
        .where(sql`${projects.userId} = ${ctx.user.id}`)
        .orderBy(desc(projects.createdAt))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);
    }),

  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [project] = await db
        .select()
        .from(projects)
        .where(sql`${projects.id} = ${input.id}`)
        .limit(1);
      if (!project || project.userId !== ctx.user.id) throw new Error("Project not found");
      return project;
    }),

  // Create project + deduct credits + run AI
  create: authedQuery
    .input(
      z.object({
        name: z.string().optional(),
        toolType: z.enum(["vectorize", "bg_remove", "upscale", "mockup_extract"]),
        precision: z.boolean().optional().default(false),
        inputUrl: z.string().url(),
        settings: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const costKey = input.toolType === "vectorize" && input.precision
        ? "vectorize_precision"
        : input.toolType;
      const creditsNeeded = CREDIT_COSTS[costKey] ?? 1;

      // Check balance
      const [credit] = await db
        .select()
        .from(credits)
        .where(sql`${credits.userId} = ${ctx.user.id}`)
        .limit(1);

      if (!credit || credit.balance < creditsNeeded) {
        throw new Error(`Insufficient credits. Need ${creditsNeeded}, have ${credit?.balance ?? 0}`);
      }

      // Deduct credits
      await db
        .update(credits)
        .set({
          balance: credit.balance - creditsNeeded,
          totalSpent: credit.totalSpent + creditsNeeded,
        })
        .where(sql`${credits.userId} = ${ctx.user.id}`);

      // Record transaction
      await db.insert(creditTransactions).values({
        userId: ctx.user.id,
        type: "usage",
        amount: -creditsNeeded,
        description: `AI ${input.toolType}`,
        metadata: { toolType: input.toolType },
      });

      // Create project
      const [project] = await db.insert(projects).values({
        userId: ctx.user.id,
        name: input.name ?? `Untitled ${input.toolType}`,
        toolType: input.toolType,
        status: "processing",
        inputUrl: input.inputUrl,
        creditsUsed: creditsNeeded,
        settings: { precision: input.precision, ...input.settings },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).$returningId();

      // Run AI (if token configured)
      let outputUrl: string | null = null;
      let status: "completed" | "failed" = "completed";
      let errorMsg: string | null = null;

      if (env.replicateApiToken && input.toolType !== "mockup_extract") {
        try {
          const model = REPLICATE_MODELS[input.toolType];
          if (model) {
            let repInput: Record<string, any> = {};
            switch (input.toolType) {
              case "bg_remove": repInput = { image: input.inputUrl }; break;
              case "upscale": repInput = { image: input.inputUrl, scale: 4 }; break;
              case "vectorize": repInput = { image: input.inputUrl }; break;
            }

            const pred = await createReplicatePrediction(model, repInput);
            const result = await pollPrediction(pred.id);

            if (result.status === "succeeded") {
              outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            } else {
              status = "failed";
              errorMsg = result.error ?? "AI processing failed";
            }
          }
        } catch (e: any) {
          status = "failed";
          errorMsg = e.message ?? "AI processing error";
        }
      } else if (!env.replicateApiToken) {
        // Demo mode: mark as completed with placeholder
        status = "completed";
        outputUrl = input.inputUrl; // echo back for demo
      }

      // Update project with result
      await db
        .update(projects)
        .set({
          status,
          ...(outputUrl ? { outputUrl } : {}),
          ...(errorMsg ? { settings: sql`JSON_SET(${projects.settings}, '$.error', ${errorMsg})` } : {}),
        })
        .where(sql`${projects.id} = ${project.id}`);

      return {
        success: status === "completed",
        projectId: project.id,
        status,
        outputUrl,
        error: errorMsg,
        creditsUsed: creditsNeeded,
      };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [project] = await db
        .select()
        .from(projects)
        .where(sql`${projects.id} = ${input.id}`)
        .limit(1);
      if (!project || project.userId !== ctx.user.id) throw new Error("Project not found");
      await db.delete(projects).where(sql`${projects.id} = ${input.id}`);
      return { success: true };
    }),
});
