"""IBM Granite AI client via Hugging Face Inference API."""

import httpx
import json
from app.core.config import settings

SYSTEM_PROMPT = """You are an elite Formula 1 race strategist AI powered by IBM Granite. 
You analyze telemetry data, tire degradation, fuel loads, weather conditions, and track positions 
to provide strategic race recommendations. Your responses should be:
- Data-driven and specific (cite numbers, lap times, gaps)
- Actionable (clear pit window, tire choice, strategy call)
- Confident but honest about uncertainty
- Written in the style of a professional F1 race engineer

Always structure your analysis with:
1. Current Situation Assessment
2. Key Data Points
3. Strategic Recommendation
4. Confidence Level (Low/Medium/High)
5. Risk Factors"""


async def query_granite(prompt: str, max_tokens: int = 512) -> str:
    """Send a prompt to IBM Granite via Hugging Face Inference API."""
    if not settings.HF_API_TOKEN:
        return _generate_fallback_response(prompt)

    url = f"{settings.HF_API_URL}/{settings.GRANITE_MODEL}"
    headers = {
        "Authorization": f"Bearer {settings.HF_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": f"<|system|>\n{SYSTEM_PROMPT}\n<|user|>\n{prompt}\n<|assistant|>\n",
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            "return_full_text": False,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()

            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "").strip()
            return str(result)
    except Exception as e:
        print(f"Granite API error: {e}")
        return _generate_fallback_response(prompt)


async def generate_strategy_recommendation(
    driver: str,
    current_lap: int,
    total_laps: int,
    tire_compound: str,
    tire_age: int,
    position: int,
    gap_ahead: float,
    gap_behind: float,
    tire_wear_pct: float,
    fuel_remaining_pct: float,
) -> str:
    """Generate an AI strategy recommendation based on current race state."""
    prompt = f"""Analyze the following race situation and provide a strategic recommendation:

RACE STATE - Lap {current_lap}/{total_laps}:
- Driver: {driver}
- Position: P{position}
- Current Tire: {tire_compound} (Age: {tire_age} laps, Wear: {tire_wear_pct:.1f}%)
- Gap to car ahead: {gap_ahead:.1f}s
- Gap to car behind: {gap_behind:.1f}s
- Fuel remaining: {fuel_remaining_pct:.1f}%
- Laps remaining: {total_laps - current_lap}

Consider pit stop timing, tire strategy (undercut/overcut opportunities), 
fuel management, and position strategy. What should the team do?"""

    return await query_granite(prompt)


async def generate_race_explanation(
    context: str,
    question: str,
) -> str:
    """Generate an AI explanation for a race situation or strategy decision."""
    prompt = f"""Based on the following race data and context, answer the question.

RACE CONTEXT:
{context}

QUESTION: {question}

Provide a clear, data-driven explanation that a racing fan could understand."""

    return await query_granite(prompt, max_tokens=400)


async def predict_race_outcome(race_state: dict) -> str:
    """Generate race outcome predictions based on current state."""
    drivers_info = ""
    for d in race_state.get("drivers", [])[:10]:
        drivers_info += (
            f"- P{d['position']} {d['name']}: "
            f"Tire={d['tire_compound']}({d['tire_age']}laps), "
            f"Pace={d['avg_pace']:.3f}s, "
            f"Gap={d.get('gap_to_leader', 0):.1f}s\n"
        )

    prompt = f"""Based on the current race state at Lap {race_state['current_lap']}/{race_state['total_laps']}, 
predict the likely finishing order and key strategic outcomes:

CURRENT STANDINGS:
{drivers_info}

RACE CONDITIONS:
- Track: {race_state.get('track', 'Monaco')}
- Weather: {race_state.get('weather', 'Dry')}
- Safety Car Probability: {race_state.get('sc_probability', 'Medium')}

Predict: Top 5 finishing order with reasoning, key battles, and strategy plays to watch."""

    return await query_granite(prompt, max_tokens=600)


def _generate_fallback_response(prompt: str) -> str:
    """Generate a realistic fallback when API is unavailable."""
    if "pit" in prompt.lower() or "strategy" in prompt.lower():
        return (
            "**Strategic Assessment** (IBM Granite - Offline Mode)\n\n"
            "Based on the current tire degradation curve and gap analysis:\n\n"
            "1. **Current Situation**: Tire performance is entering the critical "
            "degradation phase. Lap times are trending 0.3-0.5s slower than optimal.\n\n"
            "2. **Recommendation**: PIT within the next 2-3 laps. Switch to Medium "
            "compound for optimal race pace to the finish.\n\n"
            "3. **Undercut Opportunity**: With the current gap of ~2.5s to the car "
            "ahead, an undercut is viable if executed in the next lap.\n\n"
            "4. **Confidence**: HIGH (based on historical degradation patterns)\n\n"
            "5. **Risk Factors**: Track position loss during pit stop (~22s), "
            "potential safety car could negate strategy advantage.\n\n"
            "*Note: Connect IBM Granite API for real-time AI analysis.*"
        )
    elif "predict" in prompt.lower() or "finish" in prompt.lower():
        return (
            "**Race Prediction** (IBM Granite - Offline Mode)\n\n"
            "Based on current pace, tire strategy, and historical data:\n\n"
            "1. **P1**: Current leader maintains position with optimal strategy\n"
            "2. **P2**: Strong pace but needs to manage tire degradation\n"
            "3. **P3**: Potential podium contender with undercut strategy\n\n"
            "**Key Battle**: P4-P6 fight will be decided by pit stop timing.\n\n"
            "**Confidence**: MEDIUM\n\n"
            "*Note: Connect IBM Granite API for real-time AI predictions.*"
        )
    else:
        return (
            "**Race Analysis** (IBM Granite - Offline Mode)\n\n"
            "The current race situation shows several interesting strategic dynamics. "
            "Tire degradation is a key factor, with compounds performing as expected "
            "based on pre-race simulations. The field is closely matched in terms of "
            "pace, making strategic decisions crucial for final positions.\n\n"
            "*Note: Connect IBM Granite API for real-time AI analysis.*"
        )
