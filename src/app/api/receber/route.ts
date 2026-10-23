import { revalidatePath } from "next/cache";

import { lerPacote, salvarPacote, validarPacote, type Pacote } from "@/lib/pacote";

/**
 * PC 3 — recebe o pacote de dados que o PC 2 buscou no PC 1.
 *
 *   POST /api/receber   corpo: o JSON de http://<PC1>:3000/dados.json
 *   GET  /api/receber   status do último recebimento
 */
export const dynamic = "force-dynamic";

const LIMITE_BYTES = 25 * 1024 * 1024;

function remetente(req: Request) {
  return (
    req.headers.get("x-origem") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined
  );
}

export async function POST(req: Request) {
  const texto = await req.text();
  const bytes = Buffer.byteLength(texto);
  if (bytes > LIMITE_BYTES) {
    return Response.json({ ok: false, erro: `pacote maior que ${LIMITE_BYTES / 1024 / 1024} MB` }, { status: 413 });
  }

  let corpo: unknown;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return Response.json({ ok: false, erro: "o corpo não é um JSON válido" }, { status: 400 });
  }
  const erro = validarPacote(corpo);
  if (erro) return Response.json({ ok: false, erro }, { status: 422 });

  const pacote = corpo as Pacote;
  const recebimento = {
    recebidoEm: new Date().toISOString(),
    remetente: remetente(req),
    bytes,
    respostas: Object.keys(pacote.respostas).length,
  };
  salvarPacote(pacote, recebimento);
  // A página do dashboard passa a mostrar os dados novos na próxima visita.
  revalidatePath("/");

  console.log(`[receber] pacote ${pacote.temporada} de ${recebimento.remetente ?? "?"} · ${recebimento.respostas} respostas · ${(bytes / 1024).toFixed(0)} KB`);
  return Response.json({ ok: true, temporada: pacote.temporada, ...recebimento }, { status: 201 });
}

export async function GET() {
  const atual = lerPacote();
  if (!atual) return Response.json({ recebido: false });
  return Response.json({
    recebido: true,
    temporada: atual.pacote.temporada,
    geradoEm: atual.pacote.geradoEm,
    origem: atual.pacote.origem,
    ...atual.recebimento,
  });
}
