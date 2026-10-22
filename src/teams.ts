// Cores aproximadas das equipes, usadas em barras e linhas.
const TEAM_COLORS: Record<string, string> = {
  red_bull: '#3671C6',
  ferrari: '#E8002D',
  mercedes: '#27F4D2',
  mclaren: '#FF8000',
  aston_martin: '#229971',
  alpine: '#FF87BC',
  williams: '#64C4FF',
  rb: '#6692FF',
  alphatauri: '#5E8FAA',
  sauber: '#52E252',
  alfa: '#C92D4B',
  haas: '#B6BABD',
  audi: '#BB0A30',
  cadillac: '#C0A062',
  racing_point: '#F596C8',
  renault: '#FFF500',
  toro_rosso: '#469BFF',
};

export function teamColor(constructorId?: string): string {
  return (constructorId && TEAM_COLORS[constructorId]) || '#8a8f98';
}
