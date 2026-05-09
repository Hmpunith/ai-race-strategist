"""Configuration management for AI Race Strategist backend."""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "AI Race Strategist"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # IBM Granite via Hugging Face
    HF_API_TOKEN: str = os.getenv("HF_API_TOKEN", "")
    GRANITE_MODEL: str = os.getenv(
        "GRANITE_MODEL", "ibm-granite/granite-3.2-8b-instruct"
    )
    HF_API_URL: str = "https://api-inference.huggingface.co/models"

    # OpenF1
    OPENF1_BASE_URL: str = "https://api.openf1.org/v1"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://*.vercel.app",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
