import { Reveal } from "@/components/reveal";

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal className="mb-5 flex items-end gap-4">
      <div>
        <p className="text-teal-ink/70 text-xs font-semibold tracking-[0.25em] uppercase">{kicker}</p>
        <h2 className="font-display text-teal-ink text-4xl leading-none font-extrabold uppercase italic sm:text-5xl">
          {title}
        </h2>
      </div>
      <div className="mb-2 flex flex-1 items-center gap-1">
        <div className="bg-teal-ink/80 h-2 flex-1 -skew-x-[40deg]" />
        <div className="bg-teal-ink/50 h-2 w-6 -skew-x-[40deg]" />
        <div className="bg-teal-ink/30 h-2 w-3 -skew-x-[40deg]" />
      </div>
    </Reveal>
  );
}
