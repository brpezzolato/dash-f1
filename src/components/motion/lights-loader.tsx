"use client";

import { motion } from "motion/react";

/** As cinco luzes da largada acendendo em sequência e apagando — “lights out”. */
export function LightsLoader({ label = "Carregando dados" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 shadow-2xl">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg bg-[#101114] p-1.5">
            {[0, 1].map((row) => (
              <motion.span
                key={row}
                className="block size-6 rounded-full"
                initial={{ backgroundColor: "#2a0b0b", boxShadow: "0 0 0 #000" }}
                animate={{
                  backgroundColor: ["#2a0b0b", "#2a0b0b", "#ff1e1e", "#ff1e1e", "#2a0b0b"],
                  boxShadow: ["0 0 0px #ff1e1e00", "0 0 0px #ff1e1e00", "0 0 18px #ff1e1e", "0 0 18px #ff1e1e", "0 0 0px #ff1e1e00"],
                }}
                transition={{
                  duration: 3,
                  times: [0, i * 0.12, i * 0.12 + 0.02, 0.8, 0.82],
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <motion.p
        className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        {label}
      </motion.p>
    </div>
  );
}
