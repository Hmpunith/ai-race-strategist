'use client';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';
import type { DriverStats } from '@/types';

export default function DriverComparison({ stats }: { stats: DriverStats[] }) {
  if (stats.length < 2) return <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Select two drivers to compare</div>;

  const [d1, d2] = stats;

  // Normalize stats for radar
  const maxPace = Math.max(d1.avg_lap_time, d2.avg_lap_time);
  const radarData = [
    { metric: 'Pace', [d1.driver_code]: Math.round((1 - (d1.avg_lap_time - 74) / 3) * 100), [d2.driver_code]: Math.round((1 - (d2.avg_lap_time - 74) / 3) * 100) },
    { metric: 'Consistency', [d1.driver_code]: Math.round((1 - d1.consistency / 0.5) * 100), [d2.driver_code]: Math.round((1 - d2.consistency / 0.5) * 100) },
    { metric: 'Tire Mgmt', [d1.driver_code]: Math.round(d1.tire_management), [d2.driver_code]: Math.round(d2.tire_management) },
    { metric: 'Sector 1', [d1.driver_code]: Math.round((1 - (d1.sector1_avg - 22) / 3) * 100), [d2.driver_code]: Math.round((1 - (d2.sector1_avg - 22) / 3) * 100) },
    { metric: 'Sector 2', [d1.driver_code]: Math.round((1 - (d1.sector2_avg - 28) / 3) * 100), [d2.driver_code]: Math.round((1 - (d2.sector2_avg - 28) / 3) * 100) },
    { metric: 'Sector 3', [d1.driver_code]: Math.round((1 - (d1.sector3_avg - 22) / 3) * 100), [d2.driver_code]: Math.round((1 - (d2.sector3_avg - 22) / 3) * 100) },
  ];

  const StatRow = ({ label, v1, v2, unit, lower }: { label: string; v1: number; v2: number; unit: string; lower?: boolean }) => {
    const better = lower ? (v1 < v2 ? 1 : v1 > v2 ? 2 : 0) : (v1 > v2 ? 1 : v1 < v2 ? 2 : 0);
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ flex: 1, textAlign: 'right', paddingRight: 16 }}>
          <span style={{ fontSize: 14, fontWeight: better === 1 ? 700 : 400, color: better === 1 ? 'var(--neon-green)' : 'var(--text-secondary)' }}>
            {typeof v1 === 'number' ? v1.toFixed(3) : v1}{unit}
          </span>
        </div>
        <div style={{ width: 120, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ flex: 1, paddingLeft: 16 }}>
          <span style={{ fontSize: 14, fontWeight: better === 2 ? 700 : 400, color: better === 2 ? 'var(--neon-green)' : 'var(--text-secondary)' }}>
            {typeof v2 === 'number' ? v2.toFixed(3) : v2}{unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Driver Headers */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
        {[d1, d2].map(d => (
          <div key={d.driver_code} className="glass-card" style={{ padding: 20, textAlign: 'center', flex: 1, maxWidth: 280, borderTop: `3px solid ${d.team_color}` }}>
            <div className="metric-value" style={{ fontSize: 28, color: d.team_color }}>{d.driver_code}</div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', marginTop: 4 }}>{d.driver}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.team}</div>
            <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>P{d.current_position}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Radar */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>PERFORMANCE RADAR</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Radar name={d1.driver_code} dataKey={d1.driver_code} stroke={d1.team_color} fill={d1.team_color} fillOpacity={0.15} strokeWidth={2} />
              <Radar name={d2.driver_code} dataKey={d2.driver_code} stroke={d2.team_color} fill={d2.team_color} fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Table */}
        <div className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>HEAD TO HEAD</h3>
          <StatRow label="Avg Lap" v1={d1.avg_lap_time} v2={d2.avg_lap_time} unit="s" lower />
          <StatRow label="Best Lap" v1={d1.best_lap_time} v2={d2.best_lap_time} unit="s" lower />
          <StatRow label="Consistency" v1={d1.consistency} v2={d2.consistency} unit="σ" lower />
          <StatRow label="Tire Mgmt" v1={d1.tire_management} v2={d2.tire_management} unit="%" />
          <StatRow label="Pos Gained" v1={d1.positions_gained} v2={d2.positions_gained} unit="" />
        </div>
      </div>
    </div>
  );
}
