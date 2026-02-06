import path from "path";
import { readFileSync, existsSync } from "fs";

// 加载 .env.development（本地开发时）
const envFile = path.resolve(process.cwd(), ".env.development");
if (existsSync(envFile)) {
  const content = readFileSync(envFile, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export const configs = {
  env: process.env.ENV || "development",
  port: process.env.PORT || 3000,
  basePath: process.env.BASE_PATH || "/form-playground",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://username:password@localhost:9999/formserver",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "secret",
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  authBasePath: process.env.AUTH_BASE_PATH || "",

  // AI Chat (OneAPI compatible)
  aiApiBase: process.env.AI_API_BASE || "https://oneapi.okyiww.com/v1",
  aiApiKey: process.env.AI_API_KEY || "",
  aiModel: process.env.AI_MODEL || "gpt-4",
};
