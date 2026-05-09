"""Driver comparison API routes."""

import statistics
from fastapi import APIRouter, Query
from app.data.race_data import RACE_DATA, DRIVERS

router = APIRouter(prefix="/api/comparison", tags=["Comparison"])


@router.get("/drivers")
async def compare_drivers(
    driver1: str = Query("VER"),
    driver2: str = Query("LEC"),
    lap: int = None,
):
    """Compare two drivers' performance statistics."""
    target_lap = lap or RACE_DATA["session"]["total_laps"]

    results = []
    for code in [driver1, driver2]:
        driver_info = next((d for d in DRIVERS if d["code"] == code), None)
        if not driver_info:
            continue

        laps = RACE_DATA["laps"].get(code, [])
        active_laps = [l for l in laps if l["lap"] <= target_lap and not l.get("is_pit_lap")]
        all_laps = [l for l in laps if l["lap"] <= target_lap]

        if not active_laps:
            continue

        times = [l["time"] for l in active_laps]
        avg_time = statistics.mean(times)
        best_time = min(times)
        consistency = statistics.stdev(times) if len(times) > 1 else 0

        # Tire management score (lower degradation = better)
        tires = RACE_DATA["tires"].get(code, [])
        tire_laps = [t for t in tires if t["lap"] <= target_lap]
        avg_degradation = statistics.mean([t["performance_delta"] for t in tire_laps]) if tire_laps else 0
        tire_score = max(0, min(100, 100 - (avg_degradation * 200)))

        # Sector averages
        s1 = statistics.mean([l["sector1"] for l in active_laps])
        s2 = statistics.mean([l["sector2"] for l in active_laps])
        s3 = statistics.mean([l["sector3"] for l in active_laps])

        # Positions gained
        start_pos = next((l["position"] for l in all_laps if l["lap"] == 1), 20)
        end_pos = next((l["position"] for l in all_laps if l["lap"] == target_lap), 20)
        positions_gained = start_pos - end_pos

        # Pit stops
        pit_stops = sum(1 for l in all_laps if l.get("is_pit_lap"))

        results.append({
            "driver": driver_info["name"],
            "driver_code": code,
            "team": driver_info["team"],
            "team_color": driver_info["color"],
            "avg_lap_time": round(avg_time, 3),
            "best_lap_time": round(best_time, 3),
            "consistency": round(consistency, 3),
            "tire_management": round(tire_score, 1),
            "sector1_avg": round(s1, 3),
            "sector2_avg": round(s2, 3),
            "sector3_avg": round(s3, 3),
            "positions_gained": positions_gained,
            "pit_stops": pit_stops,
            "current_position": end_pos,
        })

    return results
