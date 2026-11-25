"use client";

import { formatDate } from "@/lib/format";
import type { MapLayerDefinition } from "@/types/map";

interface LayerMetadataPanelProps {
  layer: MapLayerDefinition;
  featureName: string | null;
  onClose: () => void;
}

export function LayerMetadataPanel({ layer, featureName, onClose }: LayerMetadataPanelProps) {
  return (
    <aside
      className="absolute top-4 left-4 z-10 w-80 rounded-lg border border-line bg-surface p-4 shadow-lg"
      aria-label="Metadatos de la capa"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Metadatos</p>
          <h2 className="mt-1 text-base font-semibold">{layer.label}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar metadatos"
          className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-background hover:text-foreground"
        >
          ×
        </button>
      </div>
      {featureName ? (
        <p className="mt-3 text-sm leading-6 text-muted">
          Elemento{" "}
          <span className="font-semibold text-foreground">{featureName}</span>
        </p>
      ) : null}
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Fuente</dt>
          <dd className="mt-1 leading-6">{layer.fuente}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Fecha</dt>
          <dd className="mt-1 font-semibold">{formatDate(layer.fecha)}</dd>
        </div>
      </dl>
    </aside>
  );
}
