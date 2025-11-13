import { configs } from "@/configs";
import type { Hono } from "hono";

const controllers = import.meta.glob<{ default: any }>(
  "../modules/**/controller.ts",
  {
    eager: true,
  }
);

export async function registRoutes(app: Hono) {
  for await (const [filename, module] of Object.entries(controllers)) {
    if (/controller\.(ts|js)$/.test(filename)) {
      app.route(`${configs.basePath}/api`, module.default);
    }
  }
}
