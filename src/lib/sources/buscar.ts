import "server-only";

import { DATA_SOURCES, FONTE } from "../config";
import { createThrottle, fetchJson } from "../http";
import { chave, lerPacote, type Fonte } from "../pacote";

const throttleOpenF1 = createThrottle(350);

/** Há um pacote recebido do PC 2 e ele deve ser usado? */
export function usandoPacote(): boolean {
  if (FONTE === "publica") return false;
  return FONTE === "rede" || Boolean(lerPacote());
}

/**
 * Ponto único de acesso aos dados: lê a resposta do pacote recebido pela rede
 * ou, no modo "publica", faz a requisição HTTP à API pública.
 */
export async function buscar<T>(fonte: Fonte, caminho: string, headers?: Record<string, string>): Promise<T> {
  if (usandoPacote()) {
    const armazenado = lerPacote();
    if (!armazenado) throw new Error("nenhum pacote recebido ainda em POST /api/receber");
    const k = chave(fonte, caminho);
    if (!(k in armazenado.pacote.respostas)) throw new Error(`o pacote não tem "${k}"`);
    return armazenado.pacote.respostas[k] as T;
  }
  const url = `${DATA_SOURCES[fonte]}/${caminho}`;
  const req = () => fetchJson<T>(url, { headers });
  return fonte === "openf1" ? throttleOpenF1(req) : req();
}
