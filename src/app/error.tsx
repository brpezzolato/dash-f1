"use client";

import { Backdrop } from "@/components/backdrop";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <Backdrop />
      <main className="mx-auto grid min-h-screen max-w-lg place-items-center px-4">
        <div className="bg-card w-full rounded-sm p-8 text-center shadow-2xl">
          <p className="text-teal text-xs font-semibold tracking-[0.25em] uppercase">Bandeira vermelha</p>
          <h1 className="font-display mt-2 text-3xl font-bold uppercase">Não foi possível carregar os dados</h1>
          <p className="text-muted-foreground mt-2 text-sm">{error.message}</p>
          <button onClick={reset} className="bg-teal text-primary-foreground mt-6 rounded-[2px] px-4 py-2 text-sm font-medium">
            Tentar novamente
          </button>
        </div>
      </main>
    </>
  );
}
