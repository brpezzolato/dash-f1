import Link from "next/link";
import { BarChart3, CalendarDays, Flag, Gauge, Home, Trophy } from "lucide-react";

const ITEMS = [
  { href: "/", icon: Home, label: "Início" },
  { href: "#corrida", icon: Flag, label: "Corrida" },
  { href: "#estrategia", icon: Gauge, label: "Estratégia" },
  { href: "#ritmo", icon: BarChart3, label: "Ritmo" },
  { href: "#campeonato", icon: Trophy, label: "Campeonato" },
  { href: "#calendario", icon: CalendarDays, label: "Calendário" },
];

export function Sidebar({ season }: { season: string }) {
  return (
    <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-16 shrink-0 flex-col items-center gap-2 rounded-3xl py-5 lg:flex">
      <Link href={`/?season=${season}`} aria-label="Início" className="mb-4">
        <svg viewBox="0 0 48 20" className="h-4 w-10" aria-hidden>
          <path d="M10 20 22 0h26L36 20z" fill="#e10600" />
          <path d="M0 20 8 8h9L9 20z" fill="#fff" />
        </svg>
      </Link>
      {ITEMS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href === "/" ? `/?season=${season}` : href}
          title={label}
          className="text-muted-foreground grid size-10 place-items-center rounded-xl transition-colors hover:bg-white/10 hover:text-white"
        >
          <Icon className="size-[18px]" />
          <span className="sr-only">{label}</span>
        </Link>
      ))}
    </aside>
  );
}
