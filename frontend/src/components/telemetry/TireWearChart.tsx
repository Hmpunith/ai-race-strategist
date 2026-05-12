'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TireData } from '@/types';

export default function TireWearChart({ tires }: { tires: TireData[] }) {
  if (!tires.length) return <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>;

  const data = tires.map(t => ({
    lap: t.lap,
    wear: Number(t.wear_pct.toFixed(1)),
    compound: t.compound,
    cliff: t.cliff_warning,
    delta: Number((t.performance_delta * 1000).toFixed(0)),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <defs>
          <linearGradient id="tireGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--neon-green)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--racing-red)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={v => `${v}%`} />
        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => {
            if (name === 'wear') return [`${value}%`, 'Tire Life'];
            return [value, name];
          }}
          labelFormatter={l => `Lap ${l}`} />
        <Area type="monotone" dataKey="wear" stroke="var(--neon-green)" fill="url(#tireGrad)" strokeWidth={2} animationDuration={1500} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
