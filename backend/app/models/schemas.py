"""Pydantic models for API request/response schemas."""

from pydantic import BaseModel
from typing import Optional


# --- Telemetry ---
class LapData(BaseModel):
    lap: int
    time: float
    sector1: float
    sector2: float
    sector3: float
    compound: str
    tire_age: int
    position: int
    gap_to_leader: float
    is_pit_lap: bool = False


class TireData(BaseModel):
    lap: int
    compound: str
    wear_pct: float
    performance_delta: float
    stint_lap: int
    cliff_warning: bool = False


class FuelData(BaseModel):
    lap: int
    fuel_remaining_kg: float
    fuel_remaining_pct: float
    consumption_rate: float
    fuel_adjusted_time: float


class SectorData(BaseModel):
    driver: str
    sector: int
    time: float
    is_personal_best: bool = False
    is_session_best: bool = False
    delta_to_best: float = 0.0


class PositionData(BaseModel):
    lap: int
    driver: str
    driver_code: str
    position: int
    team: str
    team_color: str


# --- Strategy ---
class PitWindow(BaseModel):
    optimal_lap_start: int
    optimal_lap_end: int
    recommended_lap: int
    recommended_compound: str
    time_loss: float
    undercut_viable: bool
    overcut_viable: bool
    confidence: float


class StrategyRecommendation(BaseModel):
    action: str
    urgency: str  # low, medium, high, critical
    summary: str
    explanation: str
    confidence: float
    factors: list[dict]
    powered_by: str = "IBM Granite"


class RiskFactor(BaseModel):
    name: str
    value: float  # 0-100
    status: str  # safe, caution, danger


class RiskAssessment(BaseModel):
    overall_risk: float
    status: str
    factors: list[RiskFactor]


# --- Prediction ---
class PositionPrediction(BaseModel):
    position: int
    driver: str
    driver_code: str
    team: str
    team_color: str
    probability: float
    predicted_gap: float


class PodiumPrediction(BaseModel):
    driver: str
    driver_code: str
    team: str
    team_color: str
    p1_probability: float
    p2_probability: float
    p3_probability: float
    podium_probability: float


# --- Comparison ---
class DriverStats(BaseModel):
    driver: str
    driver_code: str
    team: str
    team_color: str
    avg_lap_time: float
    best_lap_time: float
    consistency: float  # std deviation
    tire_management: float  # 0-100 score
    sector1_avg: float
    sector2_avg: float
    sector3_avg: float
    positions_gained: int
    pit_stops: int
    current_position: int


# --- AI Chat ---
class ChatMessage(BaseModel):
    role: str  # user, assistant
    content: str
    timestamp: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    message: str
    powered_by: str = "IBM Granite"
    confidence: Optional[float] = None


# --- Session ---
class RaceSession(BaseModel):
    session_key: int
    session_name: str
    circuit: str
    country: str
    date: str
    total_laps: int
    drivers: list[dict]


# --- General ---
class HealthResponse(BaseModel):
    status: str
    version: str
    ai_engine: str
