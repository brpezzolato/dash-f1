import "server-only";

import { buscar } from "./buscar";
import type { MVCircuit, TrackMap } from "../types";

export async function circuit(circuitKey: number, year: number): Promise<MVCircuit> {
  // A API recusa requisições sem User-Agent.
  return buscar<MVCircuit>("multiviewer", `circuits/${circuitKey}/${year}`, { "User-Agent": "dash-f1" });
}

/** Converte as coordenadas do traçado num caminho SVG centrado num viewBox 1000×1000. */
export function toTrackMap(c: MVCircuit): TrackMap | undefined {
  if (!c.x?.length || c.x.length !== c.y?.length) return undefined;
  const rad = (c.rotation * Math.PI) / 180;
  const rotate = (x: number, y: number) => [x * Math.cos(rad) - y * Math.sin(rad), x * Math.sin(rad) + y * Math.cos(rad)];

  const pts = c.x.map((x, i) => rotate(x, c.y[i]));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = 860 / Math.max(maxX - minX, maxY - minY);
  const offX = (1000 - (maxX - minX) * scale) / 2;
  const offY = (1000 - (maxY - minY) * scale) / 2;
  // O eixo Y do SVG cresce para baixo, por isso invertemos.
  const project = (x: number, y: number) => {
    const [rx, ry] = rotate(x, y);
    return { x: Math.round(offX + (rx - minX) * scale), y: Math.round(1000 - (offY + (ry - minY) * scale)) };
  };

  const projected = c.x.map((x, i) => project(x, c.y[i]));
  const path = projected.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ") + " Z";
  const corners = (c.corners ?? []).map((k) => ({
    number: `${k.number}${k.letter ?? ""}`,
    ...project(k.trackPosition.x, k.trackPosition.y),
  }));
  return { path, corners, start: projected[0] };
}
