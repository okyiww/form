import { dbMigrate } from "@/setup/migrate";
import { proxyFe } from "@/setup/proxyFe";
import { registRoutes } from "@/setup/registRoutes";
import { serveApp } from "@/setup/serveApp";
import { setupAuth } from "@/setup/setupAuth";
import { setupCors } from "@/setup/setupCors";
import type { Hono } from "hono";

export async function setupApp(app: Hono) {
  setupCors(app);
  await dbMigrate();
  setupAuth(app);
  await registRoutes(app);

  proxyFe(app);
  serveApp(app);
}
