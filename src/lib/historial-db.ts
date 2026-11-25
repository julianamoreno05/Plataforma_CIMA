import Dexie, { type Table } from "dexie";
import { historialSimulado } from "@/mocks/chat";
import type { HistorialChat } from "@/types";

class HistorialDatabase extends Dexie {
  historiales!: Table<HistorialChat, string>;

  constructor() {
    super("cima-historial");
    this.version(1).stores({
      historiales: "id",
    });
  }
}

let database: HistorialDatabase | null = null;

export function getHistorialDb(): HistorialDatabase {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB no está disponible en este navegador.");
  }
  if (!database) {
    database = new HistorialDatabase();
  }
  return database;
}

export async function loadHistorialLocal(): Promise<HistorialChat> {
  const existing = await getHistorialDb().historiales.get(historialSimulado.id);
  if (existing && existing.mensajes.length > 0) {
    return existing;
  }
  await getHistorialDb().historiales.put(historialSimulado);
  return historialSimulado;
}

export async function saveHistorial(historial: HistorialChat): Promise<void> {
  await getHistorialDb().historiales.put(historial);
}
