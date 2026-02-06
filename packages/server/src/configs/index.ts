import path from "path";

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
  aiApiKey:
    process.env.AI_API_KEY ||
    "sk-h6l7C1uamSoHN71420Fa98Df7c3c4574AcFfE4Fb3fFa3727",
  aiModel: process.env.AI_MODEL || "gpt-4",
};
