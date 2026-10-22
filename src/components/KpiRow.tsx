import type { ConstructorStanding, DriverStanding, Race } from '../types';
import { teamColor } from '../teams';

interface Props {
  drivers?: DriverStanding[];
  constructors?: ConstructorStanding[];
  schedule?: Race[];
}

function raceDate(race: Race): Date {
  return new Date(`${race.date}T${race.time ?? '00:00:00Z'}`);
}

export function KpiRow({ drivers, constructors, schedule }: Props) {
  const leader = drivers?.[0];
  const second = drivers?.[1];
  const team = constructors?.[0];
  const now = new Date();
  const done = schedule?.filter((r) => raceDate(r) < now).length ?? 0;
  const next = schedule?.find((r) => raceDate(r) >= now);
  const daysToNext = next ? Math.ceil((raceDate(next).getTime() - now.getTime()) / 86_400_000) : undefined;

  return (
    <div className="kpis">
      <div className="kpi" style={{ borderColor: teamColor(leader?.Constructors[0]?.constructorId) }}>
        <span className="kpi-label">Líder do campeonato</span>
        <strong className="kpi-value">{leader ? `${leader.Driver.givenName} ${leader.Driver.familyName}` : '—'}</strong>
        <span className="muted">
          {leader ? `${leader.points} pts` : ''}
          {leader && second ? ` · +${Number(leader.points) - Number(second.points)} sobre o 2º` : ''}
        </span>
      </div>
      <div className="kpi" style={{ borderColor: teamColor(team?.Constructor.constructorId) }}>
        <span className="kpi-label">Líder de construtores</span>
        <strong className="kpi-value">{team?.Constructor.name ?? '—'}</strong>
        <span className="muted">{team ? `${team.points} pts · ${team.wins} vitórias` : ''}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">Etapas disputadas</span>
        <strong className="kpi-value">
          {schedule ? `${done} / ${schedule.length}` : '—'}
        </strong>
        <div className="progress">
          <div style={{ width: schedule?.length ? `${(done / schedule.length) * 100}%` : 0 }} />
        </div>
      </div>
      <div className="kpi">
        <span className="kpi-label">Próxima corrida</span>
        <strong className="kpi-value">{next?.raceName ?? 'Temporada encerrada'}</strong>
        <span className="muted">
          {next
            ? `${raceDate(next).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${
                daysToNext === 0 ? 'hoje' : `em ${daysToNext} dia${daysToNext === 1 ? '' : 's'}`
              }`
            : ''}
        </span>
      </div>
    </div>
  );
}
