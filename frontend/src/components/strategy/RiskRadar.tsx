'use client';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { RiskAssessment } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  safe: 'var(--neon-green)', caution: 'var(--amber-warning)', danger: 'var(--racing-red)',
};

export default function RiskRadar({ risk }: { risk: RiskAssessment | null }) {
  if (!risk) return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading risk analysis...</p>
    </div>
  );

  const statusColor = STATUS_COLORS[risk.status] || 'var(--text-primary)';
  const chartData = risk.factors.map(f => ({ subject: f.name, value: f.value, fullMark: 100 }));

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>RISK ASSESSMENT</h3>

      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div className="metric-value" style={{ fontSize: 36, color: statusColor }}>{risk.overall_risk.toFixed(0)}</div>
        <span style={{
          padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          background: `${statusColor}20`, color: statusColor,
        }}>{risk.status}</span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Risk" dataKey="value" stroke={statusColor} fill={statusColor} fillOpacity={0.15} strokeWidth={2} animationDuration={1500} />
        </RadarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {risk.factors.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`status-dot ${f.status}`} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.name}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[f.status] }}>{f.value.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
