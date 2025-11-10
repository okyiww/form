import { configs } from "@/configs";
import type { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

export function proxyFe(app: Hono) {
  // 使用统一配置的前端资源路径
  app.use(
    `${configs.basePath}/assets/*`,
    serveStatic({
      root: configs.appPath,
      rewriteRequestPath: (path) => {
        return path.replace(configs.basePath, "");
      },
    })
  );

  app.get(`${configs.basePath}/*`, (c) => {
    const htmlStr = fs.readFileSync(
      path.join(configs.appPath, "index.html"),
      "utf8"
    );
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
            }
          },
          configurable: false,
        });
      `
    );
    return c.html(modifiedHtmlStr);
  });
}
