import { getRegistSchemas } from "@/modules/Auth/service";
import { Hono } from "hono";

const userRoutes = new Hono().basePath("/auth");

userRoutes.get("/", (c) => c.text("Hello World"));

userRoutes.get("/schemas", async (c) => {
  return c.json({ code: 200, data: await getRegistSchemas() });
});

export default userRoutes;
