import Dexie, { type Table } from "dexie";
import type { QueuedFile } from "@/types/files";

class FileDatabase extends Dexie {
  files!: Table<QueuedFile, number>;

  constructor() {
    super("cima-files");
    this.version(1).stores({
      files: "++id, addedAt, status",
    });
  }
}

let database: FileDatabase | null = null;

export function getFileDb(): FileDatabase {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB no está disponible en este navegador.");
  }
  if (!database) {
    database = new FileDatabase();
  }
  return database;
}
