"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

import type { Race } from "@/lib/types";
import { raceDate } from "@/lib/race-date";
import { cn } from "@/lib/utils";

export function Calendar({ races, nextRound }: { races: Race[]; nextRound?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {races.map((r, i) => {
        const done = !nextRound || Number(r.round) < Number(nextRound);
        const isNext = r.round === nextRound;
        return (
          <motion.div
            key={r.round}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
            whileHover={{ y: -4 }}
            className={cn(
              "relative overflow-hidden rounded-sm p-3 shadow-lg shadow-black/15",
              isNext ? "bg-card ring-teal text-white ring-2" : done ? "bg-card/70 text-white/60" : "bg-paper text-paper-ink",
            )}
          >
            {isNext && <div className="speed-streaks absolute inset-0 opacity-50" />}
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className={cn("font-display text-2xl leading-none font-extrabold italic", isNext && "text-teal")}>
                  {r.round.padStart(2, "0")}
                </span>
                {done && !isNext ? (
                  <Check className="text-teal size-4" />
                ) : (
                  r.Sprint && (
                    <span className="bg-teal text-primary-foreground rounded-[2px] px-1.5 text-[9px] font-bold uppercase">Sprint</span>
                  )
                )}
              </div>
              <p className="font-display mt-2 truncate text-sm leading-tight font-semibold uppercase">
                {r.raceName.replace(" Grand Prix", "")}
              </p>
              <p className={cn("truncate text-[11px]", isNext || done ? "text-white/50" : "text-black/50")}>
                {raceDate(r).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {r.Circuit.Location.country}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
