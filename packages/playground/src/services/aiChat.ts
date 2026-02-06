export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 通过后端 /api/ai/chat 端点进行 SSE 流式对话
 * Key 和端点信息由服务端 process.env 管理，前端不接触敏感信息
 */
export function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError?: (err: Error) => void
): AbortController {
  const controller = new AbortController();

  fetch(`/form-playground/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${response.status} - ${text}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onChunk(content);
          } catch {
            // ignore parse errors for incomplete JSON
          }
        }
      }
      onDone();
    })
    .catch((err) => {
      if (err.name === "AbortError") return;
      onError?.(err);
    });

  return controller;
}
