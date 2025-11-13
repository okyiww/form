import { db } from "@/db";
import { users } from "@/db/schema";
import { Hono } from "hono";

const userRoutes = new Hono().basePath("/user");

userRoutes.get("/", (c) => c.text("Hello World"));

userRoutes.get("/createRootUser", async (c) => {
  await db.insert(users).values({
    name: "root",
    email: "root@example.com",
    password: "root",
  });
  return c.json({ code: 201, message: "Root user created" });
});

export default userRoutes;
