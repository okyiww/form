import { serveApp } from "@/setup/serveApp";
import type { Hono } from "hono";

export function setupApp(app: Hono) {
  serveApp(app);
}
