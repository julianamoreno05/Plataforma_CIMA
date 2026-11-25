import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const source = join("node_modules", "maplibre-gl", "dist", "maplibre-gl-worker.mjs");
const target = join("public", "maplibre-gl-worker.js");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
