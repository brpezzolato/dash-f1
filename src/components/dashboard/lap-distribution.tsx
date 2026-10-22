import type { LapDistribution as Dist } from "@/lib/types";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}:${(seconds - m * 60).toFixed(3).padStart(6, "0")}`;
}

/** Box plot do ritmo de corrida: dispersão dos tempos de volta limpos por piloto. */
export function LapDistribution({ data }: { data: Dist[] }) {
  const W = 640;
  const rowH = 30;
  const left = 56;
  const right = 16;
  const H = data.length * rowH + 28;
  const lo = Math.min(...data.map((d) => d.min));
  const hi = Math.max(...data.map((d) => d.max));
  const pad = (hi - lo) * 0.05;
  const x = (v: number) => left + ((v - (lo - pad)) / (hi - lo + pad * 2)) * (W - left - right);
  const ticks = Array.from({ length: 5 }, (_, i) => lo - pad + ((hi - lo + pad * 2) * i) / 4);
  const best = Math.min(...data.map((d) => d.median));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Distribuição dos tempos de volta">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={0} y2={H - 22} stroke="rgb(255 255 255 / 0.06)" />
          <text x={x(t)} y={H - 6} textAnchor="middle" fontSize="10" fill="#9aa0aa">
            {fmt(t)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const cy = i * rowH + rowH / 2;
        const c = d.driver.team.color;
        return (
          <g key={d.driver.id}>
            <title>{`${d.driver.familyName}: mediana ${fmt(d.median)} (+${(d.median - best).toFixed(3)}s) · ${d.laps.length} voltas`}</title>
            <text x={0} y={cy + 4} fontSize="12" fontWeight="600" fill="#f4f5f7">
              {d.driver.code}
            </text>
            {/* Pontos de cada volta, com leve deslocamento vertical para não se sobreporem. */}
            {d.laps.map((t, k) => (
              <circle key={k} cx={x(t)} cy={cy + (((k * 7) % 11) - 5)} r="1.6" fill={c} opacity="0.35" />
            ))}
            <line x1={x(d.min)} x2={x(d.max)} y1={cy} y2={cy} stroke={c} strokeOpacity="0.6" />
            <rect x={x(d.q1)} y={cy - 8} width={Math.max(2, x(d.q3) - x(d.q1))} height={16} rx="3" fill={c} fillOpacity="0.25" stroke={c} />
            <line x1={x(d.median)} x2={x(d.median)} y1={cy - 8} y2={cy + 8} stroke="#fff" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
}
