"use client";

import { useEffect, useState } from "react";

import type { Highlight } from "@/lib/videos";

const ROTATE_MS = 45_000;

/**
 * Vídeo de corrida em tela cheia no fundo. Usa o player embutido do YouTube
 * (mudo, sem controles, em loop) e alterna entre os vídeos da lista; se houver
 * um MP4 próprio configurado, ele tem prioridade.
 */
export function VideoBackground({ videos, mp4 }: { videos: Highlight[]; mp4?: string }) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (videos.length < 2 || mp4) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % videos.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [videos.length, mp4]);

  const video = videos[index];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      {!reduced &&
        (mp4 ? (
          <video className="absolute inset-0 size-full object-cover" src={mp4} autoPlay muted loop playsInline />
        ) : (
          video && (
            <iframe
              key={video.id}
              title="Vídeo de fundo"
              tabIndex={-1}
              allow="autoplay; encrypted-media"
              // Escala para cobrir a tela inteira em qualquer proporção, cortando as bordas.
              className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.15] border-0"
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.id}&start=${video.start ?? 0}&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3`}
            />
          )
        ))}
      {/* Camadas para legibilidade sobre o vídeo. */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgb(0_0_0/0.4)_55%,#07080a_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#07080a] to-transparent" />
    </div>
  );
}
