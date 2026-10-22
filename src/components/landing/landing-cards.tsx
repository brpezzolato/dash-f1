/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";

import { DriverAvatar } from "@/components/driver-avatar";
import { TrackMap } from "@/components/track-map";
import type { CircuitInfo, DriverInfo, Race } from "@/lib/types";
import { thumbnail, watchUrl, type Highlight } from "@/lib/videos";

const card = "glass rounded-3xl p-5 flex flex-col";

export function NextRaceCard({ race, circuit, date }: { race?: Race; circuit?: CircuitInfo; date?: Date }) {
  return (
    <section className={card}>
      <h2 className="font-display text-lg font-bold">Próxima corrida</h2>
      {race && date ? (
        <>
          <p className="mt-3 font-semibold">{race.raceName}</p>
          <p className="text-muted-foreground text-sm">{race.Circuit.circuitName}</p>
          <TrackMap map={circuit?.map} className="my-3 h-40 w-full" />
          <div className="mt-auto flex items-end justify-between">
            <div>
              <p className="font-display text-xl font-bold uppercase">
                {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <p className="text-f1 text-sm">Rodada {race.round}</p>
            </div>
            {circuit?.lengthKm && (
              <p className="text-muted-foreground text-right text-xs">
                {circuit.lengthKm.toFixed(3)} km
                <br />
                {circuit.laps} voltas
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">Temporada encerrada.</p>
      )}
    </section>
  );
}

export function StandingsCard({ rows, season }: { rows: Array<{ position: string; driver: DriverInfo; points: number }>; season: string }) {
  return (
    <section className={card}>
      <h2 className="font-display text-lg font-bold">Classificação</h2>
      <ol className="mt-3 space-y-1">
        {rows.slice(0, 5).map((r, i) => (
          <li
            key={r.driver.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${i === 0 ? "bg-white/[0.07]" : ""}`}
          >
            <span className="text-muted-foreground num w-4">{r.position}</span>
            <DriverAvatar driver={r.driver} className="size-7" />
            <span className="flex-1 truncate">
              {r.driver.givenName} <span className="font-semibold">{r.driver.familyName}</span>
            </span>
            <span className="h-4 w-1 rounded-full" style={{ background: r.driver.team.color }} />
            <span className="num w-16 text-right font-semibold">{r.points} pts</span>
          </li>
        ))}
      </ol>
      <Link href={`/dashboard?season=${season}#campeonato`} className="text-f1 mt-auto inline-flex items-center gap-1 pt-4 text-sm">
        Ver classificação completa <ArrowUpRight className="size-4" />
      </Link>
    </section>
  );
}

export function HighlightsCard({ videos }: { videos: Highlight[] }) {
  return (
    <section className={card}>
      <h2 className="font-display text-lg font-bold">Destaques em vídeo</h2>
      <ul className="mt-3 space-y-3">
        {videos.map((v) => (
          <li key={v.id}>
            <a href={watchUrl(v.id)} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
              <span className="relative block aspect-video w-24 shrink-0 overflow-hidden rounded-lg">
                <img src={thumbnail(v.id)} alt="" className="size-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                <span className="absolute inset-0 grid place-items-center bg-black/30">
                  <Play className="size-4 fill-white text-white" />
                </span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold group-hover:text-white">{v.title}</span>
                <span className="text-muted-foreground block truncate text-xs">{v.subtitle}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a href="https://www.youtube.com/@Formula1/videos" target="_blank" rel="noreferrer" className="text-f1 mt-auto inline-flex items-center gap-1 pt-4 text-sm">
        Mais no canal oficial <ArrowUpRight className="size-4" />
      </a>
    </section>
  );
}
