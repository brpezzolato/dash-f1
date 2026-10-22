import type { TrackMap as TrackMapData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  map?: TrackMapData;
  color?: string;
  corners?: boolean;
  className?: string;
}

/** Traçado do circuito em SVG, com brilho e marcação da largada. */
export function TrackMap({ map, color = "#ffffff", corners = false, className }: Props) {
  if (!map) {
    return (
      <div className={cn("text-muted-foreground grid place-items-center text-xs", className)}>
        Traçado indisponível
      </div>
    );
  }
  const glowId = `glow-${color.replace("#", "")}`;
  return (
    <svg viewBox="0 0 1000 1000" className={className} role="img" aria-label="Traçado do circuito">
      <defs>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={map.path} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="34" strokeLinejoin="round" />
      <path
        d={map.path}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />
      <circle cx={map.start.x} cy={map.start.y} r="16" fill="#e10600" stroke="#fff" strokeWidth="5" />
      {corners &&
        map.corners.map((c) => (
          <g key={c.number}>
            <circle cx={c.x} cy={c.y} r="20" fill="rgb(0 0 0 / 0.65)" stroke="rgb(255 255 255 / 0.25)" strokeWidth="2" />
            <text x={c.x} y={c.y + 7} textAnchor="middle" fontSize="20" fontWeight="600" fill="#fff" fontFamily="Inter Variable, sans-serif">
              {c.number}
            </text>
          </g>
        ))}
    </svg>
  );
}
