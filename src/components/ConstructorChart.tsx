import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ConstructorStanding } from '../types';
import { teamColor } from '../teams';

export function ConstructorChart({ standings }: { standings: ConstructorStanding[] }) {
  const data = standings.map((s) => ({
    id: s.Constructor.constructorId,
    name: s.Constructor.name,
    points: Number(s.points),
    wins: Number(s.wins),
  }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: 'var(--hover)' }}
          contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}
          formatter={(v: number) => [`${v} pts`, 'Pontos']}
        />
        <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((d) => (
            <Cell key={d.id} fill={teamColor(d.id)} />
          ))}
          <LabelList dataKey="points" position="right" fill="var(--text)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
