"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Headshot } from "@/components/headshot";
import { flagUrl } from "@/lib/flags";
import type { DriverInfo, DriverSeasonStats } from "@/lib/types";

interface Row {
  position: string;
  driver: DriverInfo;
  points: number;
  wins: number;
  stats?: DriverSeasonStats;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const fmt = (v: number | undefined, d = 1) => (v === undefined ? "—" : v.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d }));

/** Posição de chegada por etapa: barra mais alta = melhor resultado. */
function FormChart({ form, color }: { form: DriverSeasonStats["form"]; color: string }) {
  const W = 100 / Math.max(form.length, 1);
  return (
    <div>
      <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase">Resultado por etapa</p>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-20 w-full">
        {form.map((f, i) => {
          const h = f.position ? ((21 - Math.min(f.position, 20)) / 20) * 36 + 2 : 2;
          return (
            <rect key={f.round} x={i * W + W * 0.15} y={40 - h} width={W * 0.7} height={h} rx="0.6" fill={f.position ? color : "#ff4d4f"} opacity={f.position === 1 ? 1 : f.position ? 0.6 : 0.8}>
              <title>{`R${f.round}: ${f.position ? `P${f.position}` : "abandono/ausente"}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-white/35">
        <span>R{form[0]?.round}</span>
        <span>R{form.at(-1)?.round}</span>
      </div>
    </div>
  );
}

function Details({ row }: { row: Row }) {
  const s = row.stats;
  if (!s) return null;
  const items: Array<[string, string]> = [
    ["Pontos", String(s.points)],
    ["Vitórias", String(s.wins)],
    ["Pódios", String(s.podiums)],
    ["Poles", String(s.poles)],
    ["Top 10", String(s.top10)],
    ["Voltas + rápidas", String(s.fastestLaps)],
    ["Abandonos", String(s.dnfs)],
    ["Corridas", String(s.races)],
    ["Melhor resultado", s.bestFinish ? `P${s.bestFinish}` : "—"],
    ["Média de chegada", fmt(s.avgFinish)],
    ["Média de largada", fmt(s.avgGrid)],
    ["Posições ganhas", `${s.positionsGained > 0 ? "+" : ""}${s.positionsGained}`],
    ["Pontos por corrida", fmt(s.pointsPerRace)],
    ["Pontos em sprints", String(s.sprintPoints)],
    ["% dos pontos da equipe", `${fmt(s.teamShare * 100, 0)}%`],
    ["Atrás do líder", s.gapToLeader ? `${s.gapToLeader} pts` : "Líder"],
  ];
  return (
    <div className="grid gap-6 pt-4 pb-2 lg:grid-cols-[150px_1fr_300px]">
      <div
        className="relative hidden h-[180px] overflow-hidden rounded-2xl lg:block"
        style={{ background: `linear-gradient(170deg, ${row.driver.team.color}, #0b0c0e 90%)` }}
      >
        <Headshot driver={row.driver} size={300} className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2 object-contain" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.35 }}
            className="rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]"
          >
            <p className="font-mono text-[9px] tracking-wider text-white/45 uppercase">{k}</p>
            <p className="font-display text-xl font-semibold tabular-nums">{v}</p>
          </motion.div>
        ))}
      </div>
      <FormChart form={s.form} color={row.driver.team.color} />
    </div>
  );
}

export function Ranking({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const hover = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const max = rows[0]?.points || 1;

  // Pequeno atraso no hover: passar o mouse rápido não abre/fecha várias linhas.
  const intend = (id: string | null) => {
    clearTimeout(hover.current);
    hover.current = setTimeout(() => setOpen(id), id ? 140 : 220);
  };

  return (
    <div className="space-y-2" onMouseLeave={() => intend(null)}>
      {rows.map((r, i) => {
        const isOpen = open === r.driver.id;
        const c = r.driver.team.color;
        return (
          <motion.div
            key={r.driver.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.03, 0.3), ease: EASE }}
            onMouseEnter={() => intend(r.driver.id)}
            onClick={() => setOpen(isOpen ? null : r.driver.id)}
            className="relative cursor-pointer overflow-hidden rounded-2xl bg-white/[0.025] ring-1 ring-white/[0.06]"
          >
            {/* Fundo na cor da equipe (só opacidade, sem repintar o card). */}
            <span
              className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{ background: `linear-gradient(100deg, ${c}33, transparent 55%)`, opacity: isOpen ? 1 : 0 }}
            />
            {/* Barra reta na cor da equipe. */}
            <span
              className="pointer-events-none absolute top-3 bottom-3 left-0 w-[3px] transition-opacity duration-300"
              style={{ background: c, opacity: isOpen ? 1 : 0 }}
            />
            <div className="relative flex items-center gap-4 px-4 py-3">
              <span className="w-6 font-mono text-xs text-white/40">{r.position.padStart(2, "0")}</span>
              {/* Foto no lugar do número. */}
              <span
                className="relative size-11 shrink-0 overflow-hidden rounded-full ring-2 transition-transform duration-300"
                style={{ background: `linear-gradient(160deg, ${c}, ${c}44)`, ["--tw-ring-color" as string]: c, transform: isOpen ? "scale(1.08)" : undefined }}
              >
                <Headshot driver={r.driver} size={88} className="size-full" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate">
                  <span className="text-white/60">{r.driver.givenName} </span>
                  <span className="font-display text-lg font-bold">{r.driver.familyName}</span>
                  {r.driver.flag && <img src={flagUrl(r.driver.flag)} alt="" className="ml-2 inline h-3 w-[18px] rounded-[2px] align-baseline" />}
                </p>
                <p className="flex items-center gap-2 text-xs text-white/50">
                  <span className="size-2 rounded-full" style={{ background: c }} />
                  {r.driver.team.name}
                  {r.driver.number !== undefined && <span className="font-mono">#{r.driver.number}</span>}
                  {r.stats?.age && <span>· {r.stats.age} anos</span>}
                </p>
              </div>
              <div className="hidden w-48 sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{ background: c, width: `${(r.points / max) * 100}%` }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                  />
                </div>
              </div>
              <span className="hidden w-14 text-right font-mono text-sm text-white/55 md:block">{r.wins}V</span>
              <span className="font-display w-16 text-right text-2xl font-bold tabular-nums">{r.points}</span>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="relative overflow-hidden px-4"
                >
                  <div className="pb-3">
                    <Details row={r} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
