"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUp, CalendarDays, Droplets, Flag, Maximize2, Ruler, Search, X } from "lucide-react";

import { NumberBadge } from "@/components/driver-avatar";
import { CountUp } from "@/components/motion/count-up";
import { SeasonSelect } from "@/components/season-select";
import { compound } from "@/components/tyres";
import { flagUrl } from "@/lib/flags";
import type { CircuitInfo, DriverInfo, LeaderboardRow, WeatherSummary } from "@/lib/types";
import type { Highlight } from "@/lib/videos";
import { LiveTrack, type TrackCar } from "./live-track";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface HomeData {
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
  video?: Highlight;
  videoMp4?: string;
}

/* ------------------------------------------------------------------ logo */

function Logo() {
  return (
    <Link href="/" aria-label="Dash F1" className="grid size-9 place-items-center">
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path d="M3 5l7 7-7 7" fill="none" stroke="#ff6b2c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 5l7 7-7 7" fill="none" stroke="#ff6b2c" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    </Link>
  );
}

/* ----------------------------------------------------------- vídeo hero */

function HeroVideo({ video, mp4 }: { video?: Highlight; mp4?: string }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ scale: 1.15, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.6, ease: EASE }}
    >
      {mp4 ? (
        <video className="absolute inset-0 size-full object-cover" src={mp4} autoPlay muted loop playsInline />
      ) : (
        video && (
          <iframe
            title="Vídeo da corrida"
            tabIndex={-1}
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute top-1/2 left-1/2 h-[56.25vw] min-h-[140%] w-[177.78vh] min-w-[140%] -translate-x-1/2 -translate-y-1/2 border-0"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.id}&start=${video.start ?? 0}&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3`}
          />
        )
      )}
      {/* Escurece as bordas como na foto da referência e funde com o leaderboard. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1b1c20]/85 via-[#1b1c20]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b1c20]/70 via-transparent to-[#1b1c20]" />
    </motion.div>
  );
}

/* ---------------------------------------------------------- leaderboard */

function TyreCell({ row }: { row: LeaderboardRow }) {
  if (!row.finalTyre) return <span className="text-white/40">—</span>;
  const c = compound(row.finalTyre.compound);
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
      {c.short} ({row.finalTyre.laps})
    </span>
  );
}

function LeaderboardTable({ rows, query }: { rows: LeaderboardRow[]; query: string }) {
  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return [r.driver.givenName, r.driver.familyName, r.driver.code, r.driver.team.name].some((v) => v.toLowerCase().includes(q));
  });

  return (
    <table className="w-full text-sm">
      <thead className="sticky top-0 z-10 bg-[#1b1c20]">
        <tr className="text-left text-xs text-white/45">
          <th className="py-3 pr-2 font-normal">Pos</th>
          <th className="py-3 pr-2 font-normal">Piloto</th>
          <th className="py-3 pr-2 font-normal">Gap/Tempo</th>
          <th className="hidden py-3 pr-2 font-normal sm:table-cell">Pneu</th>
          <th className="hidden py-3 pr-2 font-normal md:table-cell">Melhor volta</th>
          <th className="py-3 text-right font-normal">País</th>
        </tr>
      </thead>
      <tbody>
        <AnimatePresence initial={true} mode="popLayout">
          {filtered.map((r, i) => (
            <motion.tr
              key={r.driver.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.45, delay: query ? 0 : 0.6 + i * 0.05, ease: EASE }}
              className="group border-t border-white/[0.05] transition-colors hover:bg-white/[0.03]"
            >
              <td className="num py-3 pr-2 text-white/80">P{r.position}</td>
              <td className="py-3 pr-2">
                <span className="flex items-center gap-3">
                  <NumberBadge driver={r.driver} />
                  <span className="truncate transition-transform duration-300 group-hover:translate-x-1">
                    {r.driver.givenName} {r.driver.familyName}
                  </span>
                </span>
              </td>
              <td className="num py-3 pr-2 text-white/80">{r.gap}</td>
              <td className="num hidden py-3 pr-2 text-white/80 sm:table-cell">
                <TyreCell row={r} />
              </td>
              <td className={`num hidden py-3 pr-2 md:table-cell ${r.fastest ? "font-semibold text-[#c77dff]" : "text-white/80"}`}>
                {r.bestLap ?? "—"}
              </td>
              <td className="py-3 text-right">
                {r.driver.flag ? (
                  <img src={flagUrl(r.driver.flag)} alt="" className="ml-auto h-3.5 w-5 rounded-[2px] object-cover" loading="lazy" />
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </td>
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  );
}

/* ---------------------------------------------------------- card piloto */

function DriverCard({ driver, label }: { driver: DriverInfo; label: string }) {
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
      style={{ rotateX, rotateY, transformPerspective: 900, background: `linear-gradient(165deg, ${c} 0%, ${c}e6 45%, ${c}99 100%)` }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
      className="relative isolate min-h-[260px] flex-1 overflow-hidden rounded-[22px] p-4"
    >
      <div className="flex items-start justify-between">
        <motion.span
          className="font-display text-5xl leading-none font-black text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: EASE }}
        >
          #{driver.number ?? driver.code}
        </motion.span>
        <span className="rounded-full border border-white/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">{label}</span>
      </div>
      {driver.headshot ? (
        <motion.img
          src={driver.headshot}
          alt=""
          className="pointer-events-none absolute right-1/2 bottom-0 -z-10 h-[88%] w-auto translate-x-1/2 object-contain drop-shadow-[0_20px_30px_rgb(0_0_0/0.45)]"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.9, ease: EASE }}
        />
      ) : (
        <span className="font-display absolute right-4 bottom-14 -z-10 text-8xl font-black text-white/15">{driver.code}</span>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4 pt-12">
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

/* --------------------------------------------------------------- tiles */

function Tile({ label, icon, value, decimals = 0, unit, delay }: { label: string; icon: React.ReactNode; value?: number; decimals?: number; unit: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className="rounded-[18px] bg-white/[0.04] p-3.5 ring-1 ring-white/[0.05]"
    >
      <p className="flex items-center justify-between text-xs text-white/55">
        {label} {icon}
      </p>
      <p className="font-display num mt-4 text-3xl font-semibold">
        {value !== undefined ? <CountUp value={value} decimals={decimals} /> : "—"}
        <span className="ml-1 text-base font-normal text-white/45">{unit}</span>
      </p>
    </motion.div>
  );
}

/* --------------------------------------------------------------- tela */

export function HomeScreen({ data }: { data: HomeData }) {
  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const cars: TrackCar[] = useMemo(() => {
    const lap = data.avgLap ?? 95;
    return data.leaderboard
      .filter((r) => r.finished)
      .map((r, i) => ({
        id: r.driver.id,
        code: r.driver.code,
        color: r.driver.team.color,
        // Retardatários sem gap em segundos ficam espaçados pela posição.
        behind: r.gapSeconds !== undefined ? r.gapSeconds / lap : 0.04 * i + r.lapsDown,
      }));
  }, [data.leaderboard, data.avgLap]);

  const [first, ...rest] = (data.raceName ?? "Sem corridas").split(" ");
  const titleTail = rest.join(" ");
  const laps = data.leaderboard[0]?.laps;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#e4e6ea,#c9ccd2)] p-2 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mx-auto flex max-w-[1440px] flex-col gap-3 rounded-[34px] bg-[#1b1c20] p-3 text-white shadow-[0_40px_120px_-30px_rgb(0_0_0/0.55)] lg:h-[calc(100vh-48px)] lg:min-h-[720px] lg:flex-row"
      >
        {/* -------- coluna principal -------- */}
        <div className="relative flex min-h-[760px] min-w-0 flex-1 flex-col overflow-hidden rounded-[26px] lg:min-h-0">
          <div className="absolute inset-x-0 top-0 h-[64%]">
            <HeroVideo video={data.video} mp4={data.videoMp4} />
          </div>

          {/* barra superior */}
          <header className="relative z-10 flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
            <Logo />
            <p className="hidden text-sm text-white/85 sm:block">Bem-vindo de volta à temporada {data.season}</p>
            <div className="ml-auto flex items-center gap-2">
              <label className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar piloto ou equipe"
                  className="h-9 w-40 rounded-full bg-white/[0.06] pr-3 pl-8 text-xs text-white ring-1 ring-white/[0.06] transition-[width,background] duration-300 outline-none placeholder:text-white/40 focus:w-56 focus:bg-white/[0.1] sm:w-52 sm:focus:w-64"
                />
              </label>
              <SeasonSelect season={data.season} seasons={data.seasons} />
            </div>
          </header>

          {/* título do hero */}
          <div className="relative z-10 px-6 pt-10 sm:px-10 sm:pt-14">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
              className="flex items-start gap-3"
            >
              <h1 className="font-display text-5xl leading-[0.95] font-semibold tracking-tight sm:text-7xl">
                {first}
                {titleTail && (
                  <>
                    <br />
                    {titleTail}
                  </>
                )}
              </h1>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${data.live ? "bg-[#ff6b2c] text-white" : "bg-[#ff6b2c]/90 text-white"}`}
              >
                {data.live && (
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                  </span>
                )}
                {data.live ? "Ao vivo" : "Final"}
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 flex flex-wrap gap-2"
            >
              {data.round && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs text-white/85 backdrop-blur">
                  <Flag className="size-3" /> Rodada {data.round}
                </span>
              )}
              {data.raceDate && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs text-white/85 backdrop-blur">
                  <CalendarDays className="size-3" />
                  {new Date(data.raceDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}
            </motion.div>
          </div>

          {/* leaderboard */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
            className="relative z-10 mt-auto flex max-h-[52%] min-h-[320px] flex-col px-6 pb-2 sm:px-10"
          >
            <div className="flex items-center justify-between pb-1">
              <p className="text-sm font-medium">
                Leaderboard{" "}
                <span className="ml-2 text-xs text-white/45">
                  Volta {laps ?? "–"}/{data.totalLaps ?? laps ?? "–"}
                </span>
              </p>
              <button
                aria-label="Voltar ao topo da tabela"
                onClick={() => tableRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                className="grid size-9 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.06] transition hover:-translate-y-0.5 hover:bg-white/[0.12]"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
            <div ref={tableRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
              {data.leaderboard.length ? (
                <LeaderboardTable rows={data.leaderboard} query={query} />
              ) : (
                <p className="py-10 text-center text-sm text-white/50">Nenhuma corrida disputada ainda nesta temporada.</p>
              )}
            </div>
          </motion.section>
        </div>

        {/* -------- painel overview -------- */}
        <AnimatePresence initial={false}>
          {panelOpen ? (
            <motion.aside
              key="panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.3 } }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="flex w-full shrink-0 flex-col gap-3 rounded-[26px] bg-[#232429] p-3 lg:w-[380px]"
            >
              <div className="flex items-center justify-between px-2 pt-1">
                <h2 className="text-sm font-medium">Overview</h2>
                <div className="flex gap-1.5">
                  <Link
                    href={`/dashboard?season=${data.season}`}
                    aria-label="Abrir análise completa"
                    className="grid size-8 place-items-center rounded-full bg-white/[0.06] transition hover:scale-110 hover:bg-white/[0.12]"
                  >
                    <Maximize2 className="size-3.5" />
                  </Link>
                  <button
                    aria-label="Fechar painel"
                    onClick={() => setPanelOpen(false)}
                    className="grid size-8 place-items-center rounded-full bg-white/[0.06] transition hover:rotate-90 hover:bg-white/[0.12]"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-[20px] bg-black/20 px-3 pt-2 pb-3">
                <LiveTrack map={data.circuit?.map} cars={cars} className="mx-auto aspect-[4/3] w-full" />
                <p className="mt-1 text-xs text-white/45">Nome do circuito</p>
                <p className="font-display text-xl leading-tight font-semibold">{data.circuit?.name ?? "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Tile label="Extensão" icon={<Ruler className="size-3.5" />} value={data.circuit?.lengthKm} decimals={1} unit="km" delay={0.7} />
                <Tile label="Umidade" icon={<Droplets className="size-3.5" />} value={data.weather?.humidity} unit="%" delay={0.8} />
              </div>

              {data.focus && <DriverCard driver={data.focus.driver} label={data.focus.label} />}
            </motion.aside>
          ) : (
            <motion.button
              key="reopen"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(true)}
              className="self-start rounded-full bg-[#232429] px-4 py-2 text-xs font-medium ring-1 ring-white/10 transition hover:bg-[#2c2d33]"
            >
              Mostrar overview
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
