/**
 * Vídeos de corrida do canal oficial da F1 no YouTube, usados no fundo da
 * landing e nos destaques. Podem ser trocados por NEXT_PUBLIC_HERO_VIDEOS
 * (IDs separados por vírgula) ou por um MP4 próprio em NEXT_PUBLIC_HERO_VIDEO_MP4.
 */
export interface Highlight {
  id: string;
  title: string;
  subtitle: string;
  /** Segundo em que o vídeo de fundo começa, para pular a vinheta. */
  start?: number;
}

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  { id: "IiaVcT3SZv0", title: "Todos os GPs de 2025", subtitle: "Resumo da temporada", start: 30 },
  { id: "wR8SQGO2LWI", title: "GP de Abu Dhabi 2025", subtitle: "Yas Marina", start: 20 },
  { id: "j2lGFm1i91s", title: "Melhores momentos", subtitle: "Extended highlights", start: 20 },
];

export function highlights(): Highlight[] {
  const ids = process.env.NEXT_PUBLIC_HERO_VIDEOS?.split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids?.length) return DEFAULT_HIGHLIGHTS;
  return ids.map((id, i) => DEFAULT_HIGHLIGHTS.find((h) => h.id === id) ?? { id, title: `Destaque ${i + 1}`, subtitle: "YouTube" });
}

export const thumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
