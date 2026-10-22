import { Check } from "lucide-react";

import type { Race } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CalendarStrip({ races, nextRound }: { races: Race[]; nextRound?: string }) {
  return (
    <div className="scrollbar-thin -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
      {races.map((r) => {
        const isNext = r.round === nextRound;
        const done = !nextRound || Number(r.round) < Number(nextRound);
        return (
          <div
            key={r.round}
            className={cn(
              "w-36 shrink-0 snap-start rounded-2xl border p-3",
              isNext ? "border-f1/60 bg-f1/15" : "border-white/[0.07] bg-white/[0.03]",
              done && !isNext && "opacity-55",
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn("font-display num text-xl font-black", isNext && "text-f1")}>R{r.round.padStart(2, "0")}</span>
              {done && !isNext ? <Check className="size-4 text-emerald-400" /> : r.Sprint && <span className="text-[10px] font-semibold text-amber-300 uppercase">Sprint</span>}
            </div>
            <p className="mt-1 truncate text-sm font-semibold">{r.raceName.replace(" Grand Prix", "")}</p>
            <p className="text-muted-foreground truncate text-[11px]">
              {new Date(r.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {r.Circuit.Location.locality}
            </p>
          </div>
        );
      })}
    </div>
  );
}
