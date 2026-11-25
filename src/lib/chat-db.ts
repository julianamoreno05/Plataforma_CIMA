import Dexie, { type Table } from "dexie";
import type { ChatMessageRecord } from "@/types/chat";

class ChatDatabase extends Dexie {
  messages!: Table<ChatMessageRecord, number>;

  constructor() {
    super("cima-chat");
    this.version(1).stores({
      messages: "++id, createdAt, role",
    });
  }
}

let database: ChatDatabase | null = null;

export function getChatDb(): ChatDatabase {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB no está disponible en este navegador.");
  }
  if (!database) {
    database = new ChatDatabase();
  }
  return database;
}
