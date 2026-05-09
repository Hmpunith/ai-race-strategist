"""Telemetry API routes."""

from fastapi import APIRouter, Query
from app.services.telemetry_service import (
    get_lap_times, get_tire_data, get_fuel_data,
    get_sector_performance, get_position_history,
    get_session_info, get_current_standings, get_drivers,
)

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])


@router.get("/drivers")
async def drivers():
    return get_drivers()


@router.get("/session")
async def session():
    return get_session_info()


@router.get("/laps")
async def laps(driver: str = Query("VER"), start_lap: int = 1, end_lap: int = None):
    return get_lap_times(driver, start_lap, end_lap)


@router.get("/tires")
async def tires(driver: str = Query("VER")):
    return get_tire_data(driver)


@router.get("/fuel")
async def fuel(driver: str = Query("VER")):
    return get_fuel_data(driver)


@router.get("/sectors")
async def sectors(driver: str = Query("VER"), lap: int = None):
    return get_sector_performance(driver, lap)


@router.get("/positions")
async def positions(driver: str = None):
    return get_position_history(driver)


@router.get("/standings")
async def standings(lap: int = None):
    return get_current_standings(lap)
