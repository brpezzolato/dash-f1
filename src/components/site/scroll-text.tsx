"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

function Word({ children, progress, range, accent }: { children: string; progress: MotionValue<number>; range: [number, number]; accent?: boolean }) {
  // Só opacidade (composta na GPU); filtros por palavra travam a rolagem.
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${accent ? "text-[#ff6b2c]" : ""}`}>
      {children}
    </motion.span>
  );
}

/** Texto que “acende” palavra por palavra conforme a rolagem. */
export function ScrollText({ text, highlight = [] }: { text: string; highlight?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className="font-display max-w-5xl text-3xl leading-[1.15] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
      {words.map((w, i) => {
        const start = i / words.length;
        const hit = highlight.some((h) => w.replace(/[.,]/g, "") === h);
        return (
          <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]} accent={hit}>
            {w}
          </Word>
        );
      })}
    </p>
  );
}
