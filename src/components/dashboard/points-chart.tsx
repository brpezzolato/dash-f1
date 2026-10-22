"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PointsSeries } from "@/lib/types";

export function PointsChart({ series }: { series: PointsSeries }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
        {series.drivers.map((d) => (
          <span key={d.id} className="flex items-center gap-1.5 text-xs font-semibold">
            <svg width="16" height="6" aria-hidden>
              <line x1="0" y1="3" x2="16" y2="3" stroke={d.color} strokeWidth="2.5" strokeDasharray={d.dashed ? "3 2" : undefined} />
            </svg>
            {d.code}
          </span>
        ))}
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.rows} margin={{ left: -18, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.06)" vertical={false} />
            <XAxis dataKey="round" tick={{ fill: "#9aa0aa", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#9aa0aa", fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "#121418", border: "1px solid rgb(255 255 255 / 0.1)", borderRadius: 12, fontSize: 12 }}
              labelFormatter={(_, p) => p?.[0]?.payload?.race ?? ""}
              itemSorter={(item) => -Number(item.value)}
            />
            {series.drivers.map((d) => (
              <Line
                key={d.id}
                dataKey={d.id}
                name={d.code}
                stroke={d.color}
                strokeWidth={2}
                strokeDasharray={d.dashed ? "5 4" : undefined}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
