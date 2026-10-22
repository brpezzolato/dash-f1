"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Headshot } from "@/components/headshot";
import type { DriverInfo, DriverSeasonStats } from "@/lib/types";

interface Item {
  position: string;
  driver: DriverInfo;
  points: number;
  wins: number;
  stats?: DriverSeasonStats;
}

/** Carrossel de pilotos (Embla, base do Carousel do shadcn): arraste ou use as setas. */
export function DriversCarousel({ items }: { items: Item[] }) {
  const [viewportRef, embla] = useEmblaCarousel({ loop: true, align: "start", dragFree: false }, [
    Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => embla && setSelected(embla.selectedScrollSnap()), [embla]);
  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, onSelect]);

  return (
    <div>
      <div ref={viewportRef} className="overflow-hidden" data-lenis-prevent-touch>
        <div className="-ml-4 flex touch-pan-y">
          {items.map((it, i) => {
            const c = it.driver.team.color;
            const active = i === selected;
            return (
              <div key={it.driver.id} className="min-w-0 shrink-0 grow-0 basis-[78%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <article
                  className={`group relative isolate h-[420px] overflow-hidden rounded-3xl ring-1 transition-[box-shadow] duration-500 ${active ? "ring-white/30" : "ring-white/10"}`}
                  style={{ background: `linear-gradient(170deg, ${c} 0%, ${c}cc 38%, #0b0c0e 100%)` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
                  <span
                    className="font-display absolute -top-4 -right-2 text-[11rem] leading-none font-black italic"
                    style={{ color: "transparent", WebkitTextStroke: "2px rgb(255 255 255 / 0.35)" }}
                  >
                    {it.driver.number ?? ""}
                  </span>
                  <div className="absolute inset-x-0 bottom-24 -z-0 flex justify-center transition-transform duration-700 group-hover:scale-105">
                    <Headshot driver={it.driver} size={340} className="h-[300px] w-auto object-contain drop-shadow-[0_30px_40px_rgb(0_0_0/0.5)]" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-5 pt-16">
                    <p className="font-mono text-[10px] tracking-[0.25em] text-white/55 uppercase">
                      P{it.position} · {it.driver.team.name}
                    </p>
                    <p className="font-display text-2xl leading-tight font-bold">
                      <span className="font-normal text-white/70">{it.driver.givenName} </span>
                      {it.driver.familyName}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
                      {[
                        ["PTS", it.points],
                        ["VIT", it.wins],
                        ["PÓD", it.stats?.podiums ?? "—"],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-lg bg-white/[0.06] px-2 py-1.5 ring-1 ring-white/10">
                          <p className="text-[9px] text-white/45">{k}</p>
                          <p className="text-base text-white">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex flex-1 gap-1">
          {items.map((it, i) => (
            <button
              key={it.driver.id}
              aria-label={`Ir para ${it.driver.familyName}`}
              onClick={() => embla?.scrollTo(i)}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ background: i === selected ? it.driver.team.color : "rgb(255 255 255 / 0.12)" }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => embla?.scrollPrev()} aria-label="Anterior" className="grid size-10 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 transition hover:bg-white/[0.14]">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => embla?.scrollNext()} aria-label="Próximo" className="grid size-10 place-items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 transition hover:bg-white/[0.14]">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
