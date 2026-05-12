'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PodiumPrediction as PodiumType } from '@/types';

export default function PodiumPrediction({ predictions }: { predictions: PodiumType[] }) {
  if (!predictions.length) return <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading predictions...</div>;

  const top3 = predictions.slice(0, 3);
  const chartData = predictions.slice(0, 8).map(p => ({
    name: p.driver_code,
    podium: Math.round(p.podium_probability * 100),
    p1: Math.round(p.p1_probability * 100),
    color: p.team_color,
  }));

  return (
    <div>
      {/* Podium Display */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 32 }}>
        {[top3[1], top3[0], top3[2]].filter(Boolean).map((p, i) => {
          const heights = [140, 180, 110];
          const labels = ['2ND', '1ST', '3RD'];
          const trophies = ['II', 'I', 'III'];
          return (
            <div key={p.driver_code} className="glass-card animate-slide-up" style={{
              width: 180, textAlign: 'center', padding: '20px 16px',
              borderBottom: `3px solid ${p.team_color}`,
              animationDelay: `${i * 0.15}s`, opacity: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              minHeight: heights[i],
            }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>{trophies[i]}</div>
              <div className="metric-value" style={{ fontSize: 20, color: p.team_color, marginBottom: 4 }}>{p.driver_code}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.driver}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.team}</div>
              <div className="metric-value" style={{ fontSize: 16, color: 'var(--neon-green)', marginTop: 8 }}>
                {(p.podium_probability * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{labels[i]}</div>
            </div>
          );
        })}
      </div>

      {/* Probability Chart */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          PODIUM PROBABILITY
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v}%`, 'Podium Chance']} />
            <Bar dataKey="podium" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
