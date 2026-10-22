"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { AnimatedNumber } from "@/components/animated-number";
import { Countdown } from "@/components/countdown";
import { SeasonSelect } from "@/components/season-select";
import type { DriverStanding, Race } from "@/lib/types";
import { raceDate } from "@/lib/race-date";
import { teamColor } from "@/lib/teams";

const CarScene = dynamic(() => import("./car-scene"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

/** Texto que sobe de dentro de uma máscara, como um letreiro. */
function MaskReveal({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        className={`block ${className ?? ""}`}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const NAV = [
  { href: "#destaques", label: "Destaques" },
  { href: "#classificacao", label: "Classificação" },
  { href: "#corridas", label: "Corridas" },
  { href: "#calendario", label: "Calendário" },
];

interface Props {
  season: string;
  seasons: string[];
  leader?: DriverStanding;
  gap?: number;
  next?: Race;
  doneRounds: number;
  totalRounds: number;
}

export function Hero({ season, seasons, leader, gap, next, doneRounds, totalRounds }: Props) {
  const team = leader?.Constructors.at(-1);

  return (
    <section className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative overflow-hidden rounded-sm bg-[radial-gradient(ellipse_at_30%_20%,#3a3f42_0%,#15181a_45%,#0a0c0d_100%)] shadow-2xl shadow-black/40 lg:w-[78%]"
      >
        {/* Faixas diagonais no fundo do card. */}
        <div className="pointer-events-none absolute top-24 left-[38%] h-16 w-[60%] -skew-x-[40deg] bg-gradient-to-r from-white/0 via-white/[0.04] to-white/0" />
        <div className="pointer-events-none absolute top-40 left-[52%] h-10 w-[35%] -skew-x-[40deg] bg-teal/10" />

        <nav className="relative z-10 flex items-center justify-between gap-4 px-6 pt-6 sm:px-8">
          <a href="#" className="flex items-center gap-2">
            <span className="font-display text-teal text-2xl leading-none font-extrabold italic">DASH</span>
            <span className="font-display text-sm leading-none font-semibold tracking-[0.3em] text-white/70">F1</span>
          </a>
          <div className="flex items-center gap-6">
            <ul className="hidden gap-6 text-[11px] font-medium tracking-[0.15em] text-white/70 uppercase md:flex">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="hover:text-teal transition-colors">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
            <SeasonSelect season={season} seasons={seasons} />
          </div>
        </nav>

        <div className="relative z-10 flex min-h-[460px] flex-col justify-end gap-6 p-6 sm:p-8 md:min-h-[520px]">
          <div className="max-w-md">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-teal mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase"
            >
              <span className="h-px w-8 bg-current" /> Líder · Temporada {season}
            </motion.p>
            {leader ? (
              <h1 className="font-display leading-[0.85]">
                <MaskReveal delay={0.35} className="text-5xl font-light text-white/90 sm:text-6xl">
                  {leader.Driver.givenName}
                </MaskReveal>
                <MaskReveal delay={0.5} className="text-chrome text-6xl font-extrabold tracking-tight sm:text-8xl">
                  {leader.Driver.familyName}
                </MaskReveal>
              </h1>
            ) : (
              <h1 className="font-display text-5xl font-bold">Temporada ainda não começou</h1>
            )}

            {leader && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-4 text-sm leading-relaxed text-white/60"
              >
                Pilotando pela <span style={{ color: teamColor(team?.constructorId) }}>{team?.name}</span>, soma{" "}
                <strong className="text-white">
                  <AnimatedNumber value={Number(leader.points)} /> pontos
                </strong>{" "}
                e {leader.wins} vitória{leader.wins === "1" ? "" : "s"} após {doneRounds} de {totalRounds} etapas
                {gap !== undefined && gap > 0 && <>, com {gap} pontos de vantagem sobre o vice-líder</>}.
              </motion.p>
            )}

            <motion.a
              href="#classificacao"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              className="group mt-6 inline-flex items-stretch overflow-hidden rounded-[2px] bg-white text-xs font-medium text-black"
            >
              <span className="px-4 py-2.5">Ver classificação</span>
              <span className="bg-teal grid w-9 place-items-center transition-[width] duration-300 group-hover:w-12">
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </motion.a>
          </div>
        </div>

        {/* Card de próxima corrida no canto, no lugar do “vídeo” da referência. */}
        {next && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.7, ease: EASE }}
            className="absolute top-24 right-6 z-10 hidden w-60 border border-white/40 bg-black/50 p-3 backdrop-blur-sm sm:block"
          >
            <p className="text-teal text-[10px] font-semibold tracking-[0.2em] uppercase">Próxima · R{next.round}</p>
            <p className="font-display mt-1 text-lg leading-tight font-semibold uppercase">{next.raceName}</p>
            <p className="mb-3 text-xs text-white/50">
              {next.Circuit.Location.locality} ·{" "}
              {raceDate(next).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </p>
            <Countdown to={raceDate(next).toISOString()} />
          </motion.div>
        )}
      </motion.div>

      {/* O canvas é maior que o card para o carro “sair” da moldura. */}
      <div className="pointer-events-none relative -mt-16 h-64 w-full sm:h-80 lg:absolute lg:right-[-2%] lg:-bottom-36 lg:mt-0 lg:h-[95%] lg:w-[62%]">
        <CarScene />
      </div>
    </section>
  );
}
