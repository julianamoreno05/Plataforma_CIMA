import type { FeatureCollection, Geometry, Position } from "geojson";

export type LngLatBoundsTuple = [[number, number], [number, number]];

export function boundsForLayer(
  collection: FeatureCollection,
  layerId: string,
): LngLatBoundsTuple | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  let found = false;

  function visit(position: Position) {
    const [lng, lat] = position;
    if (typeof lng !== "number" || typeof lat !== "number") {
      return;
    }
    found = true;
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  function walk(geometry: Geometry | null) {
    if (!geometry) {
      return;
    }
    if (geometry.type === "Point") {
      visit(geometry.coordinates);
      return;
    }
    if (geometry.type === "MultiPoint" || geometry.type === "LineString") {
      geometry.coordinates.forEach(visit);
      return;
    }
    if (geometry.type === "Polygon" || geometry.type === "MultiLineString") {
      geometry.coordinates.forEach((ring) => ring.forEach(visit));
      return;
    }
    if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => polygon.forEach((ring) => ring.forEach(visit)));
    }
  }

  for (const feature of collection.features) {
    if (feature.properties?.capa !== layerId) {
      continue;
    }
    walk(feature.geometry);
  }

  if (!found) {
    return null;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
