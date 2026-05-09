"""Prediction API routes."""

from fastapi import APIRouter, Query
from app.services.prediction_service import predict_finishing_positions, predict_podium_probabilities
from app.services.ai_service import get_ai_predictions

router = APIRouter(prefix="/api/prediction", tags=["Prediction"])


@router.get("/positions")
async def positions(lap: int = None):
    return predict_finishing_positions(lap)


@router.get("/podium")
async def podium(lap: int = None):
    return predict_podium_probabilities(lap)


@router.get("/narrative")
async def narrative(lap: int = None):
    result = await get_ai_predictions(lap)
    return {"prediction": result, "powered_by": "IBM Granite"}
