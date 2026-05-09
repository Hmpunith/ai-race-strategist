"""AI Chat API routes."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import chat_with_ai

router = APIRouter(prefix="/api/ai", tags=["AI"])


class ChatRequest(BaseModel):
    message: str
    lap: Optional[int] = 40


@router.post("/chat")
async def chat(request: ChatRequest):
    response = await chat_with_ai(
        message=request.message,
        context={"lap": request.lap},
    )
    return {
        "message": response,
        "powered_by": "IBM Granite",
    }
