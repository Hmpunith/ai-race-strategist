"""API router registration."""

from fastapi import APIRouter
from app.api.routes import telemetry, strategy, prediction, ai_chat, comparison

api_router = APIRouter()
api_router.include_router(telemetry.router)
api_router.include_router(strategy.router)
api_router.include_router(prediction.router)
api_router.include_router(ai_chat.router)
api_router.include_router(comparison.router)
