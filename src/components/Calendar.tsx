import type { Race } from '../types';

export function Calendar({ races }: { races: Race[] }) {
  const now = new Date();
  const nextRound = races.find((r) => new Date(`${r.date}T${r.time ?? '00:00:00Z'}`) >= now)?.round;
  return (
    <ol className="calendar">
      {races.map((r) => {
        const date = new Date(`${r.date}T${r.time ?? '00:00:00Z'}`);
        const status = r.round === nextRound ? 'next' : date < now ? 'done' : 'future';
        return (
          <li key={r.round} className={status}>
            <span className="round">{r.round}</span>
            <div>
              <strong>{r.raceName}</strong>
              <span className="muted">
                {r.Circuit.Location.locality}, {r.Circuit.Location.country}
                {r.Sprint && ' · Sprint'}
              </span>
            </div>
            <time className="muted">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</time>
          </li>
        );
      })}
    </ol>
  );
}
