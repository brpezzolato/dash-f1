"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Progression } from "@/lib/types";

export function PointsChart({ progression }: { progression: Progression }) {
  const { rows, drivers } = progression;

  return (
    <div className="bg-paper text-paper-ink relative h-full overflow-hidden rounded-sm p-5 shadow-xl shadow-black/20">
      <div className="halftone pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-black/50 uppercase">Pontos acumulados · top 6</p>
        <h3 className="font-display text-2xl font-bold uppercase">Evolução no campeonato</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {drivers.map((d) => (
            <span key={d.id} className="font-display flex items-center gap-1.5 text-sm font-semibold">
              <svg width="18" height="6" aria-hidden>
                <line x1="0" y1="3" x2="18" y2="3" stroke={d.color} strokeWidth="3" strokeDasharray={d.dashed ? "4 3" : undefined} />
              </svg>
              {d.code}
            </span>
          ))}
        </div>
        {rows.length ? (
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="rgb(0 0 0 / 0.08)" vertical={false} />
                <XAxis dataKey="round" tick={{ fill: "rgb(0 0 0 / 0.5)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "rgb(0 0 0 / 0.5)", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f1213", border: "none", borderRadius: 2, color: "#fff" }}
                  labelStyle={{ color: "#00d2be", fontWeight: 600 }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.race ?? ""}
                  itemSorter={(item) => -Number(item.value)}
                />
                {drivers.map((d, i) => (
                  <Line
                    key={d.id}
                    dataKey={d.id}
                    name={d.code}
                    stroke={d.color}
                    strokeWidth={2.5}
                    strokeDasharray={d.dashed ? "6 4" : undefined}
                    dot={false}
                    activeDot={{ r: 4 }}
                    animationDuration={1400}
                    animationBegin={i * 120}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-black/50">Nenhuma corrida disputada ainda.</p>
        )}
      </div>
    </div>
  );
}
