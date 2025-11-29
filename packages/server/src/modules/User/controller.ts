import { db } from "@/db";
import { auth } from "@/setup/setupAuth";
import { Hono } from "hono";

const userRoutes = new Hono().basePath("/user");

userRoutes.get("/", (c) => c.text("Hello World"));

userRoutes.get("/info", async (c) => {
  const userInfo = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  return c.json(userInfo.user);
});

export default userRoutes;
