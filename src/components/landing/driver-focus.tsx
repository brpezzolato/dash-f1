/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { DriverInfo } from "@/lib/types";

interface Props {
  driver?: DriverInfo;
  points?: number;
  wins?: number;
  gap?: number;
  completed: number;
  total: number;
  season: string;
}

export function DriverFocus({ driver, points, wins, gap, completed, total, season }: Props) {
  if (!driver) {
    return (
      <div className="py-24">
        <p className="kicker">Temporada {season}</p>
        <h1 className="font-display mt-2 text-5xl font-black uppercase">A temporada ainda não começou</h1>
      </div>
    );
  }

  return (
    <div className="relative grid min-h-[420px] items-end gap-6 md:grid-cols-[1.1fr_1fr]">
      {/* Brilho na cor da equipe atrás do piloto. */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-full w-full opacity-60 md:w-1/2"
        style={{ background: `radial-gradient(circle at 60% 40%, ${driver.team.color}66, transparent 62%)` }}
      />

      <div className="relative z-10 pb-2">
        <p className="kicker">Destaque · líder do campeonato</p>
        <h1 className="font-display mt-3 text-5xl leading-[0.9] font-black tracking-tight uppercase sm:text-7xl">
          {driver.givenName}
          <br />
          {driver.familyName}
        </h1>
        <p className="mt-3 flex items-center gap-2 font-medium">
          <span className="size-2.5 rounded-full" style={{ background: driver.team.color }} />
          {driver.team.name}
        </p>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
          {points} pontos e {wins} vitória{wins === 1 ? "" : "s"} após {completed} de {total} etapas
          {gap ? `: ${gap} pontos à frente do vice-líder.` : "."}
        </p>
        <Link
          href={`/dashboard?season=${season}`}
          className="bg-f1 mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_#e10600] transition-transform hover:translate-x-0.5"
        >
          Abrir dashboard <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="relative z-0 flex h-full min-h-[300px] items-end justify-center md:min-h-[420px]">
        {driver.number !== undefined && (
          <span
            className="font-display absolute top-4 right-2 text-[14rem] leading-none font-black italic opacity-80 sm:text-[18rem]"
            style={{ color: "transparent", WebkitTextStroke: `3px ${driver.team.color}` }}
          >
            {driver.number}
          </span>
        )}
        {driver.headshot ? (
          <img
            src={driver.headshot}
            alt={`${driver.givenName} ${driver.familyName}`}
            className="relative h-[300px] w-auto object-contain drop-shadow-[0_20px_40px_rgb(0_0_0/0.6)] sm:h-[420px]"
          />
        ) : (
          <span className="font-display relative mb-10 text-7xl font-black tracking-widest text-white/10">{driver.code}</span>
        )}
      </div>
    </div>
  );
}
