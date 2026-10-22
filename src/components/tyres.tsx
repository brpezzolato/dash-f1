import { cn } from "@/lib/utils";

/** Cores padrão dos compostos da Pirelli. */
export const COMPOUNDS: Record<string, { color: string; label: string; short: string }> = {
  SOFT: { color: "#ff3b3b", label: "Macio", short: "S" },
  MEDIUM: { color: "#ffd12e", label: "Médio", short: "M" },
  HARD: { color: "#f0f0f0", label: "Duro", short: "H" },
  INTERMEDIATE: { color: "#3ccf5a", label: "Intermediário", short: "I" },
  WET: { color: "#2f8cff", label: "Chuva", short: "W" },
};

export function compound(name: string) {
  return COMPOUNDS[name?.toUpperCase()] ?? { color: "#777", label: name ?? "?", short: "?" };
}

export function TyreDot({ name, className }: { name: string; className?: string }) {
  const c = compound(name);
  return (
    <span
      title={c.label}
      className={cn("inline-grid size-5 place-items-center rounded-full border-[3px] bg-black text-[9px] font-bold text-white", className)}
      style={{ borderColor: c.color }}
    >
      {c.short}
    </span>
  );
}
