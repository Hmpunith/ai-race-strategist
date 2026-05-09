"""Race prediction service."""

import statistics
from app.data.race_data import RACE_DATA, DRIVERS


def predict_finishing_positions(current_lap: int = None) -> list:
    """Predict finishing positions based on current pace and strategy."""
    total_laps = RACE_DATA["session"]["total_laps"]
    target_lap = current_lap or total_laps

    predictions = []
    for driver in DRIVERS:
        code = driver["code"]
        laps = RACE_DATA["laps"].get(code, [])

        # Get recent pace (last 5 laps or available)
        recent = [l for l in laps if l["lap"] <= target_lap][-5:]
        if not recent:
            continue

        avg_pace = statistics.mean([l["time"] for l in recent if not l.get("is_pit_lap")] or [l["time"] for l in recent])
        total_time = sum(l["time"] for l in laps if l["lap"] <= target_lap)

        # Project remaining laps
        remaining = total_laps - target_lap
        projected_total = total_time + (avg_pace * remaining)

        # Current position
        current_pos = next(
            (p for p in RACE_DATA["positions"]
             if p["driver_code"] == code and p["lap"] == target_lap),
            None
        )

        predictions.append({
            "driver": driver["name"],
            "driver_code": code,
            "team": driver["team"],
            "team_color": driver["color"],
            "projected_total": projected_total,
            "avg_recent_pace": round(avg_pace, 3),
            "current_position": current_pos["position"] if current_pos else 20,
        })

    # Sort by projected total time
    predictions.sort(key=lambda x: x["projected_total"])
    leader_time = predictions[0]["projected_total"]

    result = []
    for pos, p in enumerate(predictions, 1):
        # Confidence decreases for positions further from current
        pos_diff = abs(pos - p["current_position"])
        confidence = max(0.3, 0.95 - (pos_diff * 0.08))

        result.append({
            "position": pos,
            "driver": p["driver"],
            "driver_code": p["driver_code"],
            "team": p["team"],
            "team_color": p["team_color"],
            "probability": round(confidence, 2),
            "predicted_gap": round(p["projected_total"] - leader_time, 3),
        })

    return result


def predict_podium_probabilities(current_lap: int = None) -> list:
    """Predict podium probabilities for each driver."""
    predictions = predict_finishing_positions(current_lap)
    if not predictions:
        return []

    podium = []
    for pred in predictions[:10]:  # Top 10 only
        pos = pred["position"]

        # Simple probability model based on predicted position
        if pos == 1:
            p1, p2, p3 = 0.65, 0.20, 0.10
        elif pos == 2:
            p1, p2, p3 = 0.20, 0.45, 0.20
        elif pos == 3:
            p1, p2, p3 = 0.08, 0.20, 0.40
        elif pos == 4:
            p1, p2, p3 = 0.03, 0.08, 0.18
        elif pos == 5:
            p1, p2, p3 = 0.02, 0.04, 0.08
        else:
            p1, p2, p3 = 0.01, 0.02, 0.03

        podium.append({
            "driver": pred["driver"],
            "driver_code": pred["driver_code"],
            "team": pred["team"],
            "team_color": pred["team_color"],
            "p1_probability": round(p1, 2),
            "p2_probability": round(p2, 2),
            "p3_probability": round(p3, 2),
            "podium_probability": round(p1 + p2 + p3, 2),
        })

    return podium
