import "server-only";

import type { ConstructorStanding, DriverStanding, Progression, Race, SeasonData } from "./types";
import { teamColor } from "./teams";

// Jolpica é a sucessora mantida pela comunidade da antiga Ergast API.
const BASE = process.env.F1_API_BASE ?? "https://api.jolpi.ca/ergast/f1";
const PAGE_SIZE = 100;
const REVALIDATE_SECONDS = 60 * 30;

export const FIRST_SEASON = 2000;

interface MR<T> {
  MRData: T & { total: string };
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Jolpica respondeu ${res.status} para ${path}`);
  return res.json();
}

type RaceTable = MR<{ RaceTable: { Races: Race[] } }>;

async function driverStandings(season: string): Promise<DriverStanding[]> {
  const data = await getJson<MR<{ StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] } }>>(
    `${season}/driverstandings.json`,
  );
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

async function constructorStandings(season: string): Promise<ConstructorStanding[]> {
  const data = await getJson<
    MR<{ StandingsTable: { StandingsLists: { ConstructorStandings: ConstructorStanding[] }[] } }>
  >(`${season}/constructorstandings.json`);
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

async function schedule(season: string): Promise<Race[]> {
  const data = await getJson<RaceTable>(`${season}.json?limit=${PAGE_SIZE}`);
  return data.MRData.RaceTable.Races;
}

async function lastRace(season: string): Promise<Race | undefined> {
  const data = await getJson<RaceTable>(`${season}/last/results.json`);
  return data.MRData.RaceTable.Races[0];
}

// A API pagina por resultado individual, então uma mesma corrida pode vir
// dividida entre duas páginas; juntamos as corridas pelo número da etapa.
async function allPaged(season: string, kind: "results" | "sprint"): Promise<Race[]> {
  const key = kind === "results" ? "Results" : "SprintResults";
  const first = await getJson<RaceTable>(`${season}/${kind}.json?limit=${PAGE_SIZE}&offset=0`);
  const total = Number(first.MRData.total);
  const offsets = [];
  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) offsets.push(offset);
  const rest = await Promise.all(
    offsets.map((offset) => getJson<RaceTable>(`${season}/${kind}.json?limit=${PAGE_SIZE}&offset=${offset}`)),
  );

  const byRound = new Map<string, Race>();
  for (const page of [first, ...rest]) {
    for (const race of page.MRData.RaceTable.Races) {
      const existing = byRound.get(race.round);
      if (existing) existing[key] = [...(existing[key] ?? []), ...(race[key] ?? [])];
      else byRound.set(race.round, { ...race });
    }
  }
  return [...byRound.values()];
}

function buildProgression(races: Race[], sprints: Race[], top = 6): Progression {
  const sprintByRound = new Map(sprints.map((s) => [s.round, s.SprintResults ?? []]));
  const totals = new Map<string, number>();
  const teamOf = new Map<string, string>();
  const codeOf = new Map<string, string>();

  const rows = [...races]
    .sort((a, b) => Number(a.round) - Number(b.round))
    .map((race) => {
      for (const r of [...(race.Results ?? []), ...(sprintByRound.get(race.round) ?? [])]) {
        const id = r.Driver.driverId;
        totals.set(id, (totals.get(id) ?? 0) + Number(r.points));
        teamOf.set(id, r.Constructor.constructorId);
        codeOf.set(id, r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase());
      }
      return { round: `R${race.round}`, race: race.raceName, ...Object.fromEntries(totals) };
    });

  // Companheiros de equipe têm a mesma cor; o segundo aparece tracejado.
  const seenTeams = new Set<string>();
  const drivers = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([id]) => {
      const team = teamOf.get(id)!;
      const dashed = seenTeams.has(team);
      seenTeams.add(team);
      return { id, code: codeOf.get(id)!, color: teamColor(team), dashed };
    });

  return { rows, drivers };
}

export async function getSeasonData(season: string): Promise<SeasonData> {
  const [drivers, constructors, races, last, results, sprints] = await Promise.all([
    driverStandings(season),
    constructorStandings(season),
    schedule(season),
    lastRace(season),
    allPaged(season, "results"),
    allPaged(season, "sprint"),
  ]);
  return {
    season,
    drivers,
    constructors,
    schedule: races,
    lastRace: last,
    progression: buildProgression(results, sprints),
  };
}
