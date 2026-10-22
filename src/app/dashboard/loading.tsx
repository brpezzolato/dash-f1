import { LightsLoader } from "@/components/motion/lights-loader";

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0b0c0e]">
      <LightsLoader label="Processando telemetria" />
    </div>
  );
}
