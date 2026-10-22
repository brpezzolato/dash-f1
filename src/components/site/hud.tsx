import { cn } from "@/lib/utils";

/** Cantoneiras estilo HUD em volta de um bloco. */
export function HudCorners({ className, color = "rgb(255 255 255 / 0.35)" }: { className?: string; color?: string }) {
  const base = "absolute size-3 border-current";
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)} style={{ color }}>
      <span className={`${base} top-0 left-0 border-t border-l`} />
      <span className={`${base} top-0 right-0 border-t border-r`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} right-0 bottom-0 border-r border-b`} />
    </span>
  );
}

export function SectionHeading({ index, kicker, title, children }: { index: string; kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">
          <span className="text-f1">{index}</span>
          <span className="h-px w-10 bg-white/20" />
          {kicker}
        </p>
        <h2 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/** Bloco arredondado que divide as seções do site. */
export function Block({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className={cn(
        // content-visibility: o navegador pula layout/pintura do que está fora da tela.
        "relative scroll-mt-4 rounded-[32px] bg-[#111215] p-5 ring-1 ring-white/[0.06] [contain-intrinsic-size:auto_900px] [content-visibility:auto] sm:p-8 lg:p-10",
        className,
      )}
    >
      {children}
    </section>
  );
}
