import Link from "next/link";

import { SeasonSelect } from "@/components/season-select";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard#estrategia", label: "Estratégia" },
  { href: "/dashboard#ritmo", label: "Ritmo" },
  { href: "/dashboard#campeonato", label: "Campeonato" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="Dash F1">
      <svg viewBox="0 0 48 20" className="h-5 w-12" aria-hidden>
        <path d="M10 20 22 0h26L36 20z" fill="#e10600" />
        <path d="M0 20 8 8h9L9 20z" fill="#fff" />
      </svg>
      <span className="font-display text-sm font-bold tracking-[0.2em] text-white/80">DASH</span>
    </Link>
  );
}

export function GlassNav({ active, season, seasons }: { active: string; season: string; seasons: string[] }) {
  return (
    <header className="glass mx-auto flex w-full max-w-4xl items-center justify-between gap-4 rounded-full py-2 pr-2 pl-5">
      <Logo />
      <nav className="hidden items-center gap-1 md:flex">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={`${l.href.includes("#") ? l.href.replace("#", `?season=${season}#`) : `${l.href}?season=${season}`}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm text-white/70 transition-colors hover:text-white",
              active === l.href && "bg-white/10 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <SeasonSelect season={season} seasons={seasons} />
    </header>
  );
}
