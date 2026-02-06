import {
  defineComponent,
  ref,
  nextTick,
  onBeforeUnmount,
  watch,
  type PropType,
} from "vue";
import { Button, Input } from "@arco-design/web-vue";
import { Marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { streamChat, type ChatMessage } from "@/services/aiChat";
import { FORM_SCHEMA_SYSTEM_PROMPT } from "@/services/schemaPrompt";
import styles from "./ai-chat.module.scss";

interface UIMessage {
  role: "user" | "assistant";
  content: string;
}

const marked = new Marked({
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "json";
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre class="${styles.codeBlock}"><div class="${styles.codeHeader}"><span>${language}</span><button class="${styles.copyBtn}" data-code="${encodeURIComponent(text)}">复制</button></div><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

export default defineComponent({
  name: "AIChatPanel",
  props: {
    onApplySchema: {
      type: Function as PropType<(schema: any[]) => void>,
      required: true,
    },
  },
  setup(props) {
    const messages = ref<UIMessage[]>([]);
    const inputText = ref("");
    const isStreaming = ref(false);
    const messagesEndRef = ref<HTMLDivElement>();
    const messagesContainerRef = ref<HTMLDivElement>();
    const chatHistory = ref<ChatMessage[]>([]);
    let abortController: AbortController | null = null;

    // 用户是否手动向上滚动了（脱离底部）
    let userScrolledUp = false;

    function isNearBottom(): boolean {
      const el = messagesContainerRef.value;
      if (!el) return true;
      // 距底部 60px 以内视为"在底部"
      return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    }

    function handleScroll() {
      if (!isStreaming.value) return;
      userScrolledUp = !isNearBottom();
    }

    function scrollToBottom(force = false) {
      if (!force && userScrolledUp) return;
      nextTick(() => {
        messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
      });
    }

    function extractJsonFromMarkdown(text: string): any[] | null {
      const jsonBlockRegex = /```json\s*\n([\s\S]*?)```/g;
      let match: RegExpExecArray | null;
      while ((match = jsonBlockRegex.exec(text)) !== null) {
        try {
          const parsed = JSON.parse(match[1].trim());
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // continue
        }
      }
      // fallback: try parsing the whole thing
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // not valid JSON
      }
      return null;
    }

    function handleApplyFromMessage(content: string) {
      const schema = extractJsonFromMarkdown(content);
      if (schema) {
        props.onApplySchema(schema);
      }
    }

    function handleSend() {
      const text = inputText.value.trim();
      if (!text || isStreaming.value) return;

      // 发送新消息时重置滚动锁定，用户期望看到新回复
      userScrolledUp = false;

      messages.value.push({ role: "user", content: text });
      inputText.value = "";

      chatHistory.value.push({ role: "user", content: text });

      const allMessages: ChatMessage[] = [
        { role: "system", content: FORM_SCHEMA_SYSTEM_PROMPT },
        ...chatHistory.value,
      ];

      messages.value.push({ role: "assistant", content: "" });
      const assistantIdx = messages.value.length - 1;
      isStreaming.value = true;
      let fullContent = "";

      abortController = streamChat(
        allMessages,
        (chunk) => {
          fullContent += chunk;
          messages.value[assistantIdx] = {
            role: "assistant",
            content: fullContent,
          };
          scrollToBottom();
        },
        () => {
          isStreaming.value = false;
          userScrolledUp = false;
          chatHistory.value.push({ role: "assistant", content: fullContent });
          scrollToBottom();
        },
        (err) => {
          isStreaming.value = false;
          messages.value[assistantIdx] = {
            role: "assistant",
            content: `请求失败: ${err.message}`,
          };
        }
      );

      scrollToBottom();
    }

    function handleStop() {
      abortController?.abort();
      isStreaming.value = false;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }

    function handleCopyClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.classList.contains(styles.copyBtn)) {
        const code = decodeURIComponent(target.dataset.code || "");
        navigator.clipboard.writeText(code);
        target.textContent = "已复制";
        setTimeout(() => {
          target.textContent = "复制";
        }, 1500);
      }
    }

    onBeforeUnmount(() => {
      abortController?.abort();
    });

    function renderMessage(msg: UIMessage, idx: number) {
      const isUser = msg.role === "user";
      const html = isUser ? "" : (marked.parse(msg.content) as string);
      const hasSchema = !isUser && extractJsonFromMarkdown(msg.content);

      return (
        <div
          key={idx}
          class={[styles.message, isUser ? styles.userMessage : styles.aiMessage]}
        >
          <div class={styles.messageAvatar}>
            {isUser ? "你" : "AI"}
          </div>
          <div class={styles.messageBody}>
            {isUser ? (
              <div class={styles.messageText}>{msg.content}</div>
            ) : (
              <div
                class={styles.messageText}
                innerHTML={html}
                onClick={handleCopyClick}
              />
            )}
            {hasSchema && !isStreaming.value && (
              <Button
                type="primary"
                size="mini"
                class={styles.applyBtn}
                onClick={() => handleApplyFromMessage(msg.content)}
              >
                应用到编辑器
              </Button>
            )}
          </div>
        </div>
      );
    }

    return () => (
      <div class={styles.chatPanel}>
        <div class={styles.chatHeader}>
          <span class={styles.chatTitle}>AI 表单助手</span>
          <span class={styles.chatHint}>描述你需要的表单，AI 会生成对应 Schema</span>
        </div>

        <div ref={messagesContainerRef} class={styles.chatMessages} onScroll={handleScroll}>
          {messages.value.length === 0 && (
            <div class={styles.emptyState}>
              <div class={styles.emptyIcon}>AI</div>
              <div class={styles.emptyText}>
                描述你需要的表单，例如：
              </div>
              <div class={styles.suggestions}>
                {["请假审批单", "出门申请单", "报销审批单", "加班申请单"].map(
                  (s) => (
                    <button
                      key={s}
                      class={styles.suggestionBtn}
                      onClick={() => {
                        inputText.value = `我需要一个${s}`;
                        handleSend();
                      }}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
          {messages.value.map((msg, idx) => renderMessage(msg, idx))}
          {isStreaming.value && (
            <div class={styles.streamingHint}>
              <span class={styles.dot} />
              AI 正在思考...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div class={styles.chatInput}>
          <Input
            modelValue={inputText.value}
            onUpdate:modelValue={(v: string) => (inputText.value = v)}
            placeholder="描述你需要的表单..."
            onKeydown={handleKeyDown}
            disabled={isStreaming.value}
          />
          {isStreaming.value ? (
            <Button size="small" onClick={handleStop}>
              停止
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={handleSend}
              disabled={!inputText.value.trim()}
            >
              发送
            </Button>
          )}
        </div>
      </div>
    );
  },
});
