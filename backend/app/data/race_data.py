"""Synthetic race data generator for 2024 Monaco GP simulation."""

import random
import math

# 2024 F1 Grid - realistic driver/team data
DRIVERS = [
    {"name": "Max Verstappen", "code": "VER", "team": "Red Bull Racing", "color": "#3671C6", "base_pace": 74.5, "consistency": 0.15},
    {"name": "Sergio Perez", "code": "PER", "team": "Red Bull Racing", "color": "#3671C6", "base_pace": 74.9, "consistency": 0.30},
    {"name": "Lewis Hamilton", "code": "HAM", "team": "Mercedes", "color": "#27F4D2", "base_pace": 74.7, "consistency": 0.18},
    {"name": "George Russell", "code": "RUS", "team": "Mercedes", "color": "#27F4D2", "base_pace": 74.8, "consistency": 0.20},
    {"name": "Charles Leclerc", "code": "LEC", "team": "Ferrari", "color": "#E8002D", "base_pace": 74.6, "consistency": 0.22},
    {"name": "Carlos Sainz", "code": "SAI", "team": "Ferrari", "color": "#E8002D", "base_pace": 74.8, "consistency": 0.20},
    {"name": "Lando Norris", "code": "NOR", "team": "McLaren", "color": "#FF8000", "base_pace": 74.7, "consistency": 0.19},
    {"name": "Oscar Piastri", "code": "PIA", "team": "McLaren", "color": "#FF8000", "base_pace": 74.9, "consistency": 0.22},
    {"name": "Fernando Alonso", "code": "ALO", "team": "Aston Martin", "color": "#229971", "base_pace": 75.2, "consistency": 0.20},
    {"name": "Lance Stroll", "code": "STR", "team": "Aston Martin", "color": "#229971", "base_pace": 75.5, "consistency": 0.35},
    {"name": "Pierre Gasly", "code": "GAS", "team": "Alpine", "color": "#0093CC", "base_pace": 75.3, "consistency": 0.25},
    {"name": "Esteban Ocon", "code": "OCO", "team": "Alpine", "color": "#0093CC", "base_pace": 75.4, "consistency": 0.28},
    {"name": "Alexander Albon", "code": "ALB", "team": "Williams", "color": "#64C4FF", "base_pace": 75.6, "consistency": 0.25},
    {"name": "Logan Sargeant", "code": "SAR", "team": "Williams", "color": "#64C4FF", "base_pace": 76.0, "consistency": 0.40},
    {"name": "Daniel Ricciardo", "code": "RIC", "team": "RB", "color": "#6692FF", "base_pace": 75.4, "consistency": 0.30},
    {"name": "Yuki Tsunoda", "code": "TSU", "team": "RB", "color": "#6692FF", "base_pace": 75.3, "consistency": 0.28},
    {"name": "Valtteri Bottas", "code": "BOT", "team": "Kick Sauber", "color": "#52E252", "base_pace": 75.7, "consistency": 0.25},
    {"name": "Zhou Guanyu", "code": "ZHO", "team": "Kick Sauber", "color": "#52E252", "base_pace": 75.9, "consistency": 0.30},
    {"name": "Kevin Magnussen", "code": "MAG", "team": "Haas", "color": "#B6BABD", "base_pace": 75.5, "consistency": 0.30},
    {"name": "Nico Hulkenberg", "code": "HUL", "team": "Haas", "color": "#B6BABD", "base_pace": 75.4, "consistency": 0.28},
]

TIRE_COMPOUNDS = {
    "SOFT": {"color": "#FF3333", "base_deg": 0.12, "grip_bonus": -0.5, "cliff_lap": 18},
    "MEDIUM": {"color": "#FFD700", "base_deg": 0.07, "grip_bonus": 0.0, "cliff_lap": 30},
    "HARD": {"color": "#FFFFFF", "base_deg": 0.04, "grip_bonus": 0.4, "cliff_lap": 45},
}

TOTAL_LAPS = 78  # Monaco GP
CIRCUIT = "Circuit de Monaco"
PIT_LOSS = 22.0  # seconds lost in pit stop at Monaco

random.seed(42)  # Reproducible data


def _tire_degradation(compound: str, tire_age: int) -> float:
    """Calculate tire performance loss based on compound and age."""
    tire = TIRE_COMPOUNDS[compound]
    base_loss = tire["base_deg"] * tire_age
    # Exponential cliff effect
    if tire_age > tire["cliff_lap"]:
        cliff_factor = (tire_age - tire["cliff_lap"]) ** 1.5 * 0.05
        base_loss += cliff_factor
    return base_loss


def _tire_wear_pct(compound: str, tire_age: int) -> float:
    """Calculate tire wear percentage (100% = new, 0% = destroyed)."""
    tire = TIRE_COMPOUNDS[compound]
    cliff = tire["cliff_lap"]
    wear = min(100, (tire_age / (cliff * 1.3)) * 100)
    return max(0, 100 - wear)


def generate_race_data() -> dict:
    """Generate complete race simulation data for 2024 Monaco GP."""
    # Define pit strategies for each driver
    strategies = {}
    for i, driver in enumerate(DRIVERS):
        if i < 4:  # Top teams: S-M strategy
            strategies[driver["code"]] = [
                {"compound": "SOFT", "start": 1, "end": 20 + random.randint(-2, 3)},
                {"compound": "MEDIUM", "start": 0, "end": TOTAL_LAPS},
            ]
        elif i < 10:  # Midfield: M-H or S-M-H
            if random.random() > 0.5:
                pit1 = 25 + random.randint(-3, 3)
                strategies[driver["code"]] = [
                    {"compound": "MEDIUM", "start": 1, "end": pit1},
                    {"compound": "HARD", "start": pit1 + 1, "end": TOTAL_LAPS},
                ]
            else:
                pit1 = 15 + random.randint(-2, 2)
                pit2 = 45 + random.randint(-3, 3)
                strategies[driver["code"]] = [
                    {"compound": "SOFT", "start": 1, "end": pit1},
                    {"compound": "MEDIUM", "start": pit1 + 1, "end": pit2},
                    {"compound": "HARD", "start": pit2 + 1, "end": TOTAL_LAPS},
                ]
        else:  # Backmarkers: M-H
            pit1 = 30 + random.randint(-5, 5)
            strategies[driver["code"]] = [
                {"compound": "MEDIUM", "start": 1, "end": pit1},
                {"compound": "HARD", "start": pit1 + 1, "end": TOTAL_LAPS},
            ]

    # Fix stint boundaries
    for code, stints in strategies.items():
        for j in range(1, len(stints)):
            stints[j]["start"] = stints[j - 1]["end"] + 1

    # Generate lap-by-lap data
    all_laps = {}
    all_tires = {}
    all_fuel = {}
    all_positions = []

    for driver in DRIVERS:
        code = driver["code"]
        stints = strategies[code]
        laps = []
        tires = []
        fuels = []
        stint_idx = 0
        stint_lap = 0
        current_compound = stints[0]["compound"]

        for lap in range(1, TOTAL_LAPS + 1):
            # Check for pit stop
            is_pit = False
            if stint_idx < len(stints) - 1 and lap > stints[stint_idx]["end"]:
                stint_idx += 1
                current_compound = stints[stint_idx]["compound"]
                stint_lap = 0
                is_pit = True

            stint_lap += 1
            tire = TIRE_COMPOUNDS[current_compound]

            # Calculate lap time
            base = driver["base_pace"]
            tire_bonus = tire["grip_bonus"]
            degradation = _tire_degradation(current_compound, stint_lap)
            fuel_effect = (TOTAL_LAPS - lap) * 0.03  # Fuel weight effect
            random_var = random.gauss(0, driver["consistency"])
            lap_time = base + tire_bonus + degradation + fuel_effect + random_var

            if is_pit:
                lap_time += PIT_LOSS

            # Sector split (roughly 33% each with Monaco characteristics)
            s1_pct = 0.30 + random.gauss(0, 0.005)
            s2_pct = 0.38 + random.gauss(0, 0.005)
            s3_pct = 1 - s1_pct - s2_pct

            wear = _tire_wear_pct(current_compound, stint_lap)
            cliff_warning = wear < 25

            laps.append({
                "lap": lap,
                "time": round(lap_time, 3),
                "sector1": round(lap_time * s1_pct, 3),
                "sector2": round(lap_time * s2_pct, 3),
                "sector3": round(lap_time * s3_pct, 3),
                "compound": current_compound,
                "tire_age": stint_lap,
                "is_pit_lap": is_pit,
            })

            tires.append({
                "lap": lap,
                "compound": current_compound,
                "wear_pct": round(wear, 1),
                "performance_delta": round(degradation, 3),
                "stint_lap": stint_lap,
                "cliff_warning": cliff_warning,
            })

            fuel_remaining = max(0, (TOTAL_LAPS - lap) / TOTAL_LAPS * 100)
            fuels.append({
                "lap": lap,
                "fuel_remaining_kg": round((TOTAL_LAPS - lap) * 1.3, 1),
                "fuel_remaining_pct": round(fuel_remaining, 1),
                "consumption_rate": round(1.3 + random.gauss(0, 0.05), 2),
                "fuel_adjusted_time": round(fuel_effect, 3),
            })

        all_laps[code] = laps
        all_tires[code] = tires
        all_fuel[code] = fuels

    # Calculate positions per lap
    for lap in range(1, TOTAL_LAPS + 1):
        # Sort by cumulative time to determine positions
        cumulative = []
        for driver in DRIVERS:
            code = driver["code"]
            total_time = sum(l["time"] for l in all_laps[code][:lap])
            cumulative.append((code, driver["name"], driver["team"], driver["color"], total_time))

        cumulative.sort(key=lambda x: x[4])
        leader_time = cumulative[0][4]

        for pos, (code, name, team, color, total) in enumerate(cumulative, 1):
            all_positions.append({
                "lap": lap,
                "driver": name,
                "driver_code": code,
                "position": pos,
                "team": team,
                "team_color": color,
                "gap_to_leader": round(total - leader_time, 3),
            })

            # Update position in laps data
            for l in all_laps[code]:
                if l["lap"] == lap:
                    l["position"] = pos
                    l["gap_to_leader"] = round(total - leader_time, 3)

    return {
        "session": {
            "session_key": 9529,
            "session_name": "Race",
            "circuit": CIRCUIT,
            "country": "Monaco",
            "date": "2024-05-26",
            "total_laps": TOTAL_LAPS,
            "pit_loss": PIT_LOSS,
        },
        "drivers": DRIVERS,
        "strategies": strategies,
        "laps": all_laps,
        "tires": all_tires,
        "fuel": all_fuel,
        "positions": all_positions,
        "tire_compounds": TIRE_COMPOUNDS,
    }


# Pre-generate data at module load
RACE_DATA = generate_race_data()
