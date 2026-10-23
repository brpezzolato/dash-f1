import "server-only";

import { CIRCUITS } from "./circuits";
import { flagFor } from "./flags";
import { seasonStats } from "./stats";
import { optional } from "./http";
import { lerPacote } from "./pacote";
import { usandoPacote } from "./sources/buscar";
import * as jolpica from "./sources/jolpica";
import * as mv from "./sources/multiviewer";
import * as openf1 from "./sources/openf1";
import { teamColor, teamInfo } from "./teams";
import type {
  CircuitInfo,
  DriverSeasonStats,
  TrackMap,
  ConstructorStanding,
  Constructor,
  Driver,
  DriverInfo,
  DriverStanding,
  LapDistribution,
  LeaderboardRow,
  OF1Driver,
  OF1Lap,
  OF1Meeting,
  OF1Stint,
  OF1Weather,
  PointsSeries,
  Race,
  StrategyRow,
  WeatherSummary,
} from "./types";

export const FIRST_SEASON = 2000;
/** O OpenF1 só tem dados a partir de 2023. */
export const FIRST_TELEMETRY_SEASON = 2023;

export function seasons(): string[] {
  // Com dados vindos da rede, só existe a temporada que veio no pacote.
  if (usandoPacote()) {
    const recebido = lerPacote();
    return recebido ? [recebido.pacote.temporada] : [String(new Date().getFullYear())];
  }
  const current = new Date().getFullYear();
  return Array.from({ length: current - FIRST_SEASON + 1 }, (_, i) => String(current - i));
}

export function resolveSeason(requested?: string): string {
  const all = seasons();
  return requested && all.includes(requested) ? requested : all[0];
}

export function raceDate(race: Pick<Race, "date" | "time">): Date {
  return new Date(`${race.date}T${race.time ?? "00:00:00Z"}`);
}

/* ---------------------------------------------------------------- pilotos */

type OF1ByCode = Map<string, OF1Driver>;

function driverInfo(d: Driver, c: Constructor, of1: OF1ByCode): DriverInfo {
  const code = d.code ?? d.familyName.slice(0, 3).toUpperCase();
  const live = of1.get(code);
  return {
    id: d.driverId,
    code,
    number: live?.driver_number ?? (d.permanentNumber ? Number(d.permanentNumber) : undefined),
    givenName: d.givenName,
    familyName: d.familyName,
    team: teamInfo(c.constructorId, c.name, live?.team_colour),
    headshot: live?.headshot_url?.replace("1col", "3col"),
    countryCode: live?.country_code,
    flag: flagFor(d.nationality),
  };
}

/* --------------------------------------------------------------- circuito */

function sameDay(a: Date, b: Date, days: number) {
  return Math.abs(a.getTime() - b.getTime()) <= days * 86_400_000;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Encontra o evento do OpenF1 que corresponde a uma corrida da Jolpica. */
function findMeeting(race: Race, meetings: OF1Meeting[]): OF1Meeting | undefined {
  const date = raceDate(race);
  return (
    meetings.find((m) => sameDay(new Date(m.date_start), date, 4)) ??
    meetings.find((m) => norm(m.location) === norm(race.Circuit.Location.locality)) ??
    meetings.find((m) => norm(m.country_name) === norm(race.Circuit.Location.country))
  );
}

async function circuitInfo(race: Race, meetings: OF1Meeting[][]): Promise<CircuitInfo> {
  const meta = CIRCUITS[race.Circuit.circuitId];
  const info: CircuitInfo = {
    name: race.Circuit.circuitName,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    ...meta,
  };
  const meeting = meetings.map((list) => findMeeting(race, list)).find(Boolean);
  if (!meeting) return info;

  const year = Number(race.season);
  const shape =
    (await optional(mv.circuit(meeting.circuit_key, year))) ??
    (await optional(mv.circuit(meeting.circuit_key, year - 1)));
  return { ...info, map: shape ? mv.toTrackMap(shape) : undefined };
}

/* ------------------------------------------------------------- análises */

/** "1:35:21.231" → segundos. */
function parseDuration(text: string): number {
  return text.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);
}

/** "+3.611" ou "+1:02.345" → segundos. */
function parseGap(text: string): number | undefined {
  const v = parseDuration(text.replace("+", ""));
  return Number.isFinite(v) ? v : undefined;
}

function summarizeWeather(rows: OF1Weather[]): WeatherSummary | undefined {
  if (!rows.length) return undefined;
  const avg = (k: keyof OF1Weather) => rows.reduce((s, r) => s + Number(r[k]), 0) / rows.length;
  return {
    airTemp: avg("air_temperature"),
    trackTemp: avg("track_temperature"),
    humidity: avg("humidity"),
    windSpeed: avg("wind_speed"),
    rain: rows.some((r) => r.rainfall > 0),
  };
}

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}

/** Voltas “limpas”: sem volta 1, sem entrada/saída de box e sem safety car (> 107% da mediana). */
function cleanLaps(laps: OF1Lap[]): number[] {
  const pitIn = new Set(laps.filter((l) => l.is_pit_out_lap).map((l) => l.lap_number - 1));
  const times = laps
    .filter((l) => l.lap_number > 1 && !l.is_pit_out_lap && !pitIn.has(l.lap_number) && l.lap_duration)
    .map((l) => l.lap_duration as number)
    .sort((a, b) => a - b);
  if (!times.length) return [];
  const median = quantile(times, 0.5);
  return times.filter((t) => t <= median * 1.07);
}

function pointsSeries(races: Race[], sprints: Race[], drivers: DriverStanding[], top = 6): PointsSeries {
  const sprintByRound = new Map(sprints.map((s) => [s.round, s.SprintResults ?? []]));
  const totals = new Map<string, number>();
  const rows = races.map((race) => {
    for (const r of [...(race.Results ?? []), ...(sprintByRound.get(race.round) ?? [])]) {
      totals.set(r.Driver.driverId, (totals.get(r.Driver.driverId) ?? 0) + Number(r.points));
    }
    return { round: `R${race.round}`, race: race.raceName, ...Object.fromEntries(totals) };
  });

  // Companheiros de equipe têm a mesma cor; o segundo aparece tracejado.
  const seen = new Set<string>();
  const series = drivers.slice(0, top).map((d) => {
    const team = d.Constructors.at(-1)?.constructorId ?? "";
    const dashed = seen.has(team);
    seen.add(team);
    return { id: d.Driver.driverId, code: d.Driver.code ?? d.Driver.familyName.slice(0, 3), color: teamColor(team), dashed };
  });
  return { rows, drivers: series };
}

/* ------------------------------------------------------------- agregados */

export interface SeasonOverview {
  season: string;
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  schedule: Race[];
  nextRace?: Race;
  completedRounds: number;
  leader?: DriverInfo;
  standings: Array<{ position: string; driver: DriverInfo; points: number; wins: number }>;
  teams: Array<{ position: string; id: string; name: string; color: string; points: number; wins: number }>;
  nextCircuit?: CircuitInfo;
}

export interface RaceAnalysis {
  race: Race;
  circuit: CircuitInfo;
  weather?: WeatherSummary;
  leaderboard: LeaderboardRow[];
  strategy: StrategyRow[];
  distribution: LapDistribution[];
  /** Se os dados do OpenF1 (pneus, voltas, clima) estão disponíveis. */
  telemetry: boolean;
  /** Há uma corrida acontecendo agora. */
  live: boolean;
  /** Tempo médio de volta do vencedor, em segundos. */
  avgLap?: number;
}

export interface Dashboard extends SeasonOverview {
  points: PointsSeries;
  lastRace?: RaceAnalysis;
  stats: Record<string, DriverSeasonStats>;
  /** Traçados de várias etapas, usados na animação de carregamento. */
  tracks: Array<{ name: string; map: TrackMap }>;
}

async function openF1Context(season: string) {
  if (Number(season) < FIRST_TELEMETRY_SEASON)
    return { drivers: new Map() as OF1ByCode, meetings: [] as OF1Meeting[][], live: false, lastSession: undefined };
  const [sessions, current, previous] = await Promise.all([
    optional(openf1.raceSessions(season)),
    optional(openf1.meetings(season)),
    optional(openf1.meetings(String(Number(season) - 1))),
  ]);
  const now = Date.now();
  const last = sessions?.filter((s) => new Date(s.date_end).getTime() < now).at(-1);
  const live = Boolean(sessions?.some((s) => new Date(s.date_start).getTime() <= now && now <= new Date(s.date_end).getTime()));
  const drivers = last ? await optional(openf1.drivers(last.session_key)) : undefined;
  return {
    lastSession: last,
    live,
    drivers: new Map((drivers ?? []).map((d) => [d.name_acronym, d])) as OF1ByCode,
    meetings: [current ?? [], previous ?? []],
  };
}

export async function getOverview(season: string): Promise<SeasonOverview & { ctx: Awaited<ReturnType<typeof openF1Context>> }> {
  const [drivers, constructors, schedule, ctx] = await Promise.all([
    jolpica.driverStandings(season),
    jolpica.constructorStandings(season),
    jolpica.schedule(season),
    openF1Context(season),
  ]);

  const now = new Date();
  const nextRace = schedule.find((r) => raceDate(r) >= now);
  const completedRounds = nextRace ? Number(nextRace.round) - 1 : schedule.length;
  const standings = drivers.map((d) => ({
    position: d.positionText,
    driver: driverInfo(d.Driver, d.Constructors.at(-1)!, ctx.drivers),
    points: Number(d.points),
    wins: Number(d.wins),
  }));
  const teams = constructors.map((c) => ({
    position: c.positionText,
    id: c.Constructor.constructorId,
    name: teamInfo(c.Constructor.constructorId, c.Constructor.name).name,
    color: teamColor(c.Constructor.constructorId),
    points: Number(c.points),
    wins: Number(c.wins),
  }));

  return {
    season,
    drivers,
    constructors,
    schedule,
    nextRace,
    completedRounds,
    leader: standings[0]?.driver,
    standings,
    teams,
    nextCircuit: nextRace ? await circuitInfo(nextRace, ctx.meetings) : undefined,
    ctx,
  };
}

async function raceAnalysis(
  race: Race,
  ctx: Awaited<ReturnType<typeof openF1Context>>,
): Promise<RaceAnalysis> {
  const session = ctx.lastSession && sameDay(new Date(ctx.lastSession.date_start), raceDate(race), 2) ? ctx.lastSession : undefined;
  const [weatherRows, stintRows, lapRows, circuit] = await Promise.all([
    session ? optional(openf1.weather(session.session_key)) : undefined,
    session ? optional(openf1.stints(session.session_key)) : undefined,
    session ? optional(openf1.laps(session.session_key)) : undefined,
    circuitInfo(race, ctx.meetings),
  ]);

  const results = race.Results ?? [];
  const infos = results.map((r) => driverInfo(r.Driver, r.Constructor, ctx.drivers));
  const stintsOf = (n?: number): OF1Stint[] =>
    (stintRows ?? []).filter((s) => s.driver_number === n).sort((a, b) => a.stint_number - b.stint_number);

  const winnerLaps = Number(results[0]?.laps ?? 0);
  const leaderboard: LeaderboardRow[] = results.map((r, i) => {
    const stints = stintsOf(infos[i].number);
    const lastStint = stints.at(-1);
    const lapsDown = Math.max(0, winnerLaps - Number(r.laps));
    const finished = /^(Finished|\+\d+ Laps?|Lapped)$/.test(r.status) || Boolean(r.Time);
    return {
      position: r.positionText,
      driver: infos[i],
      grid: Number(r.grid),
      laps: Number(r.laps),
      gap: i === 0 ? (r.Time?.time ?? "—") : (r.Time?.time ?? r.status),
      gapSeconds: i === 0 ? 0 : r.Time ? parseGap(r.Time.time) : undefined,
      lapsDown,
      finished,
      points: Number(r.points),
      bestLap: r.FastestLap?.Time.time,
      fastest: r.FastestLap?.rank === "1",
      tyres: stints.map((s) => s.compound),
      finalTyre: lastStint
        ? { compound: lastStint.compound, laps: lastStint.lap_end - lastStint.lap_start + 1 + (lastStint.tyre_age_at_start ?? 0) }
        : undefined,
    };
  });
  const winnerTime = results[0]?.Time?.time ? parseDuration(results[0].Time.time) : undefined;

  const strategy: StrategyRow[] = results
    .map((r, i) => ({
      driver: infos[i],
      totalLaps: Number(r.laps),
      stints: stintsOf(infos[i].number).map((s) => ({
        compound: s.compound,
        from: s.lap_start,
        to: s.lap_end,
        age: s.tyre_age_at_start,
      })),
    }))
    .filter((s) => s.stints.length);

  const distribution: LapDistribution[] = infos
    .slice(0, 10)
    .map((driver) => {
      const laps = cleanLaps((lapRows ?? []).filter((l) => l.driver_number === driver.number));
      if (laps.length < 5) return undefined;
      return {
        driver,
        laps,
        min: laps[0],
        q1: quantile(laps, 0.25),
        median: quantile(laps, 0.5),
        q3: quantile(laps, 0.75),
        max: laps.at(-1)!,
      };
    })
    .filter((d): d is LapDistribution => Boolean(d));

  return {
    race,
    circuit,
    weather: summarizeWeather(weatherRows ?? []),
    leaderboard,
    strategy,
    distribution,
    telemetry: Boolean(stintRows?.length || lapRows?.length),
    live: ctx.live,
    avgLap: winnerTime && winnerLaps ? winnerTime / winnerLaps : undefined,
  };
}

export async function getDashboard(season: string): Promise<Dashboard> {
  const [overview, last, results, sprints] = await Promise.all([
    getOverview(season),
    jolpica.lastRace(season),
    jolpica.allResults(season, "results"),
    optional(jolpica.allResults(season, "sprint")),
  ]);
  const { ctx, ...rest } = overview;
  const [lastRace, tracks] = await Promise.all([last ? raceAnalysis(last, ctx) : undefined, loaderTracks(overview.schedule, ctx)]);
  return {
    ...rest,
    points: pointsSeries(results, sprints ?? [], overview.drivers),
    lastRace,
    stats: seasonStats(results, sprints ?? [], overview.drivers),
    tracks,
  };
}

/** Até 8 traçados do calendário, para o loading alternar entre pistas. */
async function loaderTracks(schedule: Race[], ctx: Awaited<ReturnType<typeof openF1Context>>) {
  const picks = schedule.filter((_, i) => i % Math.max(1, Math.ceil(schedule.length / 8)) === 0).slice(0, 8);
  const infos = await Promise.all(picks.map((r) => optional(circuitInfo(r, ctx.meetings))));
  return infos.flatMap((c) => (c?.map ? [{ name: c.name, map: c.map }] : []));
}

/** Dados da tela inicial: visão da temporada + análise da última corrida. */
export async function getHome(season: string): Promise<SeasonOverview & { lastRace?: RaceAnalysis }> {
  const [overview, last] = await Promise.all([getOverview(season), jolpica.lastRace(season)]);
  const { ctx, ...rest } = overview;
  return { ...rest, lastRace: last ? await raceAnalysis(last, ctx) : undefined };
}
