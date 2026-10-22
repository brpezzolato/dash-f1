"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Rolagem suave com inércia (Lenis), também nos links de âncora. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // lerp baixo = rolagem suave mas responsiva; sem inércia exagerada.
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, anchors: { offset: -16 } });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
  return null;
}
