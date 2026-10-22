import "server-only";

import { REVALIDATE_SECONDS } from "./config";

const TIMEOUT_MS = 12_000;

export async function fetchJson<T>(url: string, init?: { headers?: Record<string, string> }): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...init?.headers },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${res.status} ao buscar ${url}`);
  return res.json();
}

/**
 * Fila simples que espaça as chamadas. O OpenF1 gratuito aceita ~3 req/s,
 * então serializamos as requisições a ele com um intervalo mínimo.
 */
export function createThrottle(minIntervalMs: number) {
  let last = Promise.resolve();
  return <T>(task: () => Promise<T>): Promise<T> => {
    const run = last.then(task);
    last = run.then(
      () => new Promise((r) => setTimeout(r, minIntervalMs)),
      () => new Promise((r) => setTimeout(r, minIntervalMs)),
    );
    return run;
  };
}

/** Resolve a promessa ou devolve `undefined`, para que uma fonte fora do ar não derrube a página. */
export async function optional<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch (err) {
    console.warn("[dash-f1] fonte de dados indisponível:", (err as Error).message);
    return undefined;
  }
}
