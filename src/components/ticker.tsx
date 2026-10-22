import type { DriverStanding } from "@/lib/types";
import { teamColor } from "@/lib/teams";

/** Faixa rolante com a classificação, estilo transmissão de TV. */
export function Ticker({ drivers }: { drivers: DriverStanding[] }) {
  if (!drivers.length) return null;
  const items = drivers.slice(0, 20);
  return (
    <div className="bg-teal-ink/90 relative overflow-hidden border-y border-white/10 py-2.5 text-white">
      <div className="animate-marquee flex w-max gap-8">
        {[...items, ...items].map((d, i) => (
          <span key={i} className="font-display flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            <span className="text-teal">{d.positionText}</span>
            <span className="h-3 w-1 rounded-full" style={{ background: teamColor(d.Constructors.at(-1)?.constructorId) }} />
            {d.Driver.code ?? d.Driver.familyName}
            <span className="text-white/50">{d.points}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
