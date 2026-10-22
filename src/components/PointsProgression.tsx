import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Race } from '../types';
import { teamColor } from '../teams';

interface Props {
  races: Race[];
  sprints: Race[];
  top: number;
}

interface DriverLine {
  id: string;
  label: string;
  color: string;
  dashed: boolean;
}

export function PointsProgression({ races, sprints, top }: Props) {
  const sprintByRound = new Map(sprints.map((s) => [s.round, s.SprintResults ?? []]));
  const sorted = [...races].sort((a, b) => Number(a.round) - Number(b.round));

  const totals = new Map<string, number>();
  const teamOf = new Map<string, string>();
  const nameOf = new Map<string, string>();
  const rows = sorted.map((race) => {
    const results = [...(race.Results ?? []), ...(sprintByRound.get(race.round) ?? [])];
    for (const r of results) {
      const id = r.Driver.driverId;
      totals.set(id, (totals.get(id) ?? 0) + Number(r.points));
      teamOf.set(id, r.Constructor.constructorId);
      nameOf.set(id, r.Driver.code ?? r.Driver.familyName);
    }
    return { round: `R${race.round}`, race: race.raceName, ...Object.fromEntries(totals) };
  });

  const leaders = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, top);
  const seenTeams = new Set<string>();
  const lines: DriverLine[] = leaders.map(([id]) => {
    const team = teamOf.get(id)!;
    const dashed = seenTeams.has(team);
    seenTeams.add(team);
    return { id, label: nameOf.get(id)!, color: teamColor(team), dashed };
  });

  if (!rows.length) return <div className="placeholder">Nenhuma corrida disputada ainda.</div>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={rows} margin={{ left: -12, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="round" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.race ?? ''}
          itemSorter={(item) => -Number(item.value)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l) => (
          <Line
            key={l.id}
            dataKey={l.id}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            strokeDasharray={l.dashed ? '5 4' : undefined}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
