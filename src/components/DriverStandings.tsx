import type { DriverStanding } from '../types';
import { teamColor } from '../teams';

export function DriverStandings({ standings }: { standings: DriverStanding[] }) {
  const max = Number(standings[0]?.points ?? 1) || 1;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Piloto</th>
          <th className="hide-sm">Equipe</th>
          <th className="num">Vit.</th>
          <th className="num">Pontos</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s) => {
          const team = s.Constructors[s.Constructors.length - 1];
          return (
            <tr key={s.Driver.driverId}>
              <td className="pos">{s.positionText}</td>
              <td>
                <span className="swatch" style={{ background: teamColor(team?.constructorId) }} />
                {s.Driver.givenName} <strong>{s.Driver.familyName}</strong>
              </td>
              <td className="hide-sm muted">{team?.name}</td>
              <td className="num">{s.wins}</td>
              <td className="num points">
                <div className="bar" style={{ width: `${(Number(s.points) / max) * 100}%`, background: teamColor(team?.constructorId) }} />
                <span>{s.points}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
