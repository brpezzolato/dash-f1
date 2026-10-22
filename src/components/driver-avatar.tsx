/* eslint-disable @next/next/no-img-element */
import type { DriverInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DriverAvatar({ driver, className }: { driver: DriverInfo; className?: string }) {
  return (
    <span
      className={cn("relative inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-full", className)}
      style={{ background: `linear-gradient(160deg, ${driver.team.color}, ${driver.team.color}33)` }}
    >
      {driver.headshot ? (
        <img src={driver.headshot} alt="" className="absolute inset-0 size-full object-cover object-top" loading="lazy" />
      ) : (
        <span className="font-display text-[11px] font-bold text-white">{driver.code}</span>
      )}
    </span>
  );
}

export function NumberBadge({ driver }: { driver: DriverInfo }) {
  return (
    <span
      className="font-display num inline-grid h-5 min-w-7 place-items-center rounded-md px-1 text-xs font-bold text-white"
      style={{ background: driver.team.color, color: luminance(driver.team.color) > 0.6 ? "#000" : "#fff" }}
    >
      {driver.number ?? driver.code}
    </span>
  );
}

function luminance(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
