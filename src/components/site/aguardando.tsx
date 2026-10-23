import { RedeStatus } from "./rede-status";

/** Tela do PC 3 antes de o PC 2 enviar o primeiro pacote. */
export function Aguardando() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#07080a] p-6">
      <div className="w-full max-w-xl rounded-[32px] bg-[#111215] p-8 ring-1 ring-white/[0.06]">
        <p className="font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">
          <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-amber-400" />
          PC 3 · Dashboard
        </p>
        <h1 className="font-display mt-3 text-3xl font-bold">Aguardando dados do PC 2</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Este dashboard só exibe os dados recebidos pela rede. Assim que o PC 2 fizer o envio, a página atualiza sozinha.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/50 p-4 font-mono text-xs leading-relaxed text-white/75 ring-1 ring-white/[0.06]">
{`PC 1  GET  http://<PC1>:3000/dados.json
PC 2  POST http://<PC3>:3000/api/receber
      Content-Type: application/json
      corpo: o JSON recebido do PC 1`}
        </pre>
        {/* Sem info: só faz a verificação periódica e recarrega quando chegar. */}
        <RedeStatus />
      </div>
    </main>
  );
}
