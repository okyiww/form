import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import type { Hono } from "hono";
import { configs } from "@/configs";
import { username } from "better-auth/plugins";

console.log("configs.betterAuthUrl", configs.betterAuthUrl);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: configs.betterAuthUrl,
  trustedOrigins:
    configs.env === "development" ? ["*"] : ["https://okyiww.com"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  advanced: {
    useSecureCookies: configs.env === "production",
  },
  plugins: [username()],
});

export function setupAuth(app: Hono) {
  app.on(["POST", "GET"], `${configs.basePath}/api/auth/*`, (c) =>
    auth.handler(c.req.raw)
  );
}
