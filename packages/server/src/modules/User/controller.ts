import { db } from "@/db";
import { Hono } from "hono";

const userRoutes = new Hono().basePath("/user");

userRoutes.get("/", (c) => c.text("Hello World"));

export default userRoutes;
