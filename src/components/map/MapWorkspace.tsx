"use client";

import { useRef, useState } from "react";
import { MapCanvas } from "@/components/map/MapCanvas";
import { LayerMetadataPanel } from "@/components/map/LayerMetadataPanel";
import { MapSidebar } from "@/components/map/MapSidebar";
import { findMapLayer, INITIAL_LAYER_VISIBILITY } from "@/data/map-layers";
import { useAssistantPanel } from "@/store/assistant-panel";
import type { LayerFocus, LayerId, LayerSelection } from "@/types/map";

export function MapWorkspace() {
  const [visibility, setVisibility] = useState(INITIAL_LAYER_VISIBILITY);
  const [selection, setSelection] = useState<LayerSelection | null>(null);
  const [focus, setFocus] = useState<LayerFocus | null>(null);
  const focusToken = useRef(0);

  function toggleLayer(layerId: LayerId) {
    setVisibility((current) => ({ ...current, [layerId]: !current[layerId] }));
  }

  function selectLayer(layerId: LayerId) {
    focusToken.current += 1;
    setSelection({ layerId, featureName: null });
    setFocus({ layerId, token: focusToken.current });
  }

  function selectFeature(layerId: LayerId, featureName: string) {
    setSelection({ layerId, featureName });
  }

  const selectedLayer = selection ? findMapLayer(selection.layerId) : undefined;
  const assistantOpen = useAssistantPanel((state) => state.open);
  const openAssistant = useAssistantPanel((state) => state.openPanel);

  return (
    <div className="flex h-full bg-background">
      <MapSidebar
        visibility={visibility}
        selectedLayerId={selection?.layerId ?? null}
        onToggle={toggleLayer}
        onSelect={selectLayer}
      />
      <div className="relative min-w-0 flex-1">
        <MapCanvas visibility={visibility} focus={focus} onFeatureSelect={selectFeature} />
        <button
          type="button"
          onClick={openAssistant}
          aria-expanded={assistantOpen}
          aria-controls="asistente-c1"
          className="absolute top-4 right-16 z-20 rounded-[10px] bg-teal px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-dark"
        >
          Asistente
        </button>
        {selectedLayer ? (
          <LayerMetadataPanel
            layer={selectedLayer}
            featureName={selection?.featureName ?? null}
            onClose={() => setSelection(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
