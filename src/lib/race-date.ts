import type { Race } from "./types";

export function raceDate(race: Pick<Race, "date" | "time">): Date {
  return new Date(`${race.date}T${race.time ?? "00:00:00Z"}`);
}

export function nextRace(schedule: Race[], now = new Date()): Race | undefined {
  return schedule.find((r) => raceDate(r) >= now);
}
