# AI Race Strategist

> An AI-powered Formula 1 strategy assistant that analyzes race telemetry and provides intelligent race strategy recommendations in real time.

[![IBM Granite](https://img.shields.io/badge/AI%20Engine-IBM%20Granite-blue?style=for-the-badge&logo=ibm)](https://github.com/ibm-granite-community)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

Built for the **IBM SkillsBuild AI Builders May Challenge** — *Race to innovate. Drive AI beyond the finish line.*

---

## The Problem

Formula racing teams process massive amounts of telemetry and strategy data during races. Making the correct decision at the right time can determine the outcome of the race.

**Current challenges include:**
- Analyzing large telemetry datasets quickly during live races
- Predicting optimal pit stop timing with multiple variables
- Understanding tire degradation patterns and their impact on strategy
- Comparing driver performance across multiple dimensions
- Explaining strategic decisions clearly to teams and fans

Teams and fans often struggle to interpret complex race data in real time, leading to suboptimal decisions and missed strategic opportunities.

## AI / Technical Approach

AI Race Strategist combines **data analytics** with **IBM Granite generative AI** to create an intelligent, interactive racing strategy platform:

### IBM Granite Integration
- **Model**: `ibm-granite/granite-3.2-8b-instruct` via Hugging Face Inference API
- **Role**: Acts as an AI race engineer, analyzing telemetry context and generating:
  - Natural language strategy recommendations
  - Pit stop timing analysis with undercut/overcut evaluation
  - Race outcome predictions with confidence scoring
  - Interactive Q&A explanations of strategic decisions
- **Explainability**: Every AI recommendation includes confidence levels, contributing data factors, and expandable explanations

### Architecture
```
User Dashboard (Next.js + Tailwind + Recharts)
        |
Backend API (FastAPI + Python)
        |
Telemetry Processing Layer (Synthetic Monaco GP Data)
        |
AI Recommendation Engine (IBM Granite)
        |
Race Insights & Predictions
```

### Key Technical Features
| Feature | Technology | Description |
|---|---|---|
| Telemetry Dashboard | Recharts + Next.js | Lap times, tire wear, position tracking with animated charts |
| AI Strategy Engine | IBM Granite | Context-aware pit stop and tire strategy recommendations |
| Risk Assessment | Python + Radar Charts | Multi-factor risk scoring (tires, fuel, gaps, weather, incidents) |
| Race Predictions | Statistical + AI | Finishing position and podium probability predictions |
| Driver Comparison | Radar Charts + Stats | Head-to-head performance analysis across 6 dimensions |
| AI Chat Interface | IBM Granite | Interactive race engineer assistant with quick questions |
| Explainable AI | Custom UI | Confidence meters, factor breakdowns, and reasoning display |

## Why This Matters in Racing

1. **Democratizes F1 Strategy**: Makes complex race strategy accessible to fans, not just engineers
2. **Real-Time Decision Support**: Processes telemetry data and provides actionable recommendations instantly
3. **Explainable AI**: Unlike black-box models, every recommendation is backed by visible data and reasoning
4. **Educational Tool**: Helps students and enthusiasts understand the strategic depth of motorsport
5. **Scalable Framework**: Architecture can be extended with live APIs (OpenF1) for real-time race analysis

## Features

### Telemetry Dashboard
- Lap time evolution with pit stop markers
- Tire performance degradation curves
- Position tracker showing all drivers with team colors
- Interactive lap slider to explore any point in the race

### AI Strategy Panel
- AI-powered pit window recommendations
- Undercut/overcut opportunity analysis
- Risk assessment radar with 5 factors
- Confidence-scored recommendations
- Expandable AI explanations (powered by IBM Granite)

### Race Predictions
- Podium probability visualization
- Predicted finishing order with probability bars
- Based on pace analysis, tire strategy, and position data

### Driver Comparison
- Side-by-side performance radar
- Head-to-head statistics table
- Sector-by-sector analysis
- Tire management scoring

### AI Race Engineer Chat
- Interactive chat with IBM Granite AI
- Quick question buttons for common strategy queries
- Context-aware responses based on current race state
- Typing animation and conversation history

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11+, Pydantic |
| AI Engine | IBM Granite (granite-3.2-8b-instruct) |
| AI Platform | Hugging Face Inference API |
| Data | Synthetic 2024 Monaco GP simulation |
| Design | F1-inspired dark theme, glassmorphism, Orbitron font |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Hugging Face API token (free at [huggingface.co](https://huggingface.co/settings/tokens))

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Edit .env and add your HF_API_TOKEN

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

> **Note**: The app works without an API token using intelligent fallback responses. Add your Hugging Face token for live IBM Granite AI integration.

## Project Structure

```
ai-race-strategist/
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/               # Pages and layout
│   │   ├── components/        # React components
│   │   │   ├── telemetry/     # Charts (LapTime, TireWear, Position)
│   │   │   ├── strategy/      # StrategyCard, RiskRadar
│   │   │   ├── ai/            # AIChat panel
│   │   │   ├── prediction/    # PodiumPrediction
│   │   │   └── comparison/    # DriverComparison
│   │   ├── lib/               # API client
│   │   └── types/             # TypeScript interfaces
│   └── package.json
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py            # Application entry
│   │   ├── core/
│   │   │   ├── config.py      # Environment config
│   │   │   └── granite.py     # IBM Granite AI client
│   │   ├── api/routes/        # REST endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # Pydantic schemas
│   │   └── data/              # Race data generator
│   └── requirements.txt
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/telemetry/laps` | GET | Lap time data by driver |
| `/api/telemetry/tires` | GET | Tire wear progression |
| `/api/telemetry/positions` | GET | Position history |
| `/api/strategy/pit-window` | GET | Optimal pit window calculation |
| `/api/strategy/recommend` | POST | AI strategy recommendation |
| `/api/strategy/risk` | GET | Multi-factor risk assessment |
| `/api/prediction/podium` | GET | Podium probabilities |
| `/api/comparison/drivers` | GET | Head-to-head driver stats |
| `/api/ai/chat` | POST | Interactive AI chat |

## Team

Built for the IBM SkillsBuild AI Builders May Challenge 2026.

## License

This project is for educational purposes as part of the IBM SkillsBuild challenge.

---

<p align="center">
  <strong>Powered by IBM Granite AI</strong><br>
  <em>Race to innovate. Drive AI beyond the finish line.</em>
</p>
