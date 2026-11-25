import type { HistorialChat } from "@/types";

export const historialSimulado: HistorialChat = {
  id: "historial-samana",
  mensajes: [
    {
      id: "msg-cobertura-pregunta",
      rol: "user",
      textoTecnico: "¿Cuál es el índice de cobertura vegetal en Samaná?",
      textoCotidiano: "¿Cuál es el índice de cobertura vegetal en Samaná?",
      fuentes: [],
      incertidumbre: "Baja",
      estadoSincronizacion: "synced",
    },
    {
      id: "msg-cobertura-respuesta",
      rol: "assistant",
      textoTecnico: "Índice de cobertura NDVI de 0.3 con 85% de confianza",
      textoCotidiano:
        "El bosque muestra signos de sequía o pérdida de vegetación, con alta probabilidad",
      fuentes: ["Simulado · Coberturas de la tierra, referencia IDEAM"],
      incertidumbre: "Baja",
      estadoSincronizacion: "synced",
    },
    {
      id: "msg-alerta-pregunta",
      rol: "user",
      textoTecnico: "¿Qué alerta hay registrada sobre la vía a Florencia?",
      textoCotidiano: "¿Qué alerta hay registrada sobre la vía a Florencia?",
      fuentes: [],
      incertidumbre: "Baja",
      estadoSincronizacion: "synced",
    },
    {
      id: "msg-alerta-respuesta",
      rol: "assistant",
      textoTecnico:
        "Alerta puntual: deslizamiento en la vía a Florencia. Fuente: reportes comunitarios CIMA. Fecha: 2026-03-04.",
      textoCotidiano:
        "Hay un aviso de derrumbe en la carretera que va a Florencia. El dato viene de los reportes de la comunidad.",
      fuentes: ["Simulado · Reportes comunitarios CIMA"],
      incertidumbre: "Media",
      estadoSincronizacion: "synced",
    },
  ],
};
