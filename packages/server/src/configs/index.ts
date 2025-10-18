export const configs = {
  basePath: process.env.BASE_PATH || "/todo",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://username:password@localhost:9999/formserver",
};
