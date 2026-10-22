import { COMPOUNDS, compound } from "@/components/tyres";
import type { StrategyRow } from "@/lib/types";

/** Gráfico de stints: uma barra por piloto, cada segmento é um jogo de pneus. */
export function TyreStrategy({ rows }: { rows: StrategyRow[] }) {
  const total = Math.max(...rows.map((r) => Math.max(r.totalLaps, ...r.stints.map((s) => s.to))));
  const ticks = Array.from({ length: Math.floor(total / 10) + 1 }, (_, i) => i * 10);
  const used = new Set(rows.flatMap((r) => r.stints.map((s) => s.compound.toUpperCase())));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        {Object.entries(COMPOUNDS)
          .filter(([k]) => used.has(k))
          .map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5 text-white/80">
              <span className="size-2.5 rounded-full" style={{ background: c.color }} /> {c.label}
            </span>
          ))}
        <span className="text-muted-foreground ml-auto">Números = voltas no stint · ° = pneu usado</span>
      </div>

      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.driver.id} className="grid grid-cols-[3.5rem_1fr] items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="h-3 w-1 rounded-full" style={{ background: r.driver.team.color }} />
              {r.driver.code}
            </span>
            <div className="relative h-5 rounded-md bg-white/[0.04]">
              {r.stints.map((s, i) => {
                const c = compound(s.compound);
                const laps = s.to - s.from + 1;
                return (
                  <div
                    key={i}
                    title={`${c.label} · voltas ${s.from}–${s.to}${s.age ? ` · ${s.age} voltas de uso` : ""}`}
                    className="absolute top-0 flex h-full items-center justify-center overflow-hidden rounded-[5px] border border-black/60 text-[10px] font-bold text-black/80"
                    style={{ left: `${((s.from - 1) / total) * 100}%`, width: `${(laps / total) * 100}%`, background: c.color }}
                  >
                    {laps >= 4 && (
                      <>
                        {laps}
                        {s.age > 0 && "°"}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="text-muted-foreground relative mt-2 ml-[4.25rem] h-4 text-[10px]">
        {ticks.map((t) => (
          <span key={t} className="num absolute -translate-x-1/2" style={{ left: `${(t / total) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
