/* eslint-disable @next/next/no-img-element */
import type { DriverInfo } from "@/lib/types";

export function DriverCard({ driver, label, stats }: { driver: DriverInfo; label: string; stats: Array<{ label: string; value: string }> }) {
  const c = driver.team.color;
  return (
    <section
      className="relative isolate flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 p-5"
      style={{ background: `linear-gradient(160deg, ${c} 0%, ${c}cc 35%, #0b0c0e 100%)` }}
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-6xl leading-none font-black text-white/95 italic">#{driver.number ?? driver.code}</span>
        <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold backdrop-blur">{label}</span>
      </div>
      {driver.headshot && (
        <img src={driver.headshot} alt="" className="absolute right-0 bottom-16 -z-10 h-[78%] w-auto object-contain drop-shadow-2xl" />
      )}
      <div className="mt-auto">
        <p className="text-sm font-medium text-white/80">{driver.team.name}</p>
        <p className="font-display text-3xl leading-none font-bold">
          {driver.givenName} <br />
          {driver.familyName}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-black/35 px-3 py-2 backdrop-blur">
              <p className="text-[10px] tracking-wide text-white/60 uppercase">{s.label}</p>
              <p className="font-display num text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
