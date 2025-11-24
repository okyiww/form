import { drizzle } from "drizzle-orm/node-postgres";
import { configs } from "../configs";
import * as schema from "./schema";

export const db = drizzle({
  connection: {
    connectionString: configs.databaseUrl,
    ssl: false,
  },
  schema,
});
