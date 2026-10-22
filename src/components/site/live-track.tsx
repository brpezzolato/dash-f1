"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { TrackMap } from "@/lib/types";

export interface TrackCar {
  id: string;
  code: string;
  color: string;
  /** Fração de volta atrás do líder (0 = líder). */
  behind: number;
}

/** Duração de uma volta na animação, em ms. */
const LAP_MS = 14_000;
/** Duração do desenho do traçado (atraso + animação), em ms. */
const DRAW_MS = 2_100;

/**
 * Traçado que se desenha ao entrar e, depois, carros circulando com as
 * distâncias reais da última corrida (gap ÷ tempo médio de volta).
 */
export function LiveTrack({ map, cars, className }: { map?: TrackMap; cars: TrackCar[]; className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRefs = useRef<Array<SVGGElement | null>>([]);
  const [drawn, setDrawn] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), DRAW_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !drawn) return;
    // Tabela de pontos pré-calculada: getPointAtLength por carro a cada quadro é caro.
    const SAMPLES = 1200;
    const length = path.getTotalLength();
    const lut = new Float32Array(SAMPLES * 2);
    for (let k = 0; k < SAMPLES; k++) {
      const p = path.getPointAtLength((k / SAMPLES) * length);
      lut[k * 2] = p.x;
      lut[k * 2 + 1] = p.y;
    }
    let frame = 0;
    let visible = true;
    const start = performance.now();
    // Pausa a animação quando o mapa sai da tela.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !reduce) frame = requestAnimationFrame(place);
    });
    io.observe(path.ownerSVGElement ?? path);

    const place = (now: number) => {
      const lap = reduce ? 0.15 : ((now - start) / LAP_MS) % 1;
      cars.forEach((car, i) => {
        const node = dotRefs.current[i];
        if (!node) return;
        const u = (((lap - car.behind) % 1) + 1) % 1;
        const k = Math.floor(u * SAMPLES) % SAMPLES;
        node.setAttribute("transform", `translate(${lut[k * 2]} ${lut[k * 2 + 1]})`);
      });
      if (!reduce && visible) frame = requestAnimationFrame(place);
    };
    frame = requestAnimationFrame(place);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [cars, drawn, reduce]);

  if (!map) {
    return <div className={`text-muted-foreground grid place-items-center text-xs ${className}`}>Traçado indisponível</div>;
  }

  return (
    <svg viewBox="0 0 1000 1000" className={className} role="img" aria-label="Traçado do circuito com as posições dos carros">
      {/* Caminho usado só para medir; o motion.path recebe pathLength e distorce as medidas. */}
      <path ref={pathRef} d={map.path} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="38" strokeLinejoin="round" />
      <motion.path
        d={map.path}
        fill="none"
        stroke="#f4f5f7"
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: (DRAW_MS - 300) / 1000, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
      />
      <motion.rect
        x={map.start.x - 6}
        y={map.start.y - 22}
        width="12"
        height="44"
        rx="3"
        fill="#ff6b2c"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      />
      {cars.map((car, i) => (
        <g
          key={car.id}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          transform={`translate(${map.start.x} ${map.start.y})`}
        >
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={drawn ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 18 }}
          >
            <circle r="24" fill={car.color} stroke="#16171a" strokeWidth="6" />
            {i === 0 && (
              <text y="-36" textAnchor="middle" fontSize="30" fontWeight="700" fill="#fff" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {car.code}
              </text>
            )}
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
