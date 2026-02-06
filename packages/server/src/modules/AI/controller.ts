import { Hono } from "hono";
import { streamChatCompletion } from "./service";
import { stream } from "hono/streaming";

const aiRoutes = new Hono().basePath("/ai");

aiRoutes.get("/", (c) => c.text("AI module is running"));

/**
 * POST /api/ai/chat
 * 接收前端的 messages，转发到 OneAPI，以 SSE 流式返回
 */
aiRoutes.post("/chat", async (c) => {
  const body = await c.req.json<{ messages: any[] }>();

  if (!body.messages || !Array.isArray(body.messages)) {
    return c.json({ error: "messages is required and must be an array" }, 400);
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await streamChatCompletion(body.messages);
  } catch (err: any) {
    return c.json({ error: err.message }, 502);
  }

  // 直接把上游的 SSE 流透传给前端
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  const upstreamBody = upstreamResponse.body;
  if (!upstreamBody) {
    return c.json({ error: "No response body from AI API" }, 502);
  }

  return stream(c, async (stream) => {
    const reader = upstreamBody.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await stream.write(value);
      }
    } catch {
      // client disconnected or upstream error, silently close
    } finally {
      reader.releaseLock();
    }
  });
});

export default aiRoutes;
