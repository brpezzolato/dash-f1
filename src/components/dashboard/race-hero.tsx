import { Flag, Timer, Trophy } from "lucide-react";

import { TrackMap } from "@/components/track-map";
import type { RaceAnalysis } from "@/lib/f1";

export function RaceHero({ analysis }: { analysis: RaceAnalysis }) {
  const { race, circuit, leaderboard } = analysis;
  const winner = leaderboard[0];
  const fastest = leaderboard.find((r) => r.fastest);
  const color = winner?.driver.team.color ?? "#e10600";

  return (
    <section
      id="corrida"
      className="glass relative isolate min-h-[260px] scroll-mt-6 overflow-hidden rounded-3xl p-6 sm:p-8"
      style={{ background: `radial-gradient(ellipse at 85% 30%, ${color}40, transparent 55%), linear-gradient(180deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.02))` }}
    >
      <TrackMap map={circuit.map} color={color} className="absolute top-1/2 right-2 -z-10 h-[120%] max-w-[48%] -translate-y-1/2 opacity-35 sm:right-8" />
      <p className="kicker">Última corrida · Rodada {race.round}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl leading-none font-black sm:text-5xl">{race.raceName}</h1>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">Encerrada</span>
      </div>
      <p className="text-muted-foreground mt-2 text-sm">
        {circuit.name} · {circuit.locality}, {circuit.country} ·{" "}
        {new Date(race.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {winner && <Chip icon={<Trophy className="size-3.5" />} label="Vencedor" value={`${winner.driver.familyName} · ${winner.driver.team.name}`} color={color} />}
        {fastest?.bestLap && <Chip icon={<Timer className="size-3.5" />} label="Volta mais rápida" value={`${fastest.bestLap} · ${fastest.driver.code}`} color="#b84dff" />}
        {winner && <Chip icon={<Flag className="size-3.5" />} label="Voltas" value={`${winner.laps}${circuit.laps ? ` / ${circuit.laps}` : ""}`} />}
      </div>
    </section>
  );
}

function Chip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 backdrop-blur">
      <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase" style={{ color }}>
        {icon} {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
