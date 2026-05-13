'use client';
import type { StrategyRecommendation } from '@/types';

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

const URGENCY_COLORS: Record<string, string> = {
  low: 'var(--neon-green)', medium: 'var(--circuit-blue)',
  high: 'var(--amber-warning)', critical: 'var(--racing-red)',
};

export default function StrategyCard({ strategy, onRefresh }: { strategy: StrategyRecommendation | null; onRefresh: () => void }) {
  if (!strategy) return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>AI STRATEGY</h3>
      <button onClick={onRefresh} style={{ padding: '10px 20px', background: 'var(--racing-red)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
        Generate Strategy
      </button>
    </div>
  );

  const urgencyColor = URGENCY_COLORS[strategy.urgency] || 'var(--text-primary)';

  return (
    <div className="glass-card" style={{ padding: 24, borderLeft: `3px solid ${urgencyColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text-secondary)' }}>AI STRATEGY RECOMMENDATION</h3>
        <div className="granite-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> {strategy.powered_by}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span className="metric-value" style={{ fontSize: 24, color: urgencyColor }}>{strategy.action}</span>
        <span style={{
          padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          background: `${urgencyColor}20`, color: urgencyColor, letterSpacing: '0.05em',
        }}>{strategy.urgency}</span>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>{strategy.summary}</p>

      {/* Confidence Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>CONFIDENCE</span>
          <span style={{ fontSize: 11, color: urgencyColor, fontWeight: 700 }}>{(strategy.confidence * 100).toFixed(0)}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${strategy.confidence * 100}%`, background: urgencyColor, borderRadius: 2, transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* Key Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 16 }}>
        {strategy.factors.map((f, i) => (
          <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{f.name}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: f.impact === 'high' ? 'var(--amber-warning)' : 'var(--text-primary)' }}>{f.value}</div>
          </div>
        ))}
      </div>

      {/* AI Explanation */}
      <details style={{ cursor: 'pointer' }}>
        <summary style={{ fontSize: 12, color: 'var(--ai-purple)', fontWeight: 600, marginBottom: 8 }}>
          View AI Explanation
        </summary>
        <div style={{ padding: 16, background: 'rgba(168, 85, 247, 0.05)', borderRadius: 8, border: '1px solid rgba(168, 85, 247, 0.15)', fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(strategy.explanation) }} />
        </div>
      </details>

      <button onClick={onRefresh} style={{ marginTop: 12, padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}>
        ↻ Refresh Analysis
      </button>
    </div>
  );
}
