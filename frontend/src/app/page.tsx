'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import LapTimeChart from '@/components/telemetry/LapTimeChart';
import TireWearChart from '@/components/telemetry/TireWearChart';
import PositionTracker from '@/components/telemetry/PositionTracker';
import StrategyCard from '@/components/strategy/StrategyCard';
import RiskRadar from '@/components/strategy/RiskRadar';
import AIChat from '@/components/ai/AIChat';
import PodiumPrediction from '@/components/prediction/PodiumPrediction';
import DriverComparison from '@/components/comparison/DriverComparison';
import type { Driver, LapData, TireData, PositionData, RiskAssessment, StrategyRecommendation, PodiumPrediction as PodiumType, DriverStats } from '@/types';

// Clean SVG icons for sidebar nav
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  strategy: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  predictions: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  comparison: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  ai: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/></svg>,
} as const;

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'strategy', label: 'Strategy', icon: Icons.strategy },
  { id: 'predictions', label: 'Predictions', icon: Icons.predictions },
  { id: 'comparison', label: 'Compare', icon: Icons.comparison },
  { id: 'ai', label: 'AI Chat', icon: Icons.ai },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('VER');
  const [currentLap, setCurrentLap] = useState(40);
  const [displayLap, setDisplayLap] = useState(40);
  const lapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [laps, setLaps] = useState<LapData[]>([]);
  const [tires, setTires] = useState<TireData[]>([]);
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [strategy, setStrategy] = useState<StrategyRecommendation | null>(null);
  const [podium, setPodium] = useState<PodiumType[]>([]);
  const [comparison, setComparison] = useState<DriverStats[]>([]);
  const [driver2, setDriver2] = useState('LEC');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLapChange = (value: number) => {
    setDisplayLap(value);
    if (lapTimerRef.current) clearTimeout(lapTimerRef.current);
    lapTimerRef.current = setTimeout(() => setCurrentLap(value), 300);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [driversData, lapsData, tiresData, posData] = await Promise.all([
        api.getDrivers() as Promise<Driver[]>,
        api.getLaps(selectedDriver) as Promise<LapData[]>,
        api.getTires(selectedDriver) as Promise<TireData[]>,
        api.getPositions() as Promise<PositionData[]>,
      ]);
      setDrivers(driversData);
      setLaps(lapsData);
      setTires(tiresData);
      setPositions(posData);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedDriver]);

  const loadStrategy = useCallback(async () => {
    try {
      const [riskData, stratData] = await Promise.all([
        api.getRisk(selectedDriver, currentLap) as Promise<RiskAssessment>,
        api.getRecommendation(selectedDriver, currentLap) as Promise<StrategyRecommendation>,
      ]);
      setRisk(riskData);
      setStrategy(stratData);
    } catch (e) { console.error(e); }
  }, [selectedDriver, currentLap]);

  const loadPredictions = useCallback(async () => {
    try {
      const data = await api.getPodium(currentLap) as PodiumType[];
      setPodium(data);
    } catch (e) { console.error(e); }
  }, [currentLap]);

  const loadComparison = useCallback(async () => {
    try {
      const data = await api.compareDrivers(selectedDriver, driver2) as DriverStats[];
      setComparison(data);
    } catch (e) { console.error(e); }
  }, [selectedDriver, driver2]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab === 'strategy') loadStrategy();
    if (activeTab === 'predictions') loadPredictions();
    if (activeTab === 'comparison') loadComparison();
  }, [activeTab, loadStrategy, loadPredictions, loadComparison]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 16px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'none', border: 'none', color: 'var(--text-primary)',
            cursor: 'pointer', fontSize: 20,
          }}>☰</button>
          {sidebarOpen && (
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, var(--racing-red), var(--ai-purple))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}>AI RACE STRATEGIST</h1>
          )}
        </div>
        <nav style={{ flex: 1 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              background: activeTab === tab.id ? 'rgba(225, 6, 0, 0.1)' : 'transparent',
              border: 'none', borderLeft: activeTab === tab.id ? '3px solid var(--racing-red)' : '3px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              textAlign: 'left',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="granite-badge" style={{ width: '100%', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> IBM Granite
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          padding: '16px 24px', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600 }}>
                Circuit de Monaco
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>2024 Monaco Grand Prix • Race</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Lap Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>LAP</span>
              <span className="metric-value" style={{ color: 'var(--racing-red)', fontSize: 20 }}>{displayLap}</span>
              <input type="range" min={1} max={78} value={displayLap}
                onChange={e => handleLapChange(Number(e.target.value))}
                style={{ width: 120, accentColor: 'var(--racing-red)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>/78</span>
            </div>
            {/* Driver Select */}
            <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 8,
                fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer',
              }}>
              {drivers.map(d => (
                <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {loading && activeTab === 'dashboard' ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="metric-value" style={{ fontSize: 24, color: 'var(--racing-red)', marginBottom: 8 }}>
                  Loading Telemetry...
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Analyzing race data</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                  <div className="dashboard-grid">
                    <div className="glass-card" style={{ padding: 20 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        LAP TIMES
                      </h3>
                      <LapTimeChart laps={laps} />
                    </div>
                    <div className="glass-card" style={{ padding: 20 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        TIRE PERFORMANCE
                      </h3>
                      <TireWearChart tires={tires} />
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <div className="glass-card" style={{ padding: 20 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        POSITION TRACKER
                      </h3>
                      <PositionTracker positions={positions} currentLap={currentLap} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="animate-fade-in">
                  <div className="dashboard-grid">
                    <StrategyCard strategy={strategy} onRefresh={() => loadStrategy()} />
                    <RiskRadar risk={risk} />
                  </div>
                </div>
              )}

              {activeTab === 'predictions' && (
                <div className="animate-fade-in">
                  <PodiumPrediction predictions={podium} />
                </div>
              )}

              {activeTab === 'comparison' && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Compare with:</span>
                    <select value={driver2} onChange={e => setDriver2(e.target.value)}
                      style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 8,
                        fontSize: 13, cursor: 'pointer',
                      }}>
                      {drivers.filter(d => d.code !== selectedDriver).map(d => (
                        <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                  <DriverComparison stats={comparison} />
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="animate-fade-in">
                  <AIChat currentLap={currentLap} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
