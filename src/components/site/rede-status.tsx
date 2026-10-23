"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface RedeInfo {
  recebidoEm: string;
  remetente?: string;
  geradoEm: string;
  origem?: string;
}

const INTERVALO_MS = 4000;

/**
 * Selo “dados via rede” e atualização automática: consulta GET /api/receber
 * e recarrega o dashboard quando o PC 2 envia um pacote novo.
 */
export function RedeStatus({ info }: { info?: RedeInfo }) {
  const router = useRouter();
  const ultimo = useRef(info?.recebidoEm);
  const [novo, setNovo] = useState(false);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/receber", { cache: "no-store" });
        const status = (await res.json()) as { recebido: boolean; recebidoEm?: string };
        if (status.recebido && status.recebidoEm !== ultimo.current) {
          ultimo.current = status.recebidoEm;
          setNovo(true);
          router.refresh();
          setTimeout(() => setNovo(false), 2500);
        }
      } catch {
        /* PC 3 fora do ar: tenta de novo no próximo ciclo */
      }
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [router]);

  if (!info) return null;
  const hora = new Date(info.recebidoEm).toLocaleTimeString("pt-BR");
  return (
    <span
      title={`Gerado no PC 1 em ${new Date(info.geradoEm).toLocaleString("pt-BR")}${info.origem ? ` (${info.origem})` : ""}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.15em] ring-1 transition-colors duration-500 ${
        novo ? "bg-emerald-500/25 text-emerald-200 ring-emerald-400/60" : "bg-white/[0.05] text-white/60 ring-white/10"
      }`}
    >
      <span className="size-1.5 rounded-full bg-emerald-400" />
      Rede · PC 2{info.remetente ? ` (${info.remetente})` : ""} · {hora}
    </span>
  );
}
