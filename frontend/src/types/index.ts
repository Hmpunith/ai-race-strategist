// TypeScript interfaces for all data models

export interface Driver {
  name: string;
  code: string;
  team: string;
  color: string;
  base_pace?: number;
  consistency?: number;
}

export interface LapData {
  lap: number;
  time: number;
  sector1: number;
  sector2: number;
  sector3: number;
  compound: string;
  tire_age: number;
  position: number;
  gap_to_leader: number;
  is_pit_lap: boolean;
}

export interface TireData {
  lap: number;
  compound: string;
  wear_pct: number;
  performance_delta: number;
  stint_lap: number;
  cliff_warning: boolean;
}

export interface FuelData {
  lap: number;
  fuel_remaining_kg: number;
  fuel_remaining_pct: number;
  consumption_rate: number;
  fuel_adjusted_time: number;
}

export interface PositionData {
  lap: number;
  driver: string;
  driver_code: string;
  position: number;
  team: string;
  team_color: string;
  gap_to_leader: number;
}

export interface PitWindow {
  optimal_lap_start: number;
  optimal_lap_end: number;
  recommended_lap: number;
  recommended_compound: string;
  time_loss: number;
  undercut_viable: boolean;
  overcut_viable: boolean;
  current_wear: number;
  current_compound: string;
  confidence: number;
}

export interface StrategyRecommendation {
  action: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  explanation: string;
  confidence: number;
  factors: { name: string; value: string; impact: string }[];
  powered_by: string;
}

export interface RiskFactor {
  name: string;
  value: number;
  status: 'safe' | 'caution' | 'danger';
}

export interface RiskAssessment {
  overall_risk: number;
  status: string;
  factors: RiskFactor[];
}

export interface PositionPrediction {
  position: number;
  driver: string;
  driver_code: string;
  team: string;
  team_color: string;
  probability: number;
  predicted_gap: number;
}

export interface PodiumPrediction {
  driver: string;
  driver_code: string;
  team: string;
  team_color: string;
  p1_probability: number;
  p2_probability: number;
  p3_probability: number;
  podium_probability: number;
}

export interface DriverStats {
  driver: string;
  driver_code: string;
  team: string;
  team_color: string;
  avg_lap_time: number;
  best_lap_time: number;
  consistency: number;
  tire_management: number;
  sector1_avg: number;
  sector2_avg: number;
  sector3_avg: number;
  positions_gained: number;
  pit_stops: number;
  current_position: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SessionInfo {
  session_key: number;
  session_name: string;
  circuit: string;
  country: string;
  date: string;
  total_laps: number;
  drivers: Driver[];
}
