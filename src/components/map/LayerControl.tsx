"use client";

import { MAP_LAYERS } from "@/data/map-layers";
import type { LayerId } from "@/types/map";

interface LayerControlProps {
  visibility: Record<LayerId, boolean>;
  selectedLayerId: LayerId | null;
  onToggle: (layerId: LayerId) => void;
  onSelect: (layerId: LayerId) => void;
}

export function LayerControl({
  visibility,
  selectedLayerId,
  onToggle,
  onSelect,
}: LayerControlProps) {
  return (
    <section aria-labelledby="layer-control-title">
      <h2
        id="layer-control-title"
        className="px-5 text-xs font-bold uppercase tracking-[1.5px] text-muted"
      >
        Capas
      </h2>
      <ul className="mt-3 space-y-1 px-3">
        {MAP_LAYERS.map((layer) => {
          const visible = visibility[layer.id];
          const selected = selectedLayerId === layer.id;
          return (
            <li key={layer.id}>
              <div
                className={`flex items-center gap-2 rounded-md border-l-4 py-1 pr-2 pl-2 ${
                  selected ? "bg-teal-soft" : "hover:bg-background"
                }`}
                style={{ borderLeftColor: layer.color }}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={visible}
                  aria-label={`${visible ? "Apagar" : "Encender"} ${layer.label}`}
                  onClick={() => onToggle(layer.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                    visible ? "bg-teal" : "bg-[#c5d0cb]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      visible ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(layer.id)}
                  aria-pressed={selected}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1.5 text-left"
                >
                  <span
                    aria-hidden
                    className={
                      layer.swatch === "point" ? "h-3 w-3 shrink-0 rounded-full" : "h-3 w-3 shrink-0 rounded-sm"
                    }
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="truncate text-sm font-semibold">{layer.label}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
