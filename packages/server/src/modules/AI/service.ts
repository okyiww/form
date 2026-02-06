import { configs } from "@/configs";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * 调用 OneAPI 兼容的 chat/completions 端点，返回原始 Response（用于 SSE 流转发）
 */
export async function streamChatCompletion(
  messages: ChatMessage[]
): Promise<Response> {
  const { aiApiBase, aiApiKey, aiModel } = configs;

  if (!aiApiBase || !aiApiKey) {
    throw new Error(
      "AI_API_BASE and AI_API_KEY must be set in environment variables"
    );
  }

  const response = await fetch(`${aiApiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiApiKey}`,
    },
    body: JSON.stringify({
      model: aiModel,
      messages,
      stream: true,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `AI API error: ${response.status} ${response.statusText} - ${body}`
    );
  }

  return response;
}
