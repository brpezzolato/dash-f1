"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Check } from "lucide-react";

import type { Race, TrackMap } from "@/lib/types";
import { SectionHeading } from "./hud";

/**
 * Calendário em trilho horizontal: a seção fica fixa na tela e as etapas
 * deslizam para o lado conforme a rolagem vertical.
 */
export function CalendarRail({ races, nextRound, maps }: { races: Race[]; nextRound?: string; maps: Record<string, TrackMap> }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  // Quanto o trilho precisa andar para a última etapa encostar na borda direita.
  useEffect(() => {
    const measure = () => track.current && setDistance(Math.max(0, track.current.scrollWidth - (track.current.parentElement?.clientWidth ?? window.innerWidth)));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [races.length]);
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} id="calendario" className="relative" style={{ height: `${Math.max(160, races.length * 22)}vh` }}>
      <div className="sticky top-4 flex h-[calc(100svh-2rem)] flex-col justify-center overflow-hidden rounded-[32px] bg-[#111215] ring-1 ring-white/[0.06]">
        <div className="w-full px-5 sm:px-8 lg:px-10">
          <SectionHeading index="05" kicker={`${races.length} etapas`} title="Calendário">
            <div className="h-px w-48 bg-white/10">
              <motion.div className="h-full bg-[#ff6b2c]" style={{ width: progress }} />
            </div>
          </SectionHeading>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-4 px-5 sm:px-8 lg:px-10">
          {races.map((r) => {
            const isNext = r.round === nextRound;
            const done = !nextRound || Number(r.round) < Number(nextRound);
            const map = maps[r.Circuit.circuitName];
            return (
              <article
                key={r.round}
                className={`relative flex h-[360px] w-[284px] shrink-0 flex-col overflow-hidden rounded-3xl p-5 ring-1 ${
                  isNext ? "bg-[#ff6b2c]/15 ring-[#ff6b2c]/60" : "bg-white/[0.03] ring-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs ${isNext ? "text-[#ff6b2c]" : "text-white/45"}`}>R{r.round.padStart(2, "0")}</span>
                  {isNext ? (
                    <span className="rounded-full bg-[#ff6b2c] px-2 py-0.5 text-[10px] font-bold uppercase">Próxima</span>
                  ) : done ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    r.Sprint && <span className="text-[10px] font-semibold text-amber-300 uppercase">Sprint</span>
                  )}
                </div>
                <div className="grid flex-1 place-items-center">
                  {map ? (
                    <svg viewBox="0 0 1000 1000" className="h-40 w-40" aria-hidden>
                      <path d={map.path} fill="none" stroke={isNext ? "#ff6b2c" : done ? "rgb(255 255 255 / 0.35)" : "#fff"} strokeWidth="14" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="font-display text-8xl font-black text-white/[0.06]">{r.round}</span>
                  )}
                </div>
                <p className="font-display text-xl leading-tight font-bold">{r.raceName.replace(" Grand Prix", "")}</p>
                <p className="text-xs text-white/50">
                  {new Date(r.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} · {r.Circuit.Location.locality}
                </p>
              </article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
