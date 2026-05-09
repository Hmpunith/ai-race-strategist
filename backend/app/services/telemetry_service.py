"""Telemetry data service."""

from app.data.race_data import RACE_DATA, DRIVERS


def get_drivers():
    """Get list of all drivers."""
    return DRIVERS


def get_lap_times(driver_code: str, start_lap: int = 1, end_lap: int = None):
    """Get lap time data for a specific driver."""
    laps = RACE_DATA["laps"].get(driver_code, [])
    if end_lap:
        return [l for l in laps if start_lap <= l["lap"] <= end_lap]
    return laps


def get_tire_data(driver_code: str):
    """Get tire wear data for a specific driver."""
    return RACE_DATA["tires"].get(driver_code, [])


def get_fuel_data(driver_code: str):
    """Get fuel usage data for a specific driver."""
    return RACE_DATA["fuel"].get(driver_code, [])


def get_sector_performance(driver_code: str, lap: int = None):
    """Get sector breakdown for a driver."""
    laps = RACE_DATA["laps"].get(driver_code, [])
    if lap:
        laps = [l for l in laps if l["lap"] == lap]

    sectors = []
    for l in laps:
        for s_num in [1, 2, 3]:
            sectors.append({
                "driver": driver_code,
                "lap": l["lap"],
                "sector": s_num,
                "time": l[f"sector{s_num}"],
            })
    return sectors


def get_position_history(driver_code: str = None):
    """Get position data over the race."""
    positions = RACE_DATA["positions"]
    if driver_code:
        return [p for p in positions if p["driver_code"] == driver_code]
    return positions


def get_session_info():
    """Get current race session information."""
    session = RACE_DATA["session"].copy()
    session["drivers"] = [
        {"name": d["name"], "code": d["code"], "team": d["team"], "color": d["color"]}
        for d in DRIVERS
    ]
    return session


def get_current_standings(lap: int = None):
    """Get driver standings at a specific lap."""
    target_lap = lap or RACE_DATA["session"]["total_laps"]
    positions = [
        p for p in RACE_DATA["positions"] if p["lap"] == target_lap
    ]
    return sorted(positions, key=lambda x: x["position"])
