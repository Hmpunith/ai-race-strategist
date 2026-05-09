"""AI orchestration service for IBM Granite integration."""

from app.core.granite import (
    generate_strategy_recommendation,
    generate_race_explanation,
    predict_race_outcome,
)
from app.services.telemetry_service import get_current_standings, get_lap_times, get_tire_data
from app.data.race_data import RACE_DATA


async def get_ai_strategy(driver_code: str, current_lap: int) -> dict:
    """Get AI-powered strategy recommendation for a driver."""
    total_laps = RACE_DATA["session"]["total_laps"]
    laps = RACE_DATA["laps"].get(driver_code, [])
    tires = RACE_DATA["tires"].get(driver_code, [])

    current_lap_data = next((l for l in laps if l["lap"] == current_lap), None)
    current_tire = next((t for t in tires if t["lap"] == current_lap), None)

    if not current_lap_data or not current_tire:
        return {
            "action": "No data available",
            "urgency": "low",
            "summary": "Unable to analyze - no data for this lap",
            "explanation": "",
            "confidence": 0,
            "factors": [],
            "powered_by": "IBM Granite",
        }

    # Get position info
    standings = get_current_standings(current_lap)
    driver_standing = next((s for s in standings if s["driver_code"] == driver_code), None)
    position = driver_standing["position"] if driver_standing else 10

    # Calculate gaps
    gap_ahead = 99.9
    gap_behind = 99.9
    if driver_standing:
        pos_ahead = next(
            (s for s in standings if s["position"] == position - 1), None
        )
        pos_behind = next(
            (s for s in standings if s["position"] == position + 1), None
        )
        if pos_ahead:
            gap_ahead = abs(driver_standing["gap_to_leader"] - pos_ahead["gap_to_leader"])
        if pos_behind:
            gap_behind = abs(driver_standing["gap_to_leader"] - pos_behind["gap_to_leader"])

    # Get driver name
    driver_name = next(
        (d["name"] for d in RACE_DATA["drivers"] if d["code"] == driver_code),
        driver_code
    )

    explanation = await generate_strategy_recommendation(
        driver=driver_name,
        current_lap=current_lap,
        total_laps=total_laps,
        tire_compound=current_tire["compound"],
        tire_age=current_tire["stint_lap"],
        position=position,
        gap_ahead=round(gap_ahead, 1),
        gap_behind=round(gap_behind, 1),
        tire_wear_pct=current_tire["wear_pct"],
        fuel_remaining_pct=RACE_DATA["fuel"][driver_code][current_lap - 1]["fuel_remaining_pct"],
    )

    # Determine urgency from tire wear
    wear = current_tire["wear_pct"]
    if wear < 20:
        urgency = "critical"
        action = "PIT NOW"
    elif wear < 40:
        urgency = "high"
        action = "Prepare to pit"
    elif wear < 60:
        urgency = "medium"
        action = "Monitor tires"
    else:
        urgency = "low"
        action = "Stay out"

    factors = [
        {"name": "Tire Wear", "value": f"{100 - wear:.0f}%", "impact": "high" if wear < 40 else "medium"},
        {"name": "Position", "value": f"P{position}", "impact": "medium"},
        {"name": "Gap Ahead", "value": f"{gap_ahead:.1f}s", "impact": "high" if gap_ahead < 2 else "low"},
        {"name": "Gap Behind", "value": f"{gap_behind:.1f}s", "impact": "high" if gap_behind < 1.5 else "low"},
        {"name": "Laps Remaining", "value": str(total_laps - current_lap), "impact": "medium"},
    ]

    return {
        "action": action,
        "urgency": urgency,
        "summary": f"Lap {current_lap}/{total_laps} | {current_tire['compound']} ({current_tire['stint_lap']} laps) | P{position}",
        "explanation": explanation,
        "confidence": round(0.85 if wear > 40 else 0.65, 2),
        "factors": factors,
        "powered_by": "IBM Granite",
    }


async def chat_with_ai(message: str, context: dict = None) -> str:
    """Interactive chat with the AI strategist."""
    # Build context from race state
    standings = get_current_standings(context.get("lap", 40) if context else 40)
    top5 = standings[:5] if standings else []

    context_str = f"Race: {RACE_DATA['session']['circuit']} ({RACE_DATA['session']['date']})\n"
    context_str += f"Total Laps: {RACE_DATA['session']['total_laps']}\n"
    context_str += "Current Top 5:\n"
    for s in top5:
        code = s["driver_code"]
        tire = RACE_DATA["tires"].get(code, [{}])
        current_tire = next(
            (t for t in tire if t["lap"] == (context.get("lap", 40) if context else 40)),
            {"compound": "MEDIUM", "stint_lap": 0, "wear_pct": 50}
        )
        context_str += (
            f"  P{s['position']} {s['driver']} ({s['team']}) - "
            f"Gap: {s['gap_to_leader']:.1f}s, "
            f"Tire: {current_tire['compound']} ({current_tire['stint_lap']} laps)\n"
        )

    return await generate_race_explanation(context_str, message)


async def get_ai_predictions(current_lap: int = None) -> str:
    """Get AI narrative predictions for the race."""
    lap = current_lap or 40
    standings = get_current_standings(lap)

    race_state = {
        "current_lap": lap,
        "total_laps": RACE_DATA["session"]["total_laps"],
        "track": RACE_DATA["session"]["circuit"],
        "weather": "Dry, 24°C",
        "sc_probability": "Medium (Monaco)",
        "drivers": [],
    }

    for s in standings[:10]:
        code = s["driver_code"]
        laps = RACE_DATA["laps"].get(code, [])
        tires = RACE_DATA["tires"].get(code, [])
        recent = [l for l in laps if l["lap"] <= lap][-5:]
        avg_pace = sum(l["time"] for l in recent) / len(recent) if recent else 75.0
        current_tire = next((t for t in tires if t["lap"] == lap), None)

        race_state["drivers"].append({
            "name": s["driver"],
            "code": code,
            "position": s["position"],
            "tire_compound": current_tire["compound"] if current_tire else "MEDIUM",
            "tire_age": current_tire["stint_lap"] if current_tire else 0,
            "avg_pace": avg_pace,
            "gap_to_leader": s["gap_to_leader"],
        })

    return await predict_race_outcome(race_state)
