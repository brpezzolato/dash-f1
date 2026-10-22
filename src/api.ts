import type { ConstructorStanding, DriverStanding, Race } from './types';

// Jolpica é o sucessor mantido pela comunidade da antiga Ergast API.
const BASE = 'https://api.jolpi.ca/ergast/f1';
const PAGE_SIZE = 100;

const cache = new Map<string, Promise<unknown>>();

async function getJson<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    const req = fetch(`${BASE}/${path}`).then((res) => {
      if (!res.ok) throw new Error(`Erro ${res.status} ao buscar ${path}`);
      return res.json();
    });
    req.catch(() => cache.delete(path));
    cache.set(path, req);
  }
  return cache.get(path) as Promise<T>;
}

interface MR<T> {
  MRData: T & { total: string; limit: string; offset: string };
}

export async function fetchDriverStandings(season: string): Promise<DriverStanding[]> {
  const data = await getJson<MR<{ StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] } }>>(
    `${season}/driverstandings.json`,
  );
  return data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function fetchConstructorStandings(season: string): Promise<ConstructorStanding[]> {
  const data = await getJson<
    MR<{ StandingsTable: { StandingsLists: { ConstructorStandings: ConstructorStanding[] }[] } }>
  >(`${season}/constructorstandings.json`);
  return data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

export async function fetchSchedule(season: string): Promise<Race[]> {
  const data = await getJson<MR<{ RaceTable: { Races: Race[] } }>>(`${season}.json?limit=${PAGE_SIZE}`);
  return data.MRData.RaceTable.Races;
}

export async function fetchLastRace(season: string): Promise<Race | undefined> {
  const data = await getJson<MR<{ RaceTable: { Races: Race[] } }>>(`${season}/last/results.json`);
  return data.MRData.RaceTable.Races[0];
}

// A API pagina por resultado individual, e uma mesma corrida pode vir dividida
// entre duas páginas; por isso juntamos as corridas pelo número da etapa.
async function fetchAllPaged(season: string, kind: 'results' | 'sprint'): Promise<Race[]> {
  const key = kind === 'results' ? 'Results' : 'SprintResults';
  const byRound = new Map<string, Race>();
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const data = await getJson<MR<{ RaceTable: { Races: Race[] } }>>(
      `${season}/${kind}.json?limit=${PAGE_SIZE}&offset=${offset}`,
    );
    total = Number(data.MRData.total);
    for (const race of data.MRData.RaceTable.Races) {
      const existing = byRound.get(race.round);
      if (existing) existing[key] = [...(existing[key] ?? []), ...(race[key] ?? [])];
      else byRound.set(race.round, { ...race });
    }
    offset += PAGE_SIZE;
  }
  return [...byRound.values()];
}

export const fetchSeasonResults = (season: string) => fetchAllPaged(season, 'results');
export const fetchSeasonSprints = (season: string) => fetchAllPaged(season, 'sprint');
