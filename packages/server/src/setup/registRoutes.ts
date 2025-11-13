import { configs } from "@/configs";
import type { Hono } from "hono";

const controllers = import.meta.glob<{ default: any }>(
  "../modules/**/controller.ts",
  {
    eager: true,
  }
);

export async function registRoutes(app: Hono) {
  for await (const file of Object.keys(controllers)) {
    if (/controller\.(ts|js)$/.test(file)) {
      const module = await import(file);
      app.route(`${configs.basePath}/api`, module.default);
    }
  }
}
