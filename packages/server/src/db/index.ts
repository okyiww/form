import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { configs } from "../configs";

export const db = drizzle({
	connection: {
		connectionString: configs.databaseUrl,
		ssl: true,
	},
});
