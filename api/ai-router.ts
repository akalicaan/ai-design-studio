import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { env } from "./lib/env";

// Replicate model mappings - best price/performance
// bg_remove: 851-labs/background-remover - $0.00044/run, fastest
// upscale: nightmareai/real-esrgan - $0.002/run, 100M+ runs proven
const REPLICATE_MODELS: Record<string, string> = {
  bg_remove: "851-labs/background-remover:e1eb941d9c177f7582a0ce1740dee9a2d861bb1ab5e81af393c91e1c8a82f09f",
  upscale: "nightmareai/real-esrgan:f121d920bd57277f1e962f2254c44f698fe9760c9469f72ea63c9483d61f8bf6",
  vectorize: "", // server-side potrace
};

interface ReplicatePrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: any;
  error?: string;
}

async function createReplicatePrediction(
  model: string,
  input: Record<string, any>
): Promise<ReplicatePrediction> {
  if (!env.replicateApiToken) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${env.replicateApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: model.split(":")[1],
      input,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate API error: ${err}`);
  }

  return res.json() as Promise<ReplicatePrediction>;
}

async function getReplicatePrediction(id: string): Promise<ReplicatePrediction> {
  if (!env.replicateApiToken) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: {
      Authorization: `Token ${env.replicateApiToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate API error: ${err}`);
  }

  return res.json() as Promise<ReplicatePrediction>;
}

// Poll until completion (with timeout)
async function pollPrediction(
  id: string,
  maxAttempts = 60,
  delayMs = 2000
): Promise<ReplicatePrediction> {
  for (let i = 0; i < maxAttempts; i++) {
    const pred = await getReplicatePrediction(id);
    if (pred.status === "succeeded" || pred.status === "failed" || pred.status === "canceled") {
      return pred;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("Prediction timed out");
}

export const aiRouter = createRouter({
  // Process an image with AI
  process: authedQuery
    .input(
      z.object({
        toolType: z.enum(["vectorize", "bg_remove", "upscale"]),
        imageUrl: z.string().url(),
        precision: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const model = REPLICATE_MODELS[input.toolType];
      if (!model) {
        throw new Error(`Unknown tool type: ${input.toolType}`);
      }

      // Build input based on tool type
      let replicateInput: Record<string, any> = {};

      switch (input.toolType) {
        case "bg_remove":
          replicateInput = { image: input.imageUrl };
          break;
        case "upscale":
          replicateInput = { image: input.imageUrl, scale: 4 };
          break;
        case "vectorize":
          replicateInput = { image: input.imageUrl, mode: input.precision ? "precision" : "standard" };
          break;
      }

      const prediction = await createReplicatePrediction(model, replicateInput);
      const result = await pollPrediction(prediction.id);

      if (result.status === "failed" || result.status === "canceled") {
        throw new Error(result.error ?? "AI processing failed");
      }

      // Replicate returns output as a URL or array of URLs
      const outputUrl = Array.isArray(result.output)
        ? result.output[0]
        : result.output;

      return {
        success: true,
        outputUrl,
        predictionId: prediction.id,
      };
    }),

  // Check prediction status (for polling from frontend)
  status: authedQuery
    .input(z.object({ predictionId: z.string() }))
    .query(async ({ input }) => {
      const pred = await getReplicatePrediction(input.predictionId);
      return {
        status: pred.status,
        output: pred.output,
        error: pred.error,
      };
    }),
});
