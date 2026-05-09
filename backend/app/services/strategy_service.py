"""Strategy recommendation service."""

import statistics
from app.data.race_data import RACE_DATA, TIRE_COMPOUNDS, DRIVERS


def calculate_pit_window(driver_code: str, current_lap: int) -> dict:
    """Calculate optimal pit window for a driver."""
    tires = RACE_DATA["tires"].get(driver_code, [])
    laps = RACE_DATA["laps"].get(driver_code, [])
    total_laps = RACE_DATA["session"]["total_laps"]

    if not tires or current_lap >= total_laps:
        return {"error": "No data available"}

    current_tire = next(
        (t for t in tires if t["lap"] == current_lap), None
    )
    if not current_tire:
        return {"error": "Lap data not found"}

    compound = current_tire["compound"]
    tire_info = TIRE_COMPOUNDS[compound]
    stint_lap = current_tire["stint_lap"]
    wear = current_tire["wear_pct"]

    # Calculate optimal pit window
    laps_to_cliff = max(0, tire_info["cliff_lap"] - stint_lap)
    optimal_start = current_lap + max(0, laps_to_cliff - 3)
    optimal_end = current_lap + laps_to_cliff + 2
    recommended = current_lap + max(1, laps_to_cliff - 1)

    # Ensure bounds
    optimal_start = min(optimal_start, total_laps - 5)
    optimal_end = min(optimal_end, total_laps - 3)
    recommended = min(recommended, total_laps - 4)

    # Determine next compound
    if compound == "SOFT":
        next_compound = "MEDIUM"
    elif compound == "MEDIUM":
        next_compound = "HARD"
    else:
        next_compound = "MEDIUM"

    # Check undercut/overcut viability
    current_pos_data = next(
        (p for p in RACE_DATA["positions"]
         if p["driver_code"] == driver_code and p["lap"] == current_lap),
        None
    )

    gap_ahead = 0.0
    undercut_viable = False
    overcut_viable = False

    if current_pos_data and current_pos_data["position"] > 1:
        pos_ahead = next(
            (p for p in RACE_DATA["positions"]
             if p["lap"] == current_lap and p["position"] == current_pos_data["position"] - 1),
            None
        )
        if pos_ahead:
            gap_ahead = abs(
                current_pos_data["gap_to_leader"] -
                pos_ahead["gap_to_leader"]
            )
            undercut_viable = gap_ahead < 3.0 and wear < 50
            overcut_viable = gap_ahead < 2.0 and wear > 40

    confidence = 0.85 if wear < 40 else (0.70 if wear < 60 else 0.55)

    return {
        "optimal_lap_start": optimal_start,
        "optimal_lap_end": optimal_end,
        "recommended_lap": recommended,
        "recommended_compound": next_compound,
        "time_loss": RACE_DATA["session"]["pit_loss"],
        "undercut_viable": undercut_viable,
        "overcut_viable": overcut_viable,
        "current_wear": wear,
        "current_compound": compound,
        "confidence": round(confidence, 2),
    }


def get_risk_assessment(driver_code: str, current_lap: int) -> dict:
    """Calculate comprehensive risk assessment."""
    tires = RACE_DATA["tires"].get(driver_code, [])
    fuel = RACE_DATA["fuel"].get(driver_code, [])
    total_laps = RACE_DATA["session"]["total_laps"]

    current_tire = next((t for t in tires if t["lap"] == current_lap), None)
    current_fuel = next((f for f in fuel if f["lap"] == current_lap), None)

    if not current_tire or not current_fuel:
        return {"overall_risk": 50, "status": "unknown", "factors": []}

    # Calculate individual risk factors
    tire_risk = max(0, min(100, 100 - current_tire["wear_pct"]))
    fuel_risk = max(0, min(100, 100 - current_fuel["fuel_remaining_pct"]))

    # Gap risk
    pos_data = next(
        (p for p in RACE_DATA["positions"]
         if p["driver_code"] == driver_code and p["lap"] == current_lap),
        None
    )
    gap_risk = 30  # default
    if pos_data:
        gap_risk = min(80, max(10, 50 - pos_data.get("gap_to_leader", 0)))

    # Weather risk (Monaco is dry in our sim)
    weather_risk = 15

    # Incident risk (Monaco has high incident probability)
    race_progress = current_lap / total_laps
    incident_risk = 45 if race_progress < 0.3 else (30 if race_progress < 0.7 else 20)

    factors = [
        {"name": "Tire Degradation", "value": round(tire_risk, 1), "status": "danger" if tire_risk > 70 else ("caution" if tire_risk > 40 else "safe")},
        {"name": "Fuel Level", "value": round(fuel_risk, 1), "status": "danger" if fuel_risk > 80 else ("caution" if fuel_risk > 50 else "safe")},
        {"name": "Track Position", "value": round(gap_risk, 1), "status": "danger" if gap_risk > 60 else ("caution" if gap_risk > 35 else "safe")},
        {"name": "Weather", "value": round(weather_risk, 1), "status": "safe"},
        {"name": "Incident Risk", "value": round(incident_risk, 1), "status": "caution" if incident_risk > 30 else "safe"},
    ]

    overall = statistics.mean([f["value"] for f in factors])
    status = "danger" if overall > 60 else ("caution" if overall > 35 else "safe")

    return {
        "overall_risk": round(overall, 1),
        "status": status,
        "factors": factors,
    }
