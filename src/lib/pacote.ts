import "server-only";

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Pacote de dados que o PC 1 gera (public/dados.json), o PC 2 transfere e o
 * PC 3 (este app) recebe em POST /api/receber. Ele guarda a resposta de cada
 * requisição do contrato (docs/contrato-api.md), indexada pelo caminho.
 */
export const FORMATO_PACOTE = "dash-f1/pacote@1";

export type Fonte = "jolpica" | "openf1" | "multiviewer";

export interface Pacote {
  formato: typeof FORMATO_PACOTE;
  temporada: string;
  geradoEm: string;
  origem?: string;
  /** Chave = "<fonte>/<caminho>", ex.: "jolpica/2026/driverstandings.json". */
  respostas: Record<string, unknown>;
}

export interface Recebimento {
  recebidoEm: string;
  /** IP de quem enviou (o PC 2). */
  remetente?: string;
  bytes: number;
  respostas: number;
}

interface Armazenado {
  pacote: Pacote;
  recebimento: Recebimento;
}

const ARQUIVO = process.env.F1_PACOTE_ARQUIVO ?? join(process.cwd(), ".dados", "recebido.json");

let cache: { mtime: number; valor: Armazenado } | undefined;

export const chave = (fonte: Fonte, caminho: string) => `${fonte}/${caminho}`;

/** Confere se o corpo recebido tem o formato do pacote; devolve o erro ou null. */
export function validarPacote(corpo: unknown): string | null {
  if (!corpo || typeof corpo !== "object") return "o corpo precisa ser um objeto JSON";
  const p = corpo as Partial<Pacote>;
  if (p.formato !== FORMATO_PACOTE) return `campo "formato" deve ser "${FORMATO_PACOTE}"`;
  if (typeof p.temporada !== "string" || !/^\d{4}$/.test(p.temporada)) return 'campo "temporada" deve ser um ano, ex.: "2026"';
  if (typeof p.geradoEm !== "string") return 'campo "geradoEm" deve ser uma data ISO 8601';
  if (!p.respostas || typeof p.respostas !== "object") return 'campo "respostas" deve ser um objeto';
  if (!Object.keys(p.respostas).some((k) => k.startsWith("jolpica/"))) return 'o pacote não tem nenhuma resposta da "jolpica"';
  return null;
}

/** Lê o último pacote recebido (com cache pela data de modificação do arquivo). */
export function lerPacote(): Armazenado | undefined {
  if (!existsSync(ARQUIVO)) return undefined;
  const mtime = statSync(ARQUIVO).mtimeMs;
  if (cache?.mtime !== mtime) {
    try {
      cache = { mtime, valor: JSON.parse(readFileSync(ARQUIVO, "utf8")) as Armazenado };
    } catch {
      return undefined;
    }
  }
  return cache.valor;
}

export function salvarPacote(pacote: Pacote, recebimento: Recebimento) {
  mkdirSync(dirname(ARQUIVO), { recursive: true });
  writeFileSync(ARQUIVO, JSON.stringify({ pacote, recebimento } satisfies Armazenado));
  cache = undefined;
}
