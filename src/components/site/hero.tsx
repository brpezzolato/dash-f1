"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { CalendarDays, Droplets, Flag, Gauge, Ruler, Search, Thermometer } from "lucide-react";

import { Headshot } from "@/components/headshot";
import { CountUp } from "@/components/motion/count-up";
import { SeasonSelect } from "@/components/season-select";
import { compound } from "@/components/tyres";
import { flagUrl } from "@/lib/flags";
import type { CircuitInfo, DriverInfo, LeaderboardRow, WeatherSummary } from "@/lib/types";
import { LiveTrack, type TrackCar } from "./live-track";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface HeroData {
  season: string;
  seasons: string[];
  raceName?: string;
  round?: string;
  raceDate?: string;
  live: boolean;
  totalLaps?: number;
  avgLap?: number;
  leaderboard: LeaderboardRow[];
  circuit?: CircuitInfo;
  weather?: WeatherSummary;
  focus?: { driver: DriverInfo; label: string };
}

const NAV = [
  { href: "#corrida", label: "Corrida" },
  { href: "#pilotos", label: "Pilotos" },
  { href: "#ranking", label: "Ranking" },
  { href: "#analise", label: "Análise" },
  { href: "#calendario", label: "Calendário" },
];

/* ------------------------------------------------------------ fundo */

function VideoBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_70%_20%,#2a1210,#07080a_60%)]">
      <motion.video
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/media/hero.jpg"
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: EASE }}
      >
        <source src="/media/hero.webm" type="video/webm" />
        <source src="/media/hero.mp4" type="video/mp4" />
      </motion.video>
      {/* Camadas “tech”: escurecimento, grade, scanlines e vinheta. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07080a]/95 via-[#07080a]/55 to-[#07080a]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-transparent to-[#07080a]/60" />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(0_0_0/0.18)_0px,rgb(0_0_0/0.18)_1px,transparent_1px,transparent_3px)] opacity-40" />
    </div>
  );
}

/* ------------------------------------------------------ leaderboard */

function TyreCell({ row }: { row: LeaderboardRow }) {
  if (!row.finalTyre) return <span className="text-white/35">—</span>;
  const c = compound(row.finalTyre.compound);
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
      {c.short} ({row.finalTyre.laps})
    </span>
  );
}

function Leaderboard({ rows, query }: { rows: LeaderboardRow[]; query: string }) {
  const q = query.toLowerCase();
  const filtered = q ? rows.filter((r) => [r.driver.givenName, r.driver.familyName, r.driver.code, r.driver.team.name].some((v) => v.toLowerCase().includes(q))) : rows;

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 z-10 bg-[#0d0e11]/95 backdrop-blur">
        <tr className="text-left font-mono text-[10px] tracking-[0.15em] text-white/40 uppercase">
          <th className="py-2.5 pr-2 font-normal">Pos</th>
          <th className="py-2.5 pr-2 font-normal">Piloto</th>
          <th className="py-2.5 pr-2 font-normal">Gap/Tempo</th>
          <th className="hidden py-2.5 pr-2 font-normal sm:table-cell">Pneu</th>
          <th className="hidden py-2.5 pr-2 font-normal md:table-cell">Melhor volta</th>
          <th className="py-2.5 text-right font-normal">País</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((r, i) => (
          <motion.tr
            key={r.driver.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: query ? 0 : 0.5 + i * 0.04, ease: EASE }}
            className="group border-t border-white/[0.05] transition-colors hover:bg-white/[0.04]"
          >
            <td className="py-2.5 pr-2 font-mono text-white/70">P{r.position}</td>
            <td className="py-2.5 pr-2">
              <span className="flex items-center gap-2.5">
                <span className="relative size-7 shrink-0 overflow-hidden rounded-full" style={{ background: r.driver.team.color }}>
                  <Headshot driver={r.driver} size={56} className="size-full" />
                </span>
                <span className="h-4 w-0.5 rounded-full" style={{ background: r.driver.team.color }} />
                <span className="truncate transition-transform duration-300 group-hover:translate-x-1">
                  <span className="text-white/60">{r.driver.givenName} </span>
                  <span className="font-semibold">{r.driver.familyName}</span>
                </span>
              </span>
            </td>
            <td className="py-2.5 pr-2 font-mono text-white/80">{r.gap}</td>
            <td className="hidden py-2.5 pr-2 font-mono text-white/80 sm:table-cell">
              <TyreCell row={r} />
            </td>
            <td className={`hidden py-2.5 pr-2 font-mono md:table-cell ${r.fastest ? "text-[#c77dff]" : "text-white/70"}`}>{r.bestLap ?? "—"}</td>
            <td className="py-2.5 text-right">
              {r.driver.flag ? <img src={flagUrl(r.driver.flag)} alt="" className="ml-auto h-3.5 w-5 rounded-[2px] object-cover" /> : <span className="text-white/35">—</span>}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------------------------------ card piloto */

function FocusCard({ driver, label }: { driver: DriverInfo; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 20 });
  const c = driver.team.color;

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 900, background: `linear-gradient(165deg, ${c} 0%, ${c}dd 45%, ${c}66 100%)` }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
      className="relative isolate min-h-[220px] flex-1 overflow-hidden rounded-[22px] p-4"
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-5xl leading-none font-black text-white">#{driver.number ?? driver.code}</span>
        <span className="rounded-full border border-white/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{label}</span>
      </div>
      <div className="pointer-events-none absolute right-1/2 bottom-0 -z-10 h-[90%] translate-x-1/2">
        <Headshot driver={driver} size={360} className="h-full w-auto object-contain drop-shadow-[0_20px_30px_rgb(0_0_0/0.45)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-12">
        <p className="flex items-center gap-1.5 text-xs text-white/85">
          <span className="size-2 rounded-full bg-white" /> {driver.team.name}
        </p>
        <p className="font-display text-2xl leading-tight font-bold text-white">
          {driver.givenName} {driver.familyName}
        </p>
      </div>
    </motion.div>
  );
}

function Tile({ label, icon, value, decimals = 0, unit, delay }: { label: string; icon: React.ReactNode; value?: number; decimals?: number; unit: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className="relative rounded-[18px] bg-white/[0.04] p-3 ring-1 ring-white/[0.06]"
    >
      <p className="flex items-center justify-between font-mono text-[10px] tracking-wider text-white/50 uppercase">
        {label} {icon}
      </p>
      <p className="font-display mt-2 text-2xl font-semibold tabular-nums">
        {value !== undefined ? <CountUp value={value} decimals={decimals} /> : "—"}
        <span className="ml-1 text-sm font-normal text-white/45">{unit}</span>
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------- hero */

export function Hero({ data }: { data: HeroData }) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Ao rolar, o hero encolhe e vira um card arredondado que se afasta.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86]);
  const radius = useTransform(scrollYProgress, [0, 0.25], [0, 32]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const cars: TrackCar[] = useMemo(() => {
    const lap = data.avgLap ?? 95;
    return data.leaderboard
      .filter((r) => r.finished)
      .map((r, i) => ({ id: r.driver.id, code: r.driver.code, color: r.driver.team.color, behind: r.gapSeconds !== undefined ? r.gapSeconds / lap : 0.04 * i + r.lapsDown }));
  }, [data.leaderboard, data.avgLap]);

  const words = (data.raceName ?? "Sem corridas").split(" ");
  const laps = data.leaderboard[0]?.laps;

  return (
    <section ref={ref} id="corrida" className="relative lg:h-[100svh] lg:min-h-[760px]">
      <motion.div style={{ scale, borderRadius: radius, y }} className="relative origin-top overflow-hidden lg:h-[100svh] lg:min-h-[760px]">
        <VideoBackdrop />
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 z-20 bg-black" />

        {/* navegação */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="relative z-10 mx-auto flex max-w-[1500px] items-center gap-4 px-4 pt-4 sm:px-6"
        >
          <div className="glass flex w-full items-center gap-4 rounded-full py-1.5 pr-1.5 pl-4">
            <a href="#corrida" className="flex items-center gap-2" aria-label="Dash F1">
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                <path d="M3 5l7 7-7 7" fill="none" stroke="#ff6b2c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 5l7 7-7 7" fill="none" stroke="#ff6b2c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
              </svg>
              <span className="font-display hidden text-sm font-bold tracking-[0.25em] sm:inline">DASH·F1</span>
            </a>
            <nav className="mx-auto hidden items-center gap-1 lg:flex">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="rounded-full px-3.5 py-1.5 text-sm text-white/65 transition-colors hover:bg-white/10 hover:text-white">
                  {n.label}
                </a>
              ))}
            </nav>
            <label className="relative ml-auto lg:ml-0">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/45" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar piloto ou equipe"
                className="h-9 w-36 rounded-full bg-white/[0.06] pr-3 pl-8 text-xs ring-1 ring-white/[0.08] transition-[width,background] duration-300 outline-none placeholder:text-white/40 focus:w-52 focus:bg-white/[0.1] sm:w-48 sm:focus:w-60"
              />
            </label>
            <SeasonSelect season={data.season} seasons={data.seasons} />
          </div>
        </motion.header>

        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-4 px-4 pt-6 pb-4 sm:px-6 lg:h-[calc(100%-68px)] lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* coluna esquerda */}
          <div className="flex min-h-0 flex-col">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-white/55 uppercase"
            >
              <span className="text-f1">●</span> Última corrida <span className="text-white/25">{"//"}</span> R{data.round ?? "–"}
              {data.raceDate && (
                <>
                  <span className="text-white/25">{"//"}</span>
                  {new Date(data.raceDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </>
              )}
            </motion.p>

            <div className="mt-4 flex items-start gap-3">
              <h1 className="font-display text-5xl leading-[0.92] font-semibold tracking-tight sm:text-7xl xl:text-8xl">
                {words.map((w, i) => (
                  <span key={i} className="inline-block overflow-hidden pr-[0.22em] align-bottom">
                    <motion.span
                      className="inline-block"
                      initial={{ y: "105%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, delay: 0.35 + i * 0.08, ease: EASE }}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#ff6b2c] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase shadow-[0_0_24px_#ff6b2c88]"
              >
                {data.live && (
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                  </span>
                )}
                {data.live ? "Ao vivo" : "Final"}
              </motion.span>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: Flag, text: data.circuit?.name },
                { icon: Gauge, text: laps ? `${laps} voltas` : undefined },
                { icon: Thermometer, text: data.weather ? `Pista ${data.weather.trackTemp.toFixed(0)}°C` : undefined },
                { icon: CalendarDays, text: data.circuit ? `${data.circuit.locality}, ${data.circuit.country}` : undefined },
              ]
                .filter((c) => c.text)
                .map(({ icon: Icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10 backdrop-blur">
                    <Icon className="size-3" /> {text}
                  </span>
                ))}
            </motion.div>

            {/* leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
              className="glass relative mt-8 flex max-h-[60vh] min-h-[260px] flex-col rounded-[24px] px-4 pt-3 pb-1 lg:mt-auto lg:max-h-[46%]"
            >
              <div className="flex items-center justify-between pb-1">
                <p className="text-sm font-medium">
                  Leaderboard
                  <span className="ml-2 font-mono text-[11px] text-white/45">
                    VOLTA {laps ?? "–"}/{data.totalLaps ?? laps ?? "–"}
                  </span>
                </p>
                <a href="#ranking" className="font-mono text-[10px] tracking-widest text-white/45 uppercase hover:text-white">
                  Campeonato ↓
                </a>
              </div>
              <div data-lenis-prevent className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
                {data.leaderboard.length ? <Leaderboard rows={data.leaderboard} query={query} /> : <p className="py-10 text-center text-sm text-white/50">Nenhuma corrida disputada ainda.</p>}
              </div>
            </motion.div>
          </div>

          {/* painel overview */}
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="glass relative flex min-h-0 flex-col gap-3 rounded-[26px] p-3"
          >
            <div className="flex items-center justify-between px-1 pt-1">
              <h2 className="text-sm font-medium">Overview</h2>
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">Replay · gaps reais</span>
            </div>
            <div className="rounded-[20px] bg-black/30 px-3 pt-2 pb-3 ring-1 ring-white/[0.05]">
              <LiveTrack map={data.circuit?.map} cars={cars} className="mx-auto aspect-[4/3] max-h-[30vh] w-full" />
              <p className="font-mono text-[10px] tracking-wider text-white/40 uppercase">Circuito</p>
              <p className="font-display text-lg leading-tight font-semibold">{data.circuit?.name ?? "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Tile label="Extensão" icon={<Ruler className="size-3.5" />} value={data.circuit?.lengthKm} decimals={3} unit="km" delay={0.7} />
              <Tile label="Umidade" icon={<Droplets className="size-3.5" />} value={data.weather?.humidity} unit="%" delay={0.8} />
            </div>
            {data.focus && <FocusCard driver={data.focus.driver} label={data.focus.label} />}
          </motion.aside>
        </div>

      </motion.div>
    </section>
  );
}
