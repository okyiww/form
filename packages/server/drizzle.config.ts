import { defineConfig } from "drizzle-kit";
import { configs } from "./src/configs";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: configs.databaseUrl,
	},
});
