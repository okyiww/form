import { getGenderOptions } from "@/modules/Dict/service";
import { Hono } from "hono";

const userRoutes = new Hono().basePath("/dict");

userRoutes.get("/", (c) => c.text("Hello World"));

userRoutes.get("/genderOptions", async (c) => {
  return c.json({ code: 200, data: getGenderOptions() });
});

export default userRoutes;
