import { getRegistSchemas } from "@/modules/Form/service";
import { Hono } from "hono";

const formRoutes = new Hono().basePath("/form");

formRoutes.get("/", (c) => c.text("Hello World"));

formRoutes.get("/schemas", async (c) => {
  return c.json({ code: 200, data: await getRegistSchemas() });
});

export default formRoutes;
