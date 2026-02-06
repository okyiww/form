import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getAllConversations,
  saveConversation,
  deleteConversation as dbDelete,
  getConversation,
  type Conversation,
} from "@/services/chatDB";
import type { ChatMessage } from "@/services/aiChat";

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useChatStore = defineStore("chat", () => {
  const conversations = ref<Conversation[]>([]);
  const currentId = ref<string | null>(null);

  async function load() {
    conversations.value = await getAllConversations();
  }

  function currentConversation(): Conversation | undefined {
    return conversations.value.find((c) => c.id === currentId.value);
  }

  async function createConversation(): Promise<Conversation> {
    const conv: Conversation = {
      id: genId(),
      title: "新对话",
      messages: [],
      appliedSchema: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    conversations.value.unshift(conv);
    currentId.value = conv.id;
    await saveConversation(conv);
    return conv;
  }

  async function switchConversation(id: string) {
    currentId.value = id;
  }

  async function pushMessage(msg: ChatMessage) {
    const conv = currentConversation();
    if (!conv) return;
    conv.messages.push(msg);
    conv.updatedAt = Date.now();
    // auto-title from first user message
    if (msg.role === "user" && conv.title === "新对话") {
      conv.title = msg.content.slice(0, 20) + (msg.content.length > 20 ? "..." : "");
    }
    await saveConversation({ ...conv });
  }

  async function setAppliedSchema(schema: any[]) {
    const conv = currentConversation();
    if (!conv) return;
    conv.appliedSchema = schema;
    conv.updatedAt = Date.now();
    await saveConversation({ ...conv });
  }

  async function removeConversation(id: string) {
    conversations.value = conversations.value.filter((c) => c.id !== id);
    if (currentId.value === id) {
      currentId.value = conversations.value[0]?.id ?? null;
    }
    await dbDelete(id);
  }

  return {
    conversations,
    currentId,
    currentConversation,
    load,
    createConversation,
    switchConversation,
    pushMessage,
    setAppliedSchema,
    removeConversation,
  };
});
