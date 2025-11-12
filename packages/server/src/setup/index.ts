import { proxyFe } from "@/setup/proxyFe";
import { registRoutes } from "@/setup/registRoutes";
import { serveApp } from "@/setup/serveApp";
import type { Hono } from "hono";

export function setupApp(app: Hono) {
  proxyFe(app);
  registRoutes(app);
  serveApp(app);
}
