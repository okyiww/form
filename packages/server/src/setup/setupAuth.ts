import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import type { Hono } from "hono";
import { configs } from "@/configs";
import { username } from "better-auth/plugins";
import { HTTPException } from "hono/http-exception";

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

  app.use(`${configs.basePath}/api/*`, async (c, next) => {
    const sessionData = await auth.api.getSession({
      headers: c.req.raw.headers, // 必须传入原始 headers
    });

    if (!sessionData) {
      return c.json({ message: "认证已过期，请重新登录" }, 401);
    }

    // c.set("user", sessionData.user);
    // c.set("session", sessionData.session);

    await next();
  });
}
