'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/types';

const QUICK_QUESTIONS = [
  'Should we pit now?',
  'Explain the current tire strategy',
  'Is an undercut viable?',
  'What are the key risks?',
  'Predict the top 3 finish',
];

export default function AIChat({ currentLap }: { currentLap: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: 'I\'m your AI Race Strategist powered by **IBM Granite**. I\'m analyzing the 2024 Monaco GP telemetry. Ask me about pit strategy, tire management, or race predictions.',
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.chat(msg, currentLap) as { message: string };
      setMessages(prev => [...prev, {
        role: 'assistant', content: response.message, timestamp: new Date().toISOString(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant', content: 'Connection to IBM Granite interrupted. Please try again.', timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', maxHeight: 700 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--text-primary)' }}>AI RACE ENGINEER</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lap {currentLap}/78 • Monaco GP</p>
        </div>
        <div className="granite-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> IBM Granite</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            maxWidth: '80%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            padding: '12px 16px', borderRadius: 12, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            background: msg.role === 'user' ? 'rgba(225, 6, 0, 0.15)' : 'rgba(168, 85, 247, 0.08)',
            border: `1px solid ${msg.role === 'user' ? 'rgba(225, 6, 0, 0.2)' : 'rgba(168, 85, 247, 0.15)'}`,
            color: 'var(--text-primary)',
          }}>
            {msg.role === 'assistant' && (
              <div style={{ fontSize: 10, color: 'var(--ai-purple)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg> AI Strategist</div>
            )}
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: 12, background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
            <div style={{ fontSize: 10, color: 'var(--ai-purple)', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg> AI Strategist</div>
            <span className="typing-cursor" style={{ color: 'var(--text-muted)' }}>Analyzing telemetry</span>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div style={{ padding: '8px 20px', display: 'flex', gap: 8, overflowX: 'auto', borderTop: '1px solid var(--border-subtle)' }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q)} disabled={loading}
            style={{
              padding: '6px 12px', borderRadius: 16, fontSize: 11, whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
            }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask your race engineer..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13,
            fontFamily: 'var(--font-body)', outline: 'none',
          }} />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: 'var(--racing-red)', color: '#fff', fontWeight: 600, cursor: 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}>
          Send
        </button>
      </div>
    </div>
  );
}
