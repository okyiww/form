import { configs } from "@/configs";
import type { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

export function proxyFe(app: Hono) {
  const appPath = path.join(process.cwd(), "app");

  app.use(
    `${configs.basePath}/assets/*`,
    serveStatic({
      root: appPath,
      rewriteRequestPath: (path) => {
        return path.replace(configs.basePath, "");
      },
    })
  );

  app.get(`${configs.basePath}/*`, (c) => {
    const htmlStr = fs.readFileSync(path.join(appPath, "index.html"), "utf8");
    const modifiedHtmlStr = htmlStr.replace(
      "window.__injected_envs",
      `
        Object.defineProperty(window, '__injected_envs', {
          get() {
            return {
              BASE_PATH: '${configs.basePath}',
              API_URL: '${process.env.API_URL || "/api"}',
              VERSION: '${process.env.npm_package_version || "1.0.0"}',
              NODE_ENV: '${process.env.NODE_ENV || "development"}',
              AUTH_BASE_PATH: '${configs.authBasePath}',
            }
          },
          configurable: false,
        });
      `
    );
    return c.html(modifiedHtmlStr);
  });
}
