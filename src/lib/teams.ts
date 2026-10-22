import type { TeamInfo } from "./types";

/** Cor oficial aproximada de cada equipe, pela chave de construtor da Jolpica. */
const TEAMS: Record<string, { color: string; short: string }> = {
  red_bull: { color: "#3671C6", short: "Red Bull" },
  ferrari: { color: "#E8002D", short: "Ferrari" },
  mercedes: { color: "#27F4D2", short: "Mercedes" },
  mclaren: { color: "#FF8000", short: "McLaren" },
  aston_martin: { color: "#229971", short: "Aston Martin" },
  alpine: { color: "#FF87BC", short: "Alpine" },
  williams: { color: "#64C4FF", short: "Williams" },
  rb: { color: "#6692FF", short: "Racing Bulls" },
  sauber: { color: "#52E252", short: "Sauber" },
  audi: { color: "#F50537", short: "Audi" },
  haas: { color: "#B6BABD", short: "Haas" },
  cadillac: { color: "#C9A14A", short: "Cadillac" },
  alphatauri: { color: "#5E8FAA", short: "AlphaTauri" },
  alfa: { color: "#C92D4B", short: "Alfa Romeo" },
  racing_point: { color: "#F596C8", short: "Racing Point" },
  renault: { color: "#FFF500", short: "Renault" },
  toro_rosso: { color: "#469BFF", short: "Toro Rosso" },
  force_india: { color: "#F596C8", short: "Force India" },
};

const FALLBACK = "#8A8F98";

export function teamColor(constructorId?: string, openF1Colour?: string): string {
  if (constructorId && TEAMS[constructorId]) return TEAMS[constructorId].color;
  if (openF1Colour) return `#${openF1Colour.replace("#", "")}`;
  return FALLBACK;
}

export function teamInfo(constructorId: string, name: string, openF1Colour?: string): TeamInfo {
  return { id: constructorId, name: TEAMS[constructorId]?.short ?? name, color: teamColor(constructorId, openF1Colour) };
}
