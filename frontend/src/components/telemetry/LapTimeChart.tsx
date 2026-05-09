'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { LapData } from '@/types';

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: '#ff3333', MEDIUM: '#ffd700', HARD: '#ffffff',
};

export default function LapTimeChart({ laps }: { laps: LapData[] }) {
  if (!laps.length) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>;

  const raceLaps = laps.filter(l => !l.is_pit_lap);
  const pitLaps = laps.filter(l => l.is_pit_lap).map(l => l.lap);
  const minTime = Math.min(...raceLaps.map(l => l.time));
  const maxTime = Math.max(...raceLaps.map(l => l.time));

  const data = laps.map(l => ({
    lap: l.lap,
    time: l.is_pit_lap ? null : Number(l.time.toFixed(3)),
    compound: l.compound,
    fill: COMPOUND_COLORS[l.compound] || '#fff',
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
        <YAxis domain={[Math.floor(minTime - 0.5), Math.ceil(maxTime + 0.5)]} stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={v => `${v}s`} />
        <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }}
          formatter={(value: number) => [`${value?.toFixed(3)}s`, 'Lap Time']}
          labelFormatter={l => `Lap ${l}`} />
        {pitLaps.map(lap => (
          <ReferenceLine key={lap} x={lap} stroke="var(--racing-red)" strokeDasharray="4 4" strokeOpacity={0.5} />
        ))}
        <Line type="monotone" dataKey="time" stroke="var(--circuit-blue)" strokeWidth={2} dot={false} connectNulls={false} animationDuration={1500} />
      </LineChart>
    </ResponsiveContainer>
  );
}
