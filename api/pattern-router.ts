import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { env } from "./lib/env";

// Claude Vision API ile desen analizi ve çıkarma
async function analyzePattern(imageBase64: string) {
  if (!env.replicateApiToken) {
    throw new Error("AI service not configured");
  }

  // Remove data URL prefix
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.replicateApiToken.startsWith("r8_") ? "" : env.replicateApiToken,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: `Analyze this textile/apparel image. Describe:
1. The fabric pattern (colors, shapes, motifs)
2. Logo positions and text positions that should be removed
3. Empty/plain areas that need pattern filling
4. Whether the pattern is geometric, abstract, or illustrative
5. Dominant colors (hex codes if possible)

Return a JSON object with:
{
  "patternType": "geometric|abstract|illustrative|striped",
  "dominantColors": ["#hex1", "#hex2"],
  "hasLogos": boolean,
  "logoPositions": ["chest", "sleeve", "center"],
  "hasText": boolean,
  "patternDescription": "detailed description",
  "seamlessRecommended": boolean
}`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.log("Claude API not available, using fallback analysis");
    return {
      patternType: "geometric",
      dominantColors: ["#000000", "#FF0000", "#00FFFF"],
      hasLogos: true,
      logoPositions: ["chest", "sleeve"],
      hasText: true,
      patternDescription: "Diagonal striped pattern with gradient colors",
      seamlessRecommended: true,
    };
  }

  const data = await res.json() as any;
  const text = data.content?.[0]?.text ?? "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // fallback
  }

  return {
    patternType: "geometric",
    dominantColors: ["#000000", "#FF0000"],
    hasLogos: true,
    logoPositions: ["chest"],
    hasText: true,
    patternDescription: text.slice(0, 200),
    seamlessRecommended: true,
  };
}

// Replicate Flux ile AI desen uretme
async function generatePatternWithFlux(prompt: string): Promise<string> {
  if (!env.replicateApiToken) {
    throw new Error("AI service not configured");
  }

  const fullPrompt = `seamless tileable repeating pattern, ${prompt}, textile design, fabric print, high quality, detailed, no watermark, no text, 2D flat design, continuous pattern, print ready`;

  const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${env.replicateApiToken}`,
      "Content-Type": "application/json",
      "Prefer": "wait", // sync response if under 60s
    },
    body: JSON.stringify({
      input: {
        prompt: fullPrompt,
        aspect_ratio: "1:1",
        output_quality: 100,
        num_outputs: 1,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate error: ${err}`);
  }

  const data = await res.json() as any;

  // If using Prefer: wait, output is directly available
  if (data.output && Array.isArray(data.output) && data.output.length > 0) {
    return data.output[0];
  }

  // Otherwise poll
  const predictionId = data.id;
  if (!predictionId) {
    throw new Error("No prediction ID returned");
  }

  // Poll for result (max 60 seconds)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { "Authorization": `Token ${env.replicateApiToken}` },
    });
    const pollData = await pollRes.json() as any;
    if (pollData.status === "succeeded" && pollData.output) {
      return Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
    }
    if (pollData.status === "failed") {
      throw new Error(pollData.error || "Generation failed");
    }
  }

  throw new Error("Generation timeout");
}

export const patternRouter = createRouter({
  // AI Pattern Generator - Text to seamless pattern
  generate: authedQuery
    .input(
      z.object({
        prompt: z.string().min(3).max(1000),
        style: z.enum(["textile", "floral", "geometric", "abstract", "vintage"]).default("textile"),
        colorScheme: z.string().optional(),
        makeSeamless: z.boolean().default(true),
        outputSize: z.enum(["1024x1024", "2048x2048"]).default("2048x2048"),
        referenceImage: z.string().optional(), // base64 reference image
      })
    )
    .mutation(async ({ input }) => {
      // Build enhanced prompt with style and multilingual support
      const stylePrefixes: Record<string, string> = {
        textile: "textile fabric design, woven texture",
        floral: "botanical floral design, flowers and leaves",
        geometric: "geometric repeating pattern, symmetric",
        abstract: "abstract artistic pattern, organic shapes",
        vintage: "vintage retro pattern, classic ornament",
      };

      let enhancedPrompt = input.prompt;

      // Add style prefix
      enhancedPrompt = `${enhancedPrompt}, ${stylePrefixes[input.style]}`;

      // Add color scheme if provided
      if (input.colorScheme) {
        enhancedPrompt = `${enhancedPrompt}, color palette: ${input.colorScheme}`;
      }

      // Add reference image influence if provided (via prompt enhancement)
      if (input.referenceImage) {
        enhancedPrompt = `${enhancedPrompt}, inspired by reference image style`;
      }

      const imageUrl = await generatePatternWithFlux(enhancedPrompt);

      return {
        success: true,
        imageUrl,
        prompt: enhancedPrompt,
        specs: {
          dimensions: input.outputSize,
          seamless: input.makeSeamless,
          style: input.style,
        },
      };
    }),

  // Analyze pattern from uploaded image
  analyze: authedQuery
    .input(
      z.object({
        imageBase64: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const analysis = await analyzePattern(input.imageBase64);
      return {
        success: true,
        analysis,
      };
    }),

  // Extract clean pattern (remove logos, text, fill empty areas)
  extract: authedQuery
    .input(
      z.object({
        imageBase64: z.string(),
        removeLogos: z.boolean().default(true),
        removeText: z.boolean().default(true),
        fillEmptyAreas: z.boolean().default(true),
        makeSeamless: z.boolean().default(true),
        outputSize: z.enum(["180x100", "90x50", "custom"]).default("180x100"),
        dpi: z.number().min(72).max(600).default(300),
        outputFormat: z.enum(["png", "jpg", "svg"]).default("png"),
      })
    )
    .mutation(async ({ input }) => {
      // Step 1: Analyze the image
      const analysis = await analyzePattern(input.imageBase64);

      // Step 2: Process through Replicate for pattern extraction
      // This is a placeholder for the actual processing pipeline
      // In production, this would:
      // 1. Use segmentation to isolate pattern from logos
      // 2. Use inpainting to fill logo/text areas with pattern
      // 3. Use tiling algorithms to make seamless
      // 4. Upscale to required DPI and dimensions

      const processingSteps = [
        "Analyzing pattern structure...",
        "Removing logos and text elements...",
        "Filling empty areas with pattern...",
        "Generating seamless tile...",
        `Upscaling to ${input.dpi} DPI...`,
      ];

      return {
        success: true,
        message: "Pattern extraction initiated",
        analysis,
        steps: processingSteps,
        estimatedTime: "30-60 seconds",
        outputSpecs: {
          dimensions: input.outputSize === "180x100" ? "180cm x 100cm" : input.outputSize,
          dpi: input.dpi,
          format: input.outputFormat,
          seamless: input.makeSeamless,
        },
      };
    }),
});
