import { configs } from "@/configs";
import type { Hono } from "hono";
import { cors } from "hono/cors";

export function setupCors(app: Hono) {
  app.use(
    `${configs.basePath}/api/*`,
    cors({
      origin: (origin) => origin,
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );
}
