export const INCERTIDUMBRE_NIVELES = ["Baja", "Media", "Alta"] as const;

export type Incertidumbre = (typeof INCERTIDUMBRE_NIVELES)[number];

export type ChatRole = "user" | "assistant" | "notice";

export interface RagResponse {
  texto: string;
  fuentes: string[];
  incertidumbre: Incertidumbre;
}

export interface ChatMessageRecord {
  id?: number;
  role: ChatRole;
  texto: string;
  fuentes: string[];
  incertidumbre: Incertidumbre | null;
  createdAt: string;
}
