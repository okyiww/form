import type { ChatMessage } from "./aiChat";

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[]; // full history (user + assistant, no system)
  appliedSchema: any[] | null; // last applied schema for re-apply
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = "form-playground-chat";
const DB_VERSION = 1;
const STORE_NAME = "conversations";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest
): Promise<any> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export function getAllConversations(): Promise<Conversation[]> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.index("updatedAt").openCursor(null, "prev");
        const result: Conversation[] = [];
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor) {
            result.push(cursor.value);
            cursor.continue();
          } else {
            resolve(result);
          }
        };
        req.onerror = () => reject(req.error);
      })
  );
}

export function getConversation(id: string): Promise<Conversation | undefined> {
  return withStore("readonly", (store) => store.get(id));
}

export function saveConversation(conv: Conversation): Promise<void> {
  return withStore("readwrite", (store) => store.put(conv));
}

export function deleteConversation(id: string): Promise<void> {
  return withStore("readwrite", (store) => store.delete(id));
}
