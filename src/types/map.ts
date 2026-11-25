export type LayerId = "cobertura" | "alertas" | "biodiversidad";

export type LayerSwatch = "fill" | "point";

export interface MapLayerDefinition {
  id: LayerId;
  label: string;
  fuente: string;
  fecha: string;
  color: string;
  swatch: LayerSwatch;
}

export interface LayerSelection {
  layerId: LayerId;
  featureName: string | null;
}

export interface LayerFocus {
  layerId: LayerId;
  token: number;
}
