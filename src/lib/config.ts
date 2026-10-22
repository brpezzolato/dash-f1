import "server-only";

/**
 * Endereços das fontes de dados. Hoje apontam para as APIs públicas;
 * para usar um servidor próprio, basta definir as variáveis de ambiente
 * (veja .env.example) — nenhum componente precisa mudar.
 */
export const DATA_SOURCES = {
  /** Classificação, calendário e resultados (formato Ergast). */
  jolpica: process.env.F1_JOLPICA_BASE ?? "https://api.jolpi.ca/ergast/f1",
  /** Pilotos, cores das equipes, clima, pneus e voltas. */
  openf1: process.env.F1_OPENF1_BASE ?? "https://api.openf1.org/v1",
  /** Traçado dos circuitos e curvas. */
  multiviewer: process.env.F1_MULTIVIEWER_BASE ?? "https://api.multiviewer.app/api/v1",
};

/** Por quanto tempo (s) as respostas ficam em cache no servidor. */
export const REVALIDATE_SECONDS = Number(process.env.F1_REVALIDATE_SECONDS ?? 1800);
