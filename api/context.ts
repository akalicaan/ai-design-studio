import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "jsonwebtoken";
import { sql } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { users } from "../db/schema";
import { env } from "./lib/env";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: {
    id: number;
    email: string | null;
    name: string | null;
    avatar: string | null;
    role: string;
  };
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    const authHeader = opts.req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = jwt.verify(token, env.jwtSecret) as { userId: number; role: string };

      const db = getDb();
      const rows = await db
        .select()
        .from(users)
        .where(sql`${users.id} = ${payload.userId}`)
        .limit(1);

      if (rows.length > 0) {
        const u = rows[0];
        ctx.user = {
          id: u.id,
          email: u.email,
          name: u.name,
          avatar: u.avatar,
          role: u.role,
        };
      }
    }
  } catch {
    // Authentication is optional here
  }

  return ctx;
}
