"use client";

import { motion } from "motion/react";
import { Timer, Trophy, Zap } from "lucide-react";

import { AnimatedNumber } from "@/components/animated-number";
import type { ConstructorStanding, DriverStanding, Race } from "@/lib/types";
import { teamColor } from "@/lib/teams";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  leader?: DriverStanding;
  runnerUp?: DriverStanding;
  topTeam?: ConstructorStanding;
  lastRace?: Race;
  doneRounds: number;
}

export function Highlights({ leader, runnerUp, topTeam, lastRace, doneRounds }: Props) {
  const winner = lastRace?.Results?.[0];
  const fastest = lastRace?.Results?.find((r) => r.FastestLap?.rank === "1");
  const gap = leader && runnerUp ? Number(leader.points) - Number(runnerUp.points) : undefined;

  return (
    <div id="destaques" className="grid scroll-mt-8 gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-start">
      {/* Card do vencedor da última corrida, com o canto recortado da referência. */}
      <motion.article
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        whileHover={{ y: -6 }}
        className="relative lg:mt-16"
      >
        <div className="bg-teal absolute -top-3 -right-3 h-10 w-10 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
        <div className="clip-corner relative overflow-hidden bg-gradient-to-br from-[#2a3033] via-[#14181a] to-[#090b0c] shadow-xl shadow-black/30">
          <div className="speed-streaks absolute inset-0 opacity-60" />
          <div className="relative flex aspect-[4/3.4] flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <span className="text-teal flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase">
                <Trophy className="size-3.5" /> Vencedor · R{lastRace?.round ?? "–"}
              </span>
              <span className="font-display text-[9rem] leading-[0.7] font-extrabold text-white/[0.06] italic">1</span>
            </div>
            <div>
              <p className="font-display text-4xl leading-none font-bold uppercase">
                {winner ? winner.Driver.familyName : "Sem corridas"}
              </p>
              {winner && (
                <p className="mt-1 flex items-center gap-2 text-sm text-white/60">
                  <span className="h-3 w-1 rounded-full" style={{ background: teamColor(winner.Constructor.constructorId) }} />
                  {winner.Constructor.name} · {winner.Time?.time ?? winner.status}
                </p>
              )}
            </div>
          </div>
          <p className="relative border-t border-white/10 bg-black/40 px-5 py-4 text-sm leading-relaxed text-white/70">
            {lastRace
              ? `${lastRace.raceName}, em ${lastRace.Circuit.Location.locality}. ${
                  winner ? `${winner.Driver.givenName} ${winner.Driver.familyName} largou em ${winner.grid}º e cruzou a linha em primeiro.` : ""
                }`
              : "A temporada ainda não teve corridas."}
          </p>
        </div>
      </motion.article>

      {/* Card editorial em “papel”, com manchete e painéis laterais. */}
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        className="bg-paper text-paper-ink grid shadow-xl shadow-black/20 md:grid-cols-[0.8fr_2fr_0.8fr]"
      >
        <SidePanel
          className="hidden md:flex md:self-end"
          icon={<Zap className="size-3.5" />}
          label="Volta mais rápida"
          value={fastest?.FastestLap?.Time.time ?? "—"}
          detail={fastest ? fastest.Driver.familyName : ""}
          color={teamColor(fastest?.Constructor.constructorId)}
        />

        <div className="flex flex-col">
          <div className="halftone flex-1 p-6 sm:p-8">
            <span className="font-display text-teal-deep text-4xl leading-none font-black">”</span>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display mt-2 text-2xl leading-[1.05] font-semibold uppercase sm:text-3xl"
            >
              {leader
                ? gap
                  ? `${leader.Driver.familyName} lidera o campeonato com ${gap} pontos de vantagem sobre ${runnerUp?.Driver.familyName}.`
                  : `${leader.Driver.familyName} divide a liderança do campeonato.`
                : "A temporada está prestes a começar."}
            </motion.h2>
            <p className="mt-3 text-[11px] tracking-wide text-black/50 uppercase">
              Classificação após {doneRounds} etapa{doneRounds === 1 ? "" : "s"}
            </p>
            <div className="mt-4 flex justify-end">
              <div className="h-3 w-24 -skew-x-[40deg] bg-black" />
              <div className="ml-1 h-3 w-6 -skew-x-[40deg] bg-black/60" />
            </div>
          </div>

          {/* Faixa com “borrão de velocidade”. */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#f2d22e] via-[#1b1f21] to-[#8c8a3e] px-6 py-6 text-white">
            <div className="speed-streaks absolute inset-0" />
            <div className="relative flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/70 uppercase">Construtores · líder</p>
                <p className="font-display text-3xl leading-none font-bold uppercase">{topTeam?.Constructor.name ?? "—"}</p>
              </div>
              <p className="font-display text-5xl leading-none font-extrabold italic">
                {topTeam ? <AnimatedNumber value={Number(topTeam.points)} /> : "0"}
                <span className="text-base font-medium text-white/60 not-italic"> pts</span>
              </p>
            </div>
          </div>
        </div>

        <SidePanel
          className="hidden md:flex md:self-end"
          icon={<Timer className="size-3.5" />}
          label="Vitórias do líder"
          value={leader ? leader.wins : "0"}
          detail={leader ? `${leader.Driver.familyName} · ${leader.Constructors.at(-1)?.name}` : ""}
          color={teamColor(leader?.Constructors.at(-1)?.constructorId)}
        />
      </motion.article>
    </div>
  );
}

function SidePanel({ icon, label, value, detail, color, className }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  color: string;
  className?: string;
}) {
  return (
    <div className={`relative h-[58%] flex-col justify-end overflow-hidden bg-gradient-to-t from-black to-[#2b3134] p-4 text-white ${className}`}>
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: color }} />
      <div className="speed-streaks absolute inset-0 opacity-40" />
      <div className="relative">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] text-white/60 uppercase">
          {icon} {label}
        </p>
        <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
        <p className="truncate text-xs text-white/50">{detail}</p>
      </div>
    </div>
  );
}
