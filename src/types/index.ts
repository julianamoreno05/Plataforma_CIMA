export type RolChat = "user" | "assistant";

export type IncertidumbreChat = "Baja" | "Media" | "Alta";

export type EstadoSincronizacion = "synced" | "pending";

export interface MensajeChat {
  id: string;
  rol: RolChat;
  textoTecnico: string;
  textoCotidiano: string;
  fuentes: string[];
  incertidumbre: IncertidumbreChat;
  estadoSincronizacion: EstadoSincronizacion;
}

export interface HistorialChat {
  id: string;
  mensajes: MensajeChat[];
}
