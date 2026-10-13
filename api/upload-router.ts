import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

// R2 / S3 client - uses environment variables or falls back to a placeholder config
const s3Client = new S3Client({
  region: process.env.R2_REGION ?? "auto",
  endpoint: process.env.R2_ENDPOINT ?? undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "ai-design-studio";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

export const uploadRouter = createRouter({
  // Get a presigned URL for direct upload from browser
  getPresignedUrl: authedQuery
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string().default("image/png"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ext = input.filename.split(".").pop() ?? "png";
      const key = `uploads/${ctx.user.id}/${nanoid(16)}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: input.contentType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      // Construct public URL for the uploaded file
      const publicUrl = PUBLIC_URL
        ? `${PUBLIC_URL}/${key}`
        : signedUrl.split("?")[0]; // fallback

      return {
        signedUrl,
        publicUrl,
        key,
      };
    }),

  // For MVP without R2 configured: return a base64-safe upload endpoint
  // In production, use the presigned URL above
  getUploadConfig: authedQuery.query(() => {
    const hasR2 = !!(
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_ENDPOINT
    );
    return {
      usePresignedUrl: hasR2,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    };
  }),
});
