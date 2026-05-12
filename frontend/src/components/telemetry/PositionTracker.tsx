'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PositionData } from '@/types';

const TOP_TEAMS: Record<string, string> = {};

export default function PositionTracker({ positions, currentLap }: { positions: PositionData[]; currentLap: number }) {
  if (!positions.length) return <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>;

  // Get unique drivers & their colors
  const driverMap = new Map<string, { name: string; color: string; team: string }>();
  positions.forEach(p => {
    if (!driverMap.has(p.driver_code)) {
      driverMap.set(p.driver_code, { name: p.driver, color: p.team_color, team: p.team });
    }
  });

  // Get top 10 at current lap
  const currentPositions = positions
    .filter(p => p.lap === currentLap)
    .sort((a, b) => a.position - b.position)
    .slice(0, 10);
  const topDrivers = new Set(currentPositions.map(p => p.driver_code));

  // Build per-lap data
  const maxLap = Math.min(currentLap, Math.max(...positions.map(p => p.lap)));
  const lapNumbers = Array.from({ length: maxLap }, (_, i) => i + 1);

  const chartData = lapNumbers.map(lap => {
    const entry: Record<string, number | string> = { lap };
    positions.filter(p => p.lap === lap && topDrivers.has(p.driver_code))
      .forEach(p => { entry[p.driver_code] = p.position; });
    return entry;
  });

  const driverCodes = Array.from(topDrivers);

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="lap" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <YAxis reversed domain={[1, 10]} stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={v => `P${v}`} />
          <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }}
            labelFormatter={l => `Lap ${l}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [`P${value}`, name]} />
          {driverCodes.map(code => {
            const info = driverMap.get(code);
            return (
              <Line key={code} type="stepAfter" dataKey={code} stroke={info?.color || '#fff'}
                strokeWidth={2} dot={false} animationDuration={2000} connectNulls />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, justifyContent: 'center' }}>
        {currentPositions.map(p => (
          <div key={p.driver_code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <div style={{ width: 12, height: 3, background: p.team_color, borderRadius: 2 }} />
            <span style={{ color: 'var(--text-secondary)' }}>P{p.position}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.driver_code}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
