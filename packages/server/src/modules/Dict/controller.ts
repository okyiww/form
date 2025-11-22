import { getGenderOptions } from "@/modules/Dict/service";
import { Hono } from "hono";

const userRoutes = new Hono().basePath("/dict");

userRoutes.get("/", (c) => c.text("Hello World"));

userRoutes.get("/genderOptions", async (c) => {
  return c.json({ code: 200, data: getGenderOptions() });
});

userRoutes.get("/genderOptions/test", async (c) => {
  return c.json({ code: 200, data: "test" });
});

userRoutes.post("/genderOptions", async (c) => {
  return c.json({ code: 200, data: { name: "this is the name" } });
});

export default userRoutes;
