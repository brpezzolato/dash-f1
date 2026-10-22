import type { DriverSeasonStats, DriverStanding, Race } from "./types";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined);

function age(dob?: string) {
  if (!dob) return undefined;
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
}

/** Estatísticas completas de cada piloto na temporada. */
export function seasonStats(races: Race[], sprints: Race[], standings: DriverStanding[]): Record<string, DriverSeasonStats> {
  const leaderPoints = Number(standings[0]?.points ?? 0);
  const teamPoints = new Map<string, number>();
  for (const s of standings) {
    const team = s.Constructors.at(-1)?.constructorId ?? "";
    teamPoints.set(team, (teamPoints.get(team) ?? 0) + Number(s.points));
  }
  const sprintPoints = new Map<string, number>();
  for (const race of sprints) {
    for (const r of race.SprintResults ?? []) {
      sprintPoints.set(r.Driver.driverId, (sprintPoints.get(r.Driver.driverId) ?? 0) + Number(r.points));
    }
  }

  const out: Record<string, DriverSeasonStats> = {};
  for (const s of standings) {
    const id = s.Driver.driverId;
    const entries = races.map((race) => ({ race, result: race.Results?.find((r) => r.Driver.driverId === id) }));
    const results = entries.flatMap((e) => (e.result ? [e.result] : []));
    const finished = results.filter((r) => /^\d+$/.test(r.positionText));
    const finishes = finished.map((r) => Number(r.position));
    const grids = results.map((r) => Number(r.grid)).filter((g) => g > 0);
    const team = s.Constructors.at(-1)?.constructorId ?? "";
    const points = Number(s.points);

    out[id] = {
      races: results.length,
      points,
      sprintPoints: sprintPoints.get(id) ?? 0,
      wins: Number(s.wins),
      podiums: finishes.filter((p) => p <= 3).length,
      poles: results.filter((r) => r.grid === "1").length,
      top10: finishes.filter((p) => p <= 10).length,
      dnfs: results.length - finished.length,
      fastestLaps: results.filter((r) => r.FastestLap?.rank === "1").length,
      bestFinish: finishes.length ? Math.min(...finishes) : undefined,
      avgFinish: avg(finishes),
      avgGrid: avg(grids),
      positionsGained: finished.reduce((acc, r) => (Number(r.grid) > 0 ? acc + Number(r.grid) - Number(r.position) : acc), 0),
      pointsPerRace: results.length ? points / results.length : 0,
      teamShare: teamPoints.get(team) ? points / teamPoints.get(team)! : 0,
      gapToLeader: leaderPoints - points,
      age: age(s.Driver.dateOfBirth),
      form: entries.map((e) => ({
        round: e.race.round,
        position: e.result && /^\d+$/.test(e.result.positionText) ? Number(e.result.position) : null,
      })),
    };
  }
  return out;
}
