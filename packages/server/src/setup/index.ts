import { proxyFe } from "@/setup/proxyFe";
import { registRoutes } from "@/setup/registRoutes";
import { serveApp } from "@/setup/serveApp";
import type { Hono } from "hono";

export async function setupApp(app: Hono) {
  await registRoutes(app);
  proxyFe(app);
  serveApp(app);
}
