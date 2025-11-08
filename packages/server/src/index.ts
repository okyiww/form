import { Hono } from "hono";
import { setupApp } from "@/setup";

const app = new Hono();
setupApp(app);
