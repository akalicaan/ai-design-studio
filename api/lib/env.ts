import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: process.env.APP_ID ?? "",
  appSecret: process.env.APP_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: process.env.JWT_SECRET ?? "change-me-in-production-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "change-me-in-production-refresh-secret",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  replicateApiToken: process.env.REPLICATE_API_TOKEN ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  // Legacy Kimi OAuth (no longer used, kept for compat)
  kimiAuthUrl: process.env.KIMI_AUTH_URL ?? "",
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "",
};
