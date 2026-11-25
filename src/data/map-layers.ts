import type { LayerId, MapLayerDefinition } from "@/types/map";

export const MAP_LAYERS = [
  {
    id: "cobertura",
    label: "Cobertura Vegetal",
    fuente: "Simulado · Coberturas de la tierra, referencia IDEAM",
    fecha: "2024-08-12",
    color: "#2f7d4a",
    swatch: "fill",
  },
  {
    id: "alertas",
    label: "Alertas",
    fuente: "Simulado · Reportes comunitarios CIMA",
    fecha: "2026-03-04",
    color: "#d97706",
    swatch: "point",
  },
  {
    id: "biodiversidad",
    label: "Biodiversidad",
    fuente: "Simulado · Registros biológicos, referencia Instituto Humboldt",
    fecha: "2025-11-18",
    color: "#0f766e",
    swatch: "fill",
  },
] as const satisfies readonly MapLayerDefinition[];

export const INITIAL_LAYER_VISIBILITY: Record<LayerId, boolean> = {
  cobertura: true,
  alertas: true,
  biodiversidad: true,
};

export function findMapLayer(id: string): MapLayerDefinition | undefined {
  return MAP_LAYERS.find((layer) => layer.id === id);
}
