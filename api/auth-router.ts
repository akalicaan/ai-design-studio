import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, refreshTokens } from "../db/schema";
import { env } from "./lib/env";

// JWT secrets (generate strong ones in production)
const JWT_ACCESS_SECRET = env.jwtSecret || "access-secret-change-in-production";
const JWT_REFRESH_SECRET = env.jwtRefreshSecret || "refresh-secret-change-in-production";

// Token expiry
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_DAYS = 7;

// Rate limiting store (in-memory, use Redis in production)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function checkRateLimit(identifier: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (record && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, message: `Too many attempts. Try again in ${minutesLeft} minutes.` };
  }

  if (record && record.count >= MAX_ATTEMPTS) {
    loginAttempts.set(identifier, { count: record.count, lockedUntil: now + LOCKOUT_MINUTES * 60000 });
    return { allowed: false, message: `Too many attempts. Locked for ${LOCKOUT_MINUTES} minutes.` };
  }

  return { allowed: true };
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  if (!record || record.lockedUntil < now) {
    loginAttempts.set(identifier, { count: 1, lockedUntil: 0 });
  } else {
    loginAttempts.set(identifier, { count: record.count + 1, lockedUntil: record.lockedUntil });
  }
}

function clearAttempts(identifier: string) {
  loginAttempts.delete(identifier);
}

function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign({ userId, role, type: "access" }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ userId, type: "refresh" }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
}

async function hashRefreshToken(token: string): Promise<string> {
  // Simple SHA-256 hash for token storage
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Validate password strength
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters." };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Password must contain an uppercase letter." };
  if (!/[a-z]/.test(password)) return { valid: false, message: "Password must contain a lowercase letter." };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Password must contain a number." };
  return { valid: true };
}

export const authRouter = createRouter({
  // Register with email/password
  register: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email address."),
        password: z.string().min(1, "Password is required."),
        name: z.string().min(1, "Name is required.").max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Validate password
      const pwCheck = validatePassword(input.password);
      if (!pwCheck.valid) {
        return { success: false, error: pwCheck.message };
      }

      // Check if email exists
      const existing = await db
        .select()
        .from(users)
        .where(sql`${users.email} = ${input.email}`)
        .limit(1);

      if (existing.length > 0) {
        return { success: false, error: "Email already registered. Please log in." };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Create user
      const [user] = await db.insert(users).values({
        email: input.email,
        name: input.name,
        passwordHash,
        authProvider: "email",
      });

      if (!user || !user.insertId) {
        return { success: false, error: "Failed to create account." };
      }

      const userId = Number(user.insertId);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(userId, "user");

      // Store refresh token hash
      const tokenHash = await hashRefreshToken(refreshToken);
      await db.insert(refreshTokens).values({
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
        ipAddress: ctx.req?.headers.get("x-forwarded-for") || ctx.req?.headers.get("x-real-ip") || "",
        userAgent: ctx.req?.headers.get("user-agent") || "",
      });

      return {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email: input.email,
          name: input.name,
          role: "user",
        },
      };
    }),

  // Login with email/password
  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email address."),
        password: z.string().min(1, "Password is required."),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const identifier = input.email.toLowerCase();

      // Rate limit check
      const rateLimit = checkRateLimit(identifier);
      if (!rateLimit.allowed) {
        return { success: false, error: rateLimit.message };
      }

      // Find user
      const rows = await db
        .select()
        .from(users)
        .where(sql`${users.email} = ${input.email}`)
        .limit(1);

      if (rows.length === 0) {
        recordFailedAttempt(identifier);
        return { success: false, error: "Invalid email or password." };
      }

      const user = rows[0];

      // Check if user has password (not OAuth-only)
      if (!user.passwordHash) {
        recordFailedAttempt(identifier);
        return { success: false, error: "This account uses Google sign-in. Please use Google login." };
      }

      // Verify password
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        recordFailedAttempt(identifier);
        return { success: false, error: "Invalid email or password." };
      }

      // Clear failed attempts
      clearAttempts(identifier);

      // Update last sign in
      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(sql`${users.id} = ${user.id}`);

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, user.role);

      // Store refresh token hash
      const tokenHash = await hashRefreshToken(refreshToken);
      await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
        ipAddress: ctx.req?.headers.get("x-forwarded-for") || ctx.req?.headers.get("x-real-ip") || "",
        userAgent: ctx.req?.headers.get("user-agent") || "",
      });

      return {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      };
    }),

  // Google OAuth login
  googleLogin: publicQuery
    .input(
      z.object({
        idToken: z.string().min(1, "Google ID token is required."),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify Google ID token
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${input.idToken}`);
      if (!googleRes.ok) {
        return { success: false, error: "Invalid Google token." };
      }
      const googleData = await googleRes.json() as any;

      if (!googleData.email_verified || !googleData.email) {
        return { success: false, error: "Google email not verified." };
      }

      const email = googleData.email;
      const name = googleData.name || email.split("@")[0];
      const avatar = googleData.picture || "";
      const googleId = googleData.sub;

      const db = getDb();

      // Check if user exists
      let rows = await db
        .select()
        .from(users)
        .where(sql`${users.email} = ${email}`)
        .limit(1);

      let userId: number;

      if (rows.length === 0) {
        // Create new user
        const [result] = await db.insert(users).values({
          email,
          name,
          googleId,
          avatar,
          authProvider: "google",
          emailVerified: 1,
        });
        userId = Number(result.insertId);
      } else {
        const user = rows[0];
        userId = user.id;

        // Update Google info if changed
        if (user.googleId !== googleId || user.name !== name || user.avatar !== avatar) {
          await db
            .update(users)
            .set({ googleId, name, avatar, lastSignInAt: new Date() })
            .where(sql`${users.id} = ${userId}`);
        } else {
          await db
            .update(users)
            .set({ lastSignInAt: new Date() })
            .where(sql`${users.id} = ${userId}`);
        }
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(userId, rows[0]?.role || "user");

      // Store refresh token
      const tokenHash = await hashRefreshToken(refreshToken);
      await db.insert(refreshTokens).values({
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
        ipAddress: ctx.req?.headers.get("x-forwarded-for") || ctx.req?.headers.get("x-real-ip") || "",
        userAgent: ctx.req?.headers.get("user-agent") || "",
      });

      return {
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email,
          name,
          avatar,
          role: rows[0]?.role || "user",
        },
      };
    }),

  // Refresh access token
  refresh: publicQuery
    .input(
      z.object({
        refreshToken: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const payload = jwt.verify(input.refreshToken, JWT_REFRESH_SECRET) as { userId: number; type: string };
        if (payload.type !== "refresh") throw new Error("Invalid token type");

        const db = getDb();
        const tokenHash = await hashRefreshToken(input.refreshToken);

        // Check if refresh token exists and is not revoked
        const rows = await db
          .select()
          .from(refreshTokens)
          .where(sql`${refreshTokens.tokenHash} = ${tokenHash}`)
          .limit(1);

        if (rows.length === 0 || rows[0].revokedAt || rows[0].expiresAt < new Date()) {
          return { success: false, error: "Invalid or expired session. Please log in again." };
        }

        // Get user
        const userRows = await db
          .select()
          .from(users)
          .where(sql`${users.id} = ${payload.userId}`)
          .limit(1);

        if (userRows.length === 0) {
          return { success: false, error: "User not found." };
        }

        const user = userRows[0];

        // Generate new tokens (token rotation)
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

        // Revoke old refresh token
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(sql`${refreshTokens.tokenHash} = ${tokenHash}`);

        // Store new refresh token
        const newTokenHash = await hashRefreshToken(newRefreshToken);
        await db.insert(refreshTokens).values({
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
        });

        return {
          success: true,
          accessToken,
          refreshToken: newRefreshToken,
        };
      } catch {
        return { success: false, error: "Invalid session. Please log in again." };
      }
    }),

  // Logout - revoke refresh token
  logout: publicQuery
    .input(
      z.object({
        refreshToken: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.refreshToken) {
        const db = getDb();
        const tokenHash = await hashRefreshToken(input.refreshToken);
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(sql`${refreshTokens.tokenHash} = ${tokenHash}`);
      }
      return { success: true };
    }),

  // Get current user from access token
  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req?.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: number; role: string };
      const db = getDb();
      const rows = await db
        .select()
        .from(users)
        .where(sql`${users.id} = ${payload.userId}`)
        .limit(1);

      if (rows.length === 0) return { user: null };

      const user = rows[0];
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
      };
    } catch {
      return { user: null };
    }
  }),
});
