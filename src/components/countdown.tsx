"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { label: "dias", value: Math.floor(s / 86400) },
    { label: "h", value: Math.floor((s % 86400) / 3600) },
    { label: "min", value: Math.floor((s % 3600) / 60) },
    { label: "seg", value: s % 60 },
  ];
}

export function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {parts(now === null ? 0 : new Date(to).getTime() - now).map((p) => (
        <div key={p.label} className="bg-white/5 py-1 text-center">
          <div className="font-display text-xl leading-none font-semibold tabular-nums">
            {now === null ? "--" : String(p.value).padStart(2, "0")}
          </div>
          <div className="text-[9px] tracking-wider text-white/50 uppercase">{p.label}</div>
        </div>
      ))}
    </div>
  );
}
