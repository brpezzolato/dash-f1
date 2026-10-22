"use client";

import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center">
        <p className="kicker text-f1">Bandeira vermelha</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Não foi possível carregar os dados</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          A API de dados não respondeu. {error.message && <span className="block text-xs opacity-70">{error.message}</span>}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={reset} className="bg-f1 rounded-full px-5 py-2 text-sm font-semibold text-white">
            Tentar novamente
          </button>
          <Link href="/" className="rounded-full bg-white/10 px-5 py-2 text-sm">
            Início
          </Link>
        </div>
      </div>
    </main>
  );
}
