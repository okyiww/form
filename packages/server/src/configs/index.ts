import path from "path";

export const configs = {
  env: process.env.ENV || "development",
  port: process.env.PORT || 3000,
  basePath: process.env.BASE_PATH || "/form-playground",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://username:password@localhost:9999/formserver",
};
