import {
  defineComponent,
  ref,
  nextTick,
  onBeforeUnmount,
  onMounted,
  watch,
  computed,
  type PropType,
} from "vue";
import { Button } from "@arco-design/web-vue";
import { Marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { streamChat, type ChatMessage } from "@/services/aiChat";
import { FORM_SCHEMA_SYSTEM_PROMPT } from "@/services/schemaPrompt";
import { useChatStore } from "@/store/chat";
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
      return `<pre class="${styles.codeBlock}"><div class="${
        styles.codeHeader
      }"><span>${language}</span><button class="${
        styles.copyBtn
      }" data-code="${encodeURIComponent(
        text
      )}">复制</button></div><code class="hljs language-${language}">${highlighted}</code></pre>`;
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
    const chatStore = useChatStore();

    const messages = ref<UIMessage[]>([]);
    const inputText = ref("");
    const isStreaming = ref(false);
    const messagesEndRef = ref<HTMLDivElement>();
    const messagesContainerRef = ref<HTMLDivElement>();
    const textareaRef = ref<HTMLTextAreaElement>();
    let abortController: AbortController | null = null;

    let autoScroll = true;
    let programmaticScroll = false;

    // Build UIMessage list from store's current conversation
    function syncMessagesFromStore() {
      const conv = chatStore.currentConversation();
      if (!conv) {
        messages.value = [];
        return;
      }
      messages.value = conv.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    }

    // Watch conversation switch
    watch(
      () => chatStore.currentId,
      () => {
        // abort ongoing stream when switching
        abortController?.abort();
        isStreaming.value = false;
        syncMessagesFromStore();
        nextTick(() => scrollToBottom(true));
      }
    );

    onMounted(async () => {
      await chatStore.load();
      if (chatStore.conversations.length === 0) {
        await chatStore.createConversation();
      } else {
        chatStore.currentId = chatStore.conversations[0].id;
      }
      syncMessagesFromStore();
    });

    function isNearBottom(): boolean {
      const el = messagesContainerRef.value;
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    }

    function handleScroll() {
      if (programmaticScroll) return;
      autoScroll = isNearBottom();
    }

    function scrollToBottom(force = false) {
      if (!force && !autoScroll) return;
      nextTick(() => {
        const el = messagesContainerRef.value;
        if (!el) return;
        programmaticScroll = true;
        el.scrollTop = el.scrollHeight;
        requestAnimationFrame(() => {
          programmaticScroll = false;
        });
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
        chatStore.setAppliedSchema(schema);
      }
    }

    async function handleSend() {
      const text = inputText.value.trim();
      if (!text || isStreaming.value) return;

      // Ensure we have a current conversation
      if (!chatStore.currentId) {
        await chatStore.createConversation();
      }

      autoScroll = true;

      messages.value.push({ role: "user", content: text });
      inputText.value = "";
      // reset textarea height
      if (textareaRef.value) {
        textareaRef.value.style.height = "auto";
      }

      await chatStore.pushMessage({ role: "user", content: text });

      const conv = chatStore.currentConversation();
      if (!conv) return;

      const allMessages: ChatMessage[] = [
        { role: "system", content: FORM_SCHEMA_SYSTEM_PROMPT },
        ...conv.messages,
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
        async () => {
          isStreaming.value = false;
          await chatStore.pushMessage({ role: "assistant", content: fullContent });
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

    function autoResizeTextarea() {
      const el = textareaRef.value;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 150) + "px";
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }

    function handleInput(e: Event) {
      inputText.value = (e.target as HTMLTextAreaElement).value;
      autoResizeTextarea();
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

    async function handleNewConversation() {
      abortController?.abort();
      isStreaming.value = false;
      await chatStore.createConversation();
    }

    function handleReapplySchema(conv: { appliedSchema: any[] | null }) {
      if (conv.appliedSchema) {
        props.onApplySchema(conv.appliedSchema);
      }
    }

    onBeforeUnmount(() => {
      abortController?.abort();
    });

    function renderConversationList() {
      return (
        <div class={styles.convSidebar}>
          <div class={styles.convHeader}>
            <span class={styles.convTitle}>对话记录</span>
            <button class={styles.convNewBtn} onClick={handleNewConversation} title="新对话">
              +
            </button>
          </div>
          <div class={styles.convList}>
            {chatStore.conversations.map((conv) => (
              <div
                key={conv.id}
                class={[
                  styles.convItem,
                  conv.id === chatStore.currentId && styles.convItemActive,
                ]}
                onClick={() => chatStore.switchConversation(conv.id)}
              >
                <div class={styles.convItemTitle}>{conv.title}</div>
                <div class={styles.convItemActions}>
                  {conv.appliedSchema && (
                    <button
                      class={styles.convReapplyBtn}
                      title="重新应用表单"
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        handleReapplySchema(conv);
                      }}
                    >
                      ↻
                    </button>
                  )}
                  <button
                    class={styles.convDeleteBtn}
                    title="删除对话"
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      chatStore.removeConversation(conv.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    function renderMessage(msg: UIMessage, idx: number) {
      const isUser = msg.role === "user";
      const html = isUser ? "" : (marked.parse(msg.content) as string);
      const hasSchema = !isUser && extractJsonFromMarkdown(msg.content);

      return (
        <div
          key={idx}
          class={[
            styles.message,
            isUser ? styles.userMessage : styles.aiMessage,
          ]}
        >
          <div class={styles.messageAvatar}>{isUser ? "你" : "AI"}</div>
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
        {renderConversationList()}
        <div class={styles.chatMain}>
          <div
            ref={messagesContainerRef}
            class={styles.chatMessages}
            onScroll={handleScroll}
          >
            {messages.value.length === 0 && (
              <div class={styles.emptyState}>
                <div class={styles.emptyIcon}>AI</div>
                <div class={styles.emptyText}>描述你需要的表单，例如：</div>
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

          <div class={styles.chatInputWrap}>
            <div class={styles.chatInputBox}>
              <textarea
                ref={textareaRef}
                class={styles.chatTextarea}
                value={inputText.value}
                onInput={handleInput}
                onKeydown={handleKeyDown}
                placeholder="描述你需要的表单，Enter 发送..."
                disabled={isStreaming.value}
                rows={1}
              />
              <div class={styles.chatInputFooter}>
                <span class={styles.chatInputHint}>Shift+Enter 换行</span>
                {isStreaming.value ? (
                  <button class={styles.stopBtn} onClick={handleStop} title="停止">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="3" y="3" width="10" height="10" rx="2" />
                    </svg>
                  </button>
                ) : (
                  <button
                    class={[styles.sendBtn, !inputText.value.trim() && styles.sendBtnDisabled]}
                    onClick={handleSend}
                    disabled={!inputText.value.trim()}
                    title="发送"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M8 12V4M8 4L4 8M8 4L12 8" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
