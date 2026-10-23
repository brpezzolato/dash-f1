#!/usr/bin/env node
/**
 * PC 1 — Coletor.
 *
 * Consulta as APIs públicas de F1 e grava tudo em public/dados.json, que o
 * servidor do PC 1 publica em http://<PC1>:3000/dados.json para o PC 2 buscar.
 *
 * O arquivo é um "pacote" com a resposta de cada requisição que o dashboard
 * (PC 3) precisa, indexada pelo caminho — formato descrito em docs/contrato-api.md.
 *
 * Uso (Node 18+, sem dependências):
 *   node coletar-dados.mjs                     → temporada atual, grava ./public/dados.json
 *   node coletar-dados.mjs --temporada 2025
 *   node coletar-dados.mjs --saida ./public/dados.json --intervalo 10   (repete a cada 10 min)
 */
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { dirname, resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);

const TEMPORADA = args.temporada ?? process.env.TEMPORADA ?? String(new Date().getFullYear());
const SAIDA = resolve(args.saida ?? process.env.SAIDA ?? "public/dados.json");
const INTERVALO_MIN = Number(args.intervalo ?? process.env.INTERVALO ?? 0);

const BASES = {
  jolpica: process.env.F1_JOLPICA_BASE ?? "https://api.jolpi.ca/ergast/f1",
  openf1: process.env.F1_OPENF1_BASE ?? "https://api.openf1.org/v1",
  multiviewer: process.env.F1_MULTIVIEWER_BASE ?? "https://api.multiviewer.app/api/v1",
};
/** Intervalo mínimo entre chamadas a cada API (limites de uso das APIs gratuitas). */
const ESPERA_MS = { jolpica: 300, openf1: 400, multiviewer: 150 };
const PAGINA = 100;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function coletar(temporada) {
  const respostas = {};
  let ok = 0;
  let falhas = 0;

  /** Faz o GET, guarda a resposta em respostas["<fonte>/<caminho>"] e a devolve. */
  async function get(fonte, caminho, headers = {}) {
    await dormir(ESPERA_MS[fonte]);
    const url = `${BASES[fonte]}/${caminho}`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json", ...headers }, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      respostas[`${fonte}/${caminho}`] = json;
      ok++;
      console.log(`  ✓ ${fonte}/${caminho}`);
      return json;
    } catch (err) {
      falhas++;
      console.log(`  ✗ ${fonte}/${caminho} (${err.message})`);
      return undefined;
    }
  }

  async function paginado(tipo) {
    const primeira = await get("jolpica", `${temporada}/${tipo}.json?limit=${PAGINA}&offset=0`);
    const total = Number(primeira?.MRData?.total ?? 0);
    for (let offset = PAGINA; offset < total; offset += PAGINA) {
      await get("jolpica", `${temporada}/${tipo}.json?limit=${PAGINA}&offset=${offset}`);
    }
  }

  console.log(`\n[PC 1] Coletando temporada ${temporada}…`);

  // 1. Jolpica: classificação, calendário e resultados.
  await get("jolpica", `${temporada}/driverstandings.json`);
  await get("jolpica", `${temporada}/constructorstandings.json`);
  await get("jolpica", `${temporada}.json?limit=${PAGINA}`);
  await get("jolpica", `${temporada}/last/results.json`);
  await paginado("results");
  await paginado("sprint");

  // 2. OpenF1 (dados existem a partir de 2023).
  const meetings = [];
  if (Number(temporada) >= 2023) {
    const sessoes = (await get("openf1", `sessions?year=${temporada}&session_name=Race`)) ?? [];
    meetings.push(...((await get("openf1", `meetings?year=${temporada}`)) ?? []));
    meetings.push(...((await get("openf1", `meetings?year=${Number(temporada) - 1}`)) ?? []));

    const agora = Date.now();
    const ultima = sessoes.filter((s) => new Date(s.date_end).getTime() < agora).at(-1);
    if (ultima) {
      const k = ultima.session_key;
      await get("openf1", `drivers?session_key=${k}`);
      await get("openf1", `weather?session_key=${k}`);
      await get("openf1", `stints?session_key=${k}`);
      await get("openf1", `laps?session_key=${k}`);
    }
  }

  // 3. MultiViewer: traçado de cada circuito da temporada (com o ano anterior como reserva).
  const circuitos = [...new Set(meetings.map((m) => m.circuit_key))];
  for (const key of circuitos) {
    const atual = await get("multiviewer", `circuits/${key}/${temporada}`, { "User-Agent": "dash-f1" });
    if (!atual) await get("multiviewer", `circuits/${key}/${Number(temporada) - 1}`, { "User-Agent": "dash-f1" });
  }

  const pacote = {
    formato: "dash-f1/pacote@1",
    temporada,
    geradoEm: new Date().toISOString(),
    origem: `PC 1 (${hostname()})`,
    respostas,
  };

  // Grava em um arquivo temporário e renomeia: o PC 2 nunca lê um JSON pela metade.
  mkdirSync(dirname(SAIDA), { recursive: true });
  const tmp = `${SAIDA}.tmp`;
  writeFileSync(tmp, JSON.stringify(pacote));
  renameSync(tmp, SAIDA);

  const kb = Buffer.byteLength(JSON.stringify(pacote)) / 1024;
  console.log(`[PC 1] ${ok} respostas salvas, ${falhas} falhas → ${SAIDA} (${kb.toFixed(0)} KB)`);
}

await coletar(TEMPORADA);
if (INTERVALO_MIN > 0) {
  console.log(`[PC 1] Repetindo a cada ${INTERVALO_MIN} min. Ctrl+C para parar.`);
  setInterval(() => coletar(TEMPORADA).catch((e) => console.error(e)), INTERVALO_MIN * 60_000);
}
