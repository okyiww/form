import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db";
export async function dbMigrate() {
  try {
    await migrate(db, {
      migrationsFolder: "drizzle",
    });
  } catch (error) {
    console.log("Database migration failed", error);
  }
}
