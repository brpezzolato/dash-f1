#!/usr/bin/env node
/**
 * PC 2 — Cliente e transferência.
 *
 *   1. HTTP GET  no PC 1: http://172.16.29.68:3000/dados.json
 *   2. HTTP POST no PC 3: http://<IP_DO_PC3>:3000/api/receber  (enviando o mesmo JSON)
 *
 * Uso (Node 18+, sem dependências):
 *   node transferir.mjs --pc3 http://<IP_DO_PC3>:3000/api/receber
 *   node transferir.mjs --pc1 http://172.16.29.68:3000/dados.json --pc3 http://<IP_DO_PC3>:3000/api/receber
 *   node transferir.mjs --pc3 http://<IP_DO_PC3>:3000/api/receber --intervalo 30   (repete a cada 30 s)
 *
 * Também aceita as variáveis de ambiente PC1_URL, PC3_URL e INTERVALO.
 */
import { hostname, networkInterfaces } from "node:os";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);

const PC1_URL = args.pc1 ?? process.env.PC1_URL ?? "http://172.16.29.68:3000/dados.json";
const PC3_URL = args.pc3 ?? process.env.PC3_URL;
const INTERVALO_S = Number(args.intervalo ?? process.env.INTERVALO ?? 0);

if (!PC3_URL) {
  console.error("Informe o endereço do PC 3: --pc3 http://<IP_DO_PC3>:3000/api/receber");
  process.exit(1);
}

/** Primeiro IPv4 da rede local, para o PC 3 saber quem enviou. */
function meuIp() {
  for (const lista of Object.values(networkInterfaces())) {
    for (const nic of lista ?? []) if (nic.family === "IPv4" && !nic.internal) return nic.address;
  }
  return "desconhecido";
}

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function transferir() {
  const inicio = performance.now();
  console.log(`\n[PC 2] ${new Date().toLocaleTimeString("pt-BR")}`);

  // 1. GET no PC 1
  console.log(`  GET  ${PC1_URL}`);
  const resposta = await fetch(PC1_URL, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30_000) });
  if (!resposta.ok) throw new Error(`PC 1 respondeu HTTP ${resposta.status}`);
  const texto = await resposta.text();
  JSON.parse(texto); // garante que é JSON antes de repassar
  const t1 = performance.now();
  console.log(`       ← ${resposta.status} ${resposta.statusText} · ${kb(Buffer.byteLength(texto))} · ${(t1 - inicio).toFixed(0)} ms`);

  // 2. POST no PC 3, com o mesmo corpo
  console.log(`  POST ${PC3_URL}`);
  const envio = await fetch(PC3_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Origem": `${meuIp()} (${hostname()})` },
    body: texto,
    signal: AbortSignal.timeout(30_000),
  });
  const retorno = await envio.json().catch(() => ({}));
  const t2 = performance.now();
  if (!envio.ok) throw new Error(`PC 3 respondeu HTTP ${envio.status}: ${retorno.erro ?? "sem detalhes"}`);
  console.log(`       ← ${envio.status} ${envio.statusText} · ${retorno.respostas ?? "?"} respostas aceitas · ${(t2 - t1).toFixed(0)} ms`);
  console.log(`  ✓ Transferência concluída em ${(t2 - inicio).toFixed(0)} ms`);
}

async function rodar() {
  try {
    await transferir();
  } catch (err) {
    console.error(`  ✗ ${err.cause?.code ?? ""} ${err.message}`);
    if (!INTERVALO_S) process.exitCode = 1;
  }
}

await rodar();
if (INTERVALO_S > 0) {
  console.log(`[PC 2] Repetindo a cada ${INTERVALO_S} s. Ctrl+C para parar.`);
  setInterval(rodar, INTERVALO_S * 1000);
}
