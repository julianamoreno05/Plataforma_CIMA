"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";
import { capasSamana } from "@/data/capas-samana";
import { findMapLayer, MAP_LAYERS } from "@/data/map-layers";
import { boundsForLayer } from "@/lib/geojson-bounds";
import type { LayerFocus, LayerId } from "@/types/map";
import "maplibre-gl/dist/maplibre-gl.css";

const QUERY_LAYER_IDS = ["cobertura-fill", "biodiversidad-fill", "alertas-circle"];

interface MapCanvasProps {
  visibility: Record<LayerId, boolean>;
  focus: LayerFocus | null;
  onFeatureSelect: (layerId: LayerId, featureName: string) => void;
}

export function MapCanvas({ visibility, focus, onFeatureSelect }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const visibilityRef = useRef(visibility);
  const onFeatureSelectRef = useRef(onFeatureSelect);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  visibilityRef.current = visibility;
  onFeatureSelectRef.current = onFeatureSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;
    let map: MapLibreMap | null = null;
    let observer: ResizeObserver | null = null;

    void (async () => {
      const maplibregl = await import("maplibre-gl");
      if (disposed) {
        return;
      }

      maplibregl.setWorkerUrl("/maplibre-gl-worker.js");

      map = new maplibregl.Map({
        container,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [-74.99, 5.42],
        zoom: 11,
        locale: {
          "NavigationControl.ZoomIn": "Acercar",
          "NavigationControl.ZoomOut": "Alejar",
          "NavigationControl.ResetBearing": "Restablecer norte",
        },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
      map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
      mapRef.current = map;

      map.on("load", () => {
        if (disposed || !map) {
          return;
        }
        try {
          addSamanaLayers(map, visibilityRef.current);
        } catch (error) {
          console.error(error);
          setFailed(true);
          return;
        }
        map.on("click", handleClick);
        map.on("mousemove", handleMouseMove);
        setReady(true);
      });

      observer = new ResizeObserver(() => {
        map?.resize();
      });
      observer.observe(container);
    })().catch(() => {
      if (!disposed) {
        setFailed(true);
      }
    });

    function handleClick(event: MapLayerMouseEvent) {
      const current = mapRef.current;
      if (!current) {
        return;
      }
      const features = current.queryRenderedFeatures(event.point, { layers: QUERY_LAYER_IDS });
      const feature = features[0];
      const capa = feature?.properties?.capa;
      if (typeof capa !== "string") {
        return;
      }
      const layer = findMapLayer(capa);
      if (!layer) {
        return;
      }
      const nombre = feature?.properties?.nombre;
      onFeatureSelectRef.current(layer.id, typeof nombre === "string" ? nombre : layer.label);
    }

    function handleMouseMove(event: MapLayerMouseEvent) {
      const current = mapRef.current;
      if (!current) {
        return;
      }
      const features = current.queryRenderedFeatures(event.point, { layers: QUERY_LAYER_IDS });
      current.getCanvas().style.cursor = features.length > 0 ? "pointer" : "";
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) {
      return;
    }
    for (const layer of MAP_LAYERS) {
      const value = visibility[layer.id] ? "visible" : "none";
      for (const layerId of styleLayerIds(layer.id)) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, "visibility", value);
        }
      }
    }
  }, [ready, visibility]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !focus) {
      return;
    }
    const bounds = boundsForLayer(capasSamana, focus.layerId);
    if (!bounds) {
      return;
    }
    map.fitBounds(bounds, {
      padding: { top: 72, bottom: 72, left: 360, right: 48 },
      duration: 700,
      maxZoom: 13,
    });
  }, [ready, focus]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {failed ? (
        <p className="absolute inset-x-0 top-4 text-center text-sm text-red-700">
          No se pudo iniciar el mapa.
        </p>
      ) : null}
    </div>
  );
}

function styleLayerIds(layerId: LayerId): string[] {
  if (layerId === "alertas") {
    return ["alertas-circle"];
  }
  return [`${layerId}-fill`, `${layerId}-line`];
}

function addSamanaLayers(map: MapLibreMap, visibility: Record<LayerId, boolean>) {
  map.addSource("capas-samana", {
    type: "geojson",
    data: capasSamana,
  });

  const layout = (layerId: LayerId) => ({
    visibility: visibility[layerId] ? ("visible" as const) : ("none" as const),
  });

  map.addLayer({
    id: "cobertura-fill",
    type: "fill",
    source: "capas-samana",
    filter: ["==", ["get", "capa"], "cobertura"],
    layout: layout("cobertura"),
    paint: { "fill-color": "#2f7d4a", "fill-opacity": 0.45 },
  });
  map.addLayer({
    id: "cobertura-line",
    type: "line",
    source: "capas-samana",
    filter: ["==", ["get", "capa"], "cobertura"],
    layout: layout("cobertura"),
    paint: { "line-color": "#1f5c36", "line-width": 1.5 },
  });
  map.addLayer({
    id: "biodiversidad-fill",
    type: "fill",
    source: "capas-samana",
    filter: ["==", ["get", "capa"], "biodiversidad"],
    layout: layout("biodiversidad"),
    paint: { "fill-color": "#0f766e", "fill-opacity": 0.5 },
  });
  map.addLayer({
    id: "biodiversidad-line",
    type: "line",
    source: "capas-samana",
    filter: ["==", ["get", "capa"], "biodiversidad"],
    layout: layout("biodiversidad"),
    paint: { "line-color": "#115e59", "line-width": 1.5 },
  });
  map.addLayer({
    id: "alertas-circle",
    type: "circle",
    source: "capas-samana",
    filter: ["==", ["get", "capa"], "alertas"],
    layout: layout("alertas"),
    paint: {
      "circle-radius": 7,
      "circle-color": "#d97706",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}
