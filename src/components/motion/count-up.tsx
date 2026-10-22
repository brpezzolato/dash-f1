"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

export function CountUp({ value, decimals = 0, duration = 1.4, className }: { value: number; decimals?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (node.textContent = v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })),
    });
    return () => controls.stop();
  }, [value, decimals, duration, inView]);

  return (
    <span ref={ref} className={className}>
      {(0).toFixed(decimals)}
    </span>
  );
}
