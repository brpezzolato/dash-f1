"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Headshot } from "@/components/headshot";
import type { DriverInfo, TrackMap } from "@/lib/types";

const STEP_MS = 170;
const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Abertura do site: passa por todos os pilotos do grid, um a um, sobre os
 * traçados das pistas da temporada, e depois abre como uma cortina.
 */
export function IntroLoader({ drivers, tracks, season }: { drivers: DriverInfo[]; tracks: Array<{ name: string; map: TrackMap }>; season: string }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const total = drivers.length;

  useEffect(() => {
    if (!total || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const id = setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= total) {
          clearInterval(id);
          setTimeout(() => setDone(true), 450);
          return i;
        }
        return i + 1;
      });
    }, STEP_MS);
    return () => clearInterval(id);
  }, [total]);

  useEffect(() => {
    if (done) document.documentElement.style.overflow = "";
  }, [done]);

  const driver = drivers[index];
  const track = tracks.length ? tracks[index % tracks.length] : undefined;

  return (
    <AnimatePresence>
      {!done && driver && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[90] overflow-hidden bg-[#050506]"
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: EASE } }}
          style={{ clipPath: "inset(0 0 0% 0)" }}
          onClick={() => setDone(true)}
        >
          {/* Grade de fundo e brilho na cor da equipe. */}
          <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
          {/* Brilho trocado direto (sem interpolar gradiente na tela inteira). */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, ${driver.team.color}55, transparent 55%)` }} />

          {/* Traçado da pista da vez. */}
          {track && (
            <svg viewBox="0 0 1000 1000" className="absolute top-1/2 left-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 opacity-40" aria-hidden>
              <motion.path
                key={track.name}
                d={track.map.path}
                fill="none"
                stroke={driver.team.color}
                strokeWidth="6"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: STEP_MS * 3 / 1000, ease: "linear" }}
              />
            </svg>
          )}

          {/* Número gigante em contorno. */}
          <div
            className="font-display absolute inset-0 grid place-items-center text-[38vmin] leading-none font-black italic select-none"
            style={{ color: "transparent", WebkitTextStroke: `2px ${driver.team.color}88` }}
          >
            {driver.number ?? driver.code}
          </div>

          {/* Foto do piloto. */}
          <div className="absolute inset-0 grid place-items-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 30, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 1.05 }}
                transition={{ duration: 0.16 }}
                className="relative size-[46vmin] overflow-hidden rounded-full ring-1 ring-white/15"
                style={{ background: `linear-gradient(170deg, ${driver.team.color}, #050506 85%)` }}
              >
                <Headshot driver={driver} size={480} priority className="size-full" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Rodapé: nome, contador e progresso. */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-white/45 uppercase">Grid {season} · {track?.name ?? "carregando"}</p>
                <p className="font-display mt-1 text-3xl font-bold uppercase sm:text-5xl">
                  <span className="font-normal text-white/60">{driver.givenName} </span>
                  {driver.familyName}
                </p>
                <p className="text-sm" style={{ color: driver.team.color }}>
                  {driver.team.name}
                </p>
              </div>
              <p className="font-mono text-4xl text-white/80 tabular-nums sm:text-6xl">
                {String(index + 1).padStart(2, "0")}
                <span className="text-white/30">/{String(total).padStart(2, "0")}</span>
              </p>
            </div>
            <div className="mt-5 h-[2px] w-full bg-white/10">
              <div className="h-full transition-[width] duration-150 ease-linear" style={{ width: `${((index + 1) / total) * 100}%`, background: driver.team.color }} />
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase">Clique para pular</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
