import { configs } from "@/configs";
import fs from "fs/promises";
import type { Hono } from "hono";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function* walkDir(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

export async function registRoutes(app: Hono) {
  app.basePath("/api");
  const modulesDir = path.join(__dirname, "../modules");

  for await (const file of walkDir(modulesDir)) {
    if (/controller\.(ts|js)$/.test(file)) {
      const module = await import(file);
      app.route("/", module.default);
    }
  }
}
