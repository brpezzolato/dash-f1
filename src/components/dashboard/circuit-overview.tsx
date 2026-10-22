import { CloudRain, Droplets, Flag, Ruler, Sun, Thermometer, Wind } from "lucide-react";

import { TrackMap } from "@/components/track-map";
import type { CircuitInfo, WeatherSummary } from "@/lib/types";

export function CircuitOverview({ circuit, weather, title = "Circuito" }: { circuit: CircuitInfo; weather?: WeatherSummary; title?: string }) {
  const tiles = [
    { icon: Ruler, label: "Extensão", value: circuit.lengthKm?.toFixed(3), unit: "km" },
    { icon: Flag, label: "Voltas", value: circuit.laps, unit: "" },
    { icon: Thermometer, label: "Ar", value: weather?.airTemp.toFixed(1), unit: "°C" },
    { icon: Sun, label: "Pista", value: weather?.trackTemp.toFixed(1), unit: "°C" },
    { icon: Droplets, label: "Umidade", value: weather?.humidity.toFixed(0), unit: "%" },
    { icon: weather?.rain ? CloudRain : Wind, label: weather?.rain ? "Chuva" : "Vento", value: weather ? (weather.rain ? "Sim" : weather.windSpeed.toFixed(1)) : undefined, unit: weather?.rain ? "" : "m/s" },
  ];
  const distance = circuit.lengthKm && circuit.laps ? (circuit.lengthKm * circuit.laps).toFixed(1) : undefined;

  return (
    <section className="glass flex flex-col rounded-3xl p-5">
      <p className="kicker">{title}</p>
      <div className="relative my-2 rounded-2xl bg-black/25 p-3">
        <TrackMap map={circuit.map} corners className="mx-auto aspect-square w-full max-w-[300px]" />
      </div>
      <p className="text-muted-foreground text-xs">Nome do circuito</p>
      <p className="font-display text-xl leading-tight font-bold">{circuit.name}</p>
      <p className="text-muted-foreground text-xs">
        {circuit.locality}, {circuit.country}
        {circuit.firstGp && ` · desde ${circuit.firstGp}`}
        {distance && ` · ${distance} km de corrida`}
        {circuit.map && ` · ${circuit.map.corners.length} curvas`}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {tiles.map(({ icon: Icon, label, value, unit }) => (
          <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-muted-foreground flex items-center justify-between text-[11px]">
              {label} <Icon className="size-3.5" />
            </p>
            <p className="font-display num mt-1 text-xl font-bold">
              {value ?? "—"}
              {value !== undefined && <span className="text-muted-foreground ml-0.5 text-xs font-normal">{unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
