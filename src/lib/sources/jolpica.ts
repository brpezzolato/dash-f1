import "server-only";

import { buscar } from "./buscar";
import type { ConstructorStanding, DriverStanding, Race } from "../types";

const PAGE = 100;

interface MR<T> {
  MRData: T & { total: string };
}
type RaceTable = MR<{ RaceTable: { Races: Race[] } }>;

const get = <T>(path: string) => buscar<T>("jolpica", path);

export async function driverStandings(season: string): Promise<DriverStanding[]> {
  const d = await get<MR<{ StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] } }>>(
    `${season}/driverstandings.json`,
  );
  return d.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function constructorStandings(season: string): Promise<ConstructorStanding[]> {
  const d = await get<MR<{ StandingsTable: { StandingsLists: { ConstructorStandings: ConstructorStanding[] }[] } }>>(
    `${season}/constructorstandings.json`,
  );
  return d.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

export async function schedule(season: string): Promise<Race[]> {
  const d = await get<RaceTable>(`${season}.json?limit=${PAGE}`);
  return d.MRData.RaceTable.Races;
}

export async function lastRace(season: string): Promise<Race | undefined> {
  const d = await get<RaceTable>(`${season}/last/results.json`);
  return d.MRData.RaceTable.Races[0];
}

/**
 * A API pagina por resultado individual, então uma corrida pode vir dividida
 * entre duas páginas; juntamos as corridas pelo número da etapa.
 */
export async function allResults(season: string, kind: "results" | "sprint"): Promise<Race[]> {
  const key = kind === "results" ? "Results" : "SprintResults";
  const first = await get<RaceTable>(`${season}/${kind}.json?limit=${PAGE}&offset=0`);
  const total = Number(first.MRData.total);
  const offsets: number[] = [];
  for (let o = PAGE; o < total; o += PAGE) offsets.push(o);
  const rest = await Promise.all(offsets.map((o) => get<RaceTable>(`${season}/${kind}.json?limit=${PAGE}&offset=${o}`)));

  const byRound = new Map<string, Race>();
  for (const page of [first, ...rest]) {
    for (const race of page.MRData.RaceTable.Races) {
      const existing = byRound.get(race.round);
      if (existing) existing[key] = [...(existing[key] ?? []), ...(race[key] ?? [])];
      else byRound.set(race.round, { ...race });
    }
  }
  return [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
}
