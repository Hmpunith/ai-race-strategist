// API client for AI Race Strategist backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// Telemetry
export const api = {
  getSession: () => fetchAPI('/api/telemetry/session'),
  getDrivers: () => fetchAPI('/api/telemetry/drivers'),
  getLaps: (driver: string) => fetchAPI(`/api/telemetry/laps?driver=${driver}`),
  getTires: (driver: string) => fetchAPI(`/api/telemetry/tires?driver=${driver}`),
  getFuel: (driver: string) => fetchAPI(`/api/telemetry/fuel?driver=${driver}`),
  getPositions: (driver?: string) =>
    fetchAPI(`/api/telemetry/positions${driver ? `?driver=${driver}` : ''}`),
  getStandings: (lap?: number) =>
    fetchAPI(`/api/telemetry/standings${lap ? `?lap=${lap}` : ''}`),

  // Strategy
  getPitWindow: (driver: string, lap: number) =>
    fetchAPI(`/api/strategy/pit-window?driver=${driver}&lap=${lap}`),
  getRisk: (driver: string, lap: number) =>
    fetchAPI(`/api/strategy/risk?driver=${driver}&lap=${lap}`),
  getRecommendation: (driver: string, lap: number) =>
    fetchAPI(`/api/strategy/recommend?driver=${driver}&lap=${lap}`, { method: 'POST' }),

  // Prediction
  getPredictions: (lap?: number) =>
    fetchAPI(`/api/prediction/positions${lap ? `?lap=${lap}` : ''}`),
  getPodium: (lap?: number) =>
    fetchAPI(`/api/prediction/podium${lap ? `?lap=${lap}` : ''}`),

  // Comparison
  compareDrivers: (d1: string, d2: string) =>
    fetchAPI(`/api/comparison/drivers?driver1=${d1}&driver2=${d2}`),

  // AI Chat
  chat: (message: string, lap: number = 40) =>
    fetchAPI('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, lap }),
    }),
};
