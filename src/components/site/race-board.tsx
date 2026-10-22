"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Timer, Trophy } from "lucide-react";

import { Headshot } from "@/components/headshot";
import { compound } from "@/components/tyres";
import { flagUrl } from "@/lib/flags";
import type { LeaderboardRow } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

function Tyre({ row }: { row: LeaderboardRow }) {
  if (!row.finalTyre) return <span className="text-white/30">—</span>;
  const c = compound(row.finalTyre.compound);
  return (
    <span className="inline-flex items-center gap-1.5" title={`${c.label} · ${row.finalTyre.laps} voltas`}>
      <span className="grid size-[18px] place-items-center rounded-full border-[2.5px] bg-black text-[8px] font-bold" style={{ borderColor: c.color }}>
        {c.short}
      </span>
      <span className="text-white/60">{row.finalTyre.laps}</span>
    </span>
  );
}

function Delta({ row }: { row: LeaderboardRow }) {
  const d = row.grid > 0 && Number(row.position) ? row.grid - Number(row.position) : 0;
  if (!d) return <span className="text-white/25">=</span>;
  return <span className={d > 0 ? "text-emerald-400" : "text-rose-400"}>{d > 0 ? `▲${d}` : `▼${-d}`}</span>;
}

/* ------------------------------------------------------------ pódio */

function Podium({ rows }: { rows: LeaderboardRow[] }) {
  // Ordem visual clássica: P2, P1, P3.
  const order = [rows[1], rows[0], rows[2]].filter(Boolean);
  return (
    <div className="grid grid-cols-3 items-end gap-2">
      {order.map((r) => {
        const first = r.position === "1";
        const c = r.driver.team.color;
        return (
          <motion.div
            key={r.driver.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: first ? 0.55 : 0.7, ease: EASE }}
            className={`relative overflow-hidden rounded-2xl ring-1 ring-white/[0.08] ${first ? "pt-4 pb-3" : "pt-3 pb-2.5"}`}
            style={{ background: `linear-gradient(180deg, ${c}40, rgb(255 255 255 / 0.02) 70%)` }}
          >
            <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: c }} />
            <div className="flex flex-col items-start gap-2 px-3 sm:flex-row sm:items-center sm:gap-3">
              <span className="relative shrink-0 overflow-hidden rounded-full ring-2" style={{ width: first ? 52 : 42, height: first ? 52 : 42, background: c, ["--tw-ring-color" as string]: c }}>
                <Headshot driver={r.driver} size={104} className="size-full" />
              </span>
              <div className="w-full min-w-0 sm:w-auto">
                <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-white/50 uppercase">
                  {first && <Trophy className="size-3 text-amber-300" />}P{r.position}
                </p>
                <p className={`font-display truncate leading-tight font-bold ${first ? "text-xl" : "text-base"}`}>{r.driver.familyName}</p>
                <p className="truncate font-mono text-[11px] text-white/60">{r.gap}</p>
              </div>
              <span className={`font-display ml-auto hidden font-bold text-white/80 sm:block ${first ? "text-2xl" : "text-lg"}`}>+{r.points}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------- torre de timing */

const COLS = "grid-cols-[1.75rem_minmax(0,1fr)_4.25rem_2.75rem_1.75rem_1.75rem] sm:grid-cols-[2rem_minmax(0,1.2fr)_4.75rem_minmax(0,1fr)_4rem_2.5rem_2.5rem] lg:grid-cols-[2rem_minmax(0,1.2fr)_4.75rem_minmax(0,1fr)_4rem_5.5rem_2.5rem_2.5rem]";

export function RaceBoard({ rows, laps, totalLaps }: { rows: LeaderboardRow[]; laps?: number; totalLaps?: number }) {
  const [query, setQuery] = useState("");

  const enriched = useMemo(() => {
    const maxGap = Math.max(1, ...rows.map((r) => r.gapSeconds ?? 0));
    return rows.map((r, i) => {
      const prev = rows[i - 1];
      const interval = i === 0 ? undefined : r.gapSeconds !== undefined && prev?.gapSeconds !== undefined ? r.gapSeconds - prev.gapSeconds : undefined;
      return { row: r, interval, share: r.gapSeconds !== undefined ? r.gapSeconds / maxGap : undefined };
    });
  }, [rows]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? enriched.filter(({ row: r }) => [r.driver.givenName, r.driver.familyName, r.driver.code, r.driver.team.name].some((v) => v.toLowerCase().includes(q)))
    : enriched;
  const showPodium = !q && rows.length >= 3;
  const tower = showPodium ? filtered.slice(3) : filtered;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-3 pb-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">Resultado final</p>
          <h2 className="font-display text-xl leading-none font-bold">Leaderboard</h2>
        </div>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-white/70 ring-1 ring-white/[0.08]">
          VOLTA {laps ?? "–"}/{totalLaps ?? laps ?? "–"}
        </span>
        <label className="relative ml-auto">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar piloto ou equipe"
            className="h-8 w-40 rounded-full bg-white/[0.05] pr-3 pl-8 text-xs ring-1 ring-white/[0.08] transition-[width,background-color] duration-300 outline-none placeholder:text-white/35 focus:w-56 focus:bg-white/[0.09]"
          />
        </label>
      </header>

      {showPodium && <Podium rows={rows} />}

      <div className={`mt-3 grid ${COLS} items-center gap-x-2 px-3 pb-1.5 font-mono sm:gap-x-3 text-[9px] tracking-[0.18em] text-white/35 uppercase`}>
        <span>Pos</span>
        <span>Piloto</span>
        <span className="text-right">Interv.</span>
        <span className="hidden sm:block">Distância p/ líder</span>
        <span>Pneu</span>
        <span className="hidden text-right lg:block">
          <Timer className="mr-1 inline size-3" />
          Melhor
        </span>
        <span className="text-right">Δ</span>
        <span className="text-right">Pts</span>
      </div>

      <div data-lenis-prevent className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {tower.map(({ row: r, interval, share }, i) => {
          const c = r.driver.team.color;
          return (
            <motion.div
              key={r.driver.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: q ? 0 : 0.75 + Math.min(i, 12) * 0.035, ease: EASE }}
              className={`group relative grid ${COLS} items-center gap-x-2 rounded-xl px-3 py-2 text-sm sm:gap-x-3 transition-colors duration-200 hover:bg-white/[0.05] ${r.finished ? "" : "opacity-55"}`}
            >
              {/* Faixa na cor da equipe que acende no hover. */}
              <span
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, ${c}26, transparent 60%)` }}
              />
              <span className="font-display relative text-base font-bold text-white/80 tabular-nums">{r.position}</span>
              <span className="relative flex min-w-0 items-center gap-1.5 sm:gap-2.5">
                <span className="h-6 w-[3px] shrink-0 rounded-full" style={{ background: c }} />
                <span className="relative hidden size-7 shrink-0 overflow-hidden rounded-full sm:block" style={{ background: c }}>
                  <Headshot driver={r.driver} size={56} className="size-full" />
                </span>
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{r.driver.code}</span>
                  <span className="ml-1.5 hidden text-white/50 sm:inline">{r.driver.familyName}</span>
                </span>
                {r.driver.flag && <img src={flagUrl(r.driver.flag)} alt="" className="hidden h-3 w-[18px] shrink-0 rounded-[2px] opacity-80 xl:block" />}
              </span>
              <span className="relative text-right font-mono text-xs text-white/75 tabular-nums">
                {interval !== undefined ? `+${interval.toFixed(3)}` : r.finished ? r.gap : r.gap}
              </span>
              <span className="relative hidden items-center gap-2 sm:flex">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  {share !== undefined ? (
                    <motion.span
                      className="block h-full origin-left rounded-full"
                      style={{ background: c }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: Math.max(0.02, share) }}
                      transition={{ duration: 0.9, delay: 0.9 + Math.min(i, 12) * 0.035, ease: EASE }}
                    />
                  ) : (
                    <span className="block h-full w-full bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.25)_0_4px,transparent_4px_8px)]" />
                  )}
                </span>
                <span className="w-14 shrink-0 text-right font-mono text-[10px] text-white/40">
                  {r.gapSeconds !== undefined ? `+${r.gapSeconds.toFixed(1)}s` : r.lapsDown ? `+${r.lapsDown}V` : "DNF"}
                </span>
              </span>
              <span className="relative font-mono text-xs">
                <Tyre row={r} />
              </span>
              <span className={`relative hidden text-right font-mono text-xs lg:block ${r.fastest ? "font-semibold text-[#c77dff]" : "text-white/60"}`}>{r.bestLap ?? "—"}</span>
              <span className="relative text-right font-mono text-[11px]">
                <Delta row={r} />
              </span>
              <span className="relative text-right font-semibold tabular-nums">{r.points || ""}</span>
            </motion.div>
          );
        })}
        {!tower.length && <p className="py-6 text-center text-sm text-white/45">Nenhum piloto encontrado.</p>}
      </div>
    </div>
  );
}
