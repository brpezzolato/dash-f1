import Image from "next/image";

import type { DriverInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Foto do piloto servida pelo otimizador de imagens do Next (mesmo domínio). */
export function Headshot({ driver, size, className, priority }: { driver: DriverInfo; size: number; className?: string; priority?: boolean }) {
  if (!driver.headshot) {
    return (
      <span
        className={cn("font-display grid place-items-center font-bold text-white/80", className)}
        style={{ width: size, height: size, background: `linear-gradient(160deg, ${driver.team.color}, ${driver.team.color}44)` }}
      >
        {driver.code}
      </span>
    );
  }
  return (
    <Image
      src={driver.headshot}
      alt={`${driver.givenName} ${driver.familyName}`}
      width={size}
      height={size}
      priority={priority}
      className={cn("object-cover object-top", className)}
    />
  );
}
