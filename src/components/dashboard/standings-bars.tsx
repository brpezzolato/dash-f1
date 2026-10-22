import { DriverAvatar } from "@/components/driver-avatar";
import type { DriverInfo } from "@/lib/types";

interface TeamRow { position: string; id: string; name: string; color: string; points: number; wins: number }
interface DriverRow { position: string; driver: DriverInfo; points: number; wins: number }

export function TeamStandings({ rows }: { rows: TeamRow[] }) {
  const max = rows[0]?.points || 1;
  return (
    <ul className="space-y-2.5">
      {rows.map((t) => (
        <li key={t.id} className="grid grid-cols-[1.25rem_7rem_1fr_3rem] items-center gap-3 text-sm">
          <span className="text-muted-foreground num">{t.position}</span>
          <span className="truncate font-medium">{t.name}</span>
          <div className="h-2 rounded-full bg-white/[0.05]">
            <div className="h-full rounded-full" style={{ width: `${(t.points / max) * 100}%`, background: t.color }} />
          </div>
          <span className="num text-right font-semibold">{t.points}</span>
        </li>
      ))}
    </ul>
  );
}

export function DriverStandings({ rows }: { rows: DriverRow[] }) {
  const max = rows[0]?.points || 1;
  return (
    <ul className="scrollbar-thin max-h-[420px] space-y-1 overflow-y-auto pr-1">
      {rows.map((r) => (
        <li key={r.driver.id} className="grid grid-cols-[1.5rem_auto_1fr_5rem_2.5rem] items-center gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-white/[0.04]">
          <span className="text-muted-foreground num">{r.position}</span>
          <DriverAvatar driver={r.driver} className="size-7" />
          <span className="min-w-0 truncate">
            <span className="font-semibold">{r.driver.familyName}</span>{" "}
            <span className="text-muted-foreground text-xs">{r.driver.team.name}</span>
          </span>
          <div className="h-1.5 rounded-full bg-white/[0.05]">
            <div className="h-full rounded-full" style={{ width: `${(r.points / max) * 100}%`, background: r.driver.team.color }} />
          </div>
          <span className="num text-right font-semibold">{r.points}</span>
        </li>
      ))}
    </ul>
  );
}

/** Legenda com as cores de cada equipe e seus pilotos. */
export function TeamLegend({ drivers }: { drivers: DriverRow[] }) {
  const teams = new Map<string, { name: string; color: string; codes: string[] }>();
  for (const d of drivers) {
    const t = teams.get(d.driver.team.id) ?? { name: d.driver.team.name, color: d.driver.team.color, codes: [] };
    t.codes.push(d.driver.code);
    teams.set(d.driver.team.id, t);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {[...teams.values()].map((t) => (
        <span key={t.name} className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] py-1 pr-3 pl-1.5 text-xs">
          <span className="size-3 rounded-full" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
          <span className="font-semibold">{t.name}</span>
          <span className="text-muted-foreground">{t.codes.join(" · ")}</span>
        </span>
      ))}
    </div>
  );
}
