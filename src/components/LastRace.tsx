import type { Race } from '../types';
import { teamColor } from '../teams';

export function LastRace({ race }: { race?: Race }) {
  if (!race?.Results) return <div className="placeholder">Nenhuma corrida disputada ainda.</div>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Piloto</th>
          <th className="num hide-sm">Grid</th>
          <th className="num">Tempo / status</th>
          <th className="num">Pts</th>
        </tr>
      </thead>
      <tbody>
        {race.Results.map((r) => {
          const gained = Number(r.grid) > 0 ? Number(r.grid) - Number(r.position) : 0;
          return (
            <tr key={r.Driver.driverId}>
              <td className="pos">{r.positionText}</td>
              <td>
                <span className="swatch" style={{ background: teamColor(r.Constructor.constructorId) }} />
                {r.Driver.familyName}
                {r.FastestLap?.rank === '1' && <span className="badge" title={`Volta mais rápida: ${r.FastestLap.Time.time}`}>VMR</span>}
              </td>
              <td className="num hide-sm">
                {r.grid === '0' ? 'Box' : r.grid}
                {gained !== 0 && <span className={gained > 0 ? 'up' : 'down'}> {gained > 0 ? `▲${gained}` : `▼${-gained}`}</span>}
              </td>
              <td className="num muted">{r.Time?.time ?? r.status}</td>
              <td className="num">{r.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
