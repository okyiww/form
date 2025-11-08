import { serve } from "@hono/node-server";
import type { Hono } from "hono";

export function serveApp(app: Hono) {
  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on port ${info.port}`);
    }
  );
}
