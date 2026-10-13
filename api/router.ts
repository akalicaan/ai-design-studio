import { authRouter } from "./auth-router";
import { pricingRouter } from "./pricing-router";
import { creditRouter } from "./credit-router";
import { projectRouter } from "./project-router";
import { uploadRouter } from "./upload-router";
import { aiRouter } from "./ai-router";
import { patternRouter } from "./pattern-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  pricing: pricingRouter,
  credit: creditRouter,
  project: projectRouter,
  upload: uploadRouter,
  ai: aiRouter,
  pattern: patternRouter,
});

export type AppRouter = typeof appRouter;
