"""Strategy API routes."""

from fastapi import APIRouter, Query
from app.services.strategy_service import calculate_pit_window, get_risk_assessment
from app.services.ai_service import get_ai_strategy

router = APIRouter(prefix="/api/strategy", tags=["Strategy"])


@router.get("/pit-window")
async def pit_window(driver: str = Query("VER"), lap: int = Query(30)):
    return calculate_pit_window(driver, lap)


@router.get("/risk")
async def risk(driver: str = Query("VER"), lap: int = Query(30)):
    return get_risk_assessment(driver, lap)


@router.post("/recommend")
async def recommend(driver: str = Query("VER"), lap: int = Query(30)):
    return await get_ai_strategy(driver, lap)
