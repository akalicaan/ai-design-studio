// Legacy Kimi OAuth - no longer used
// Replaced with JWT + Google OAuth + Email auth in api/auth-router.ts

export function createOAuthCallbackHandler() {
  return async (c: any) => {
    return c.json({ error: "Kimi OAuth is disabled. Use /api/trpc/auth.login instead." }, 410);
  };
}

export async function authenticateRequest(headers: Headers) {
  return undefined;
}
