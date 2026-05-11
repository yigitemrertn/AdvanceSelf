import os
from dotenv import load_dotenv

# Load variables from .env if it exists
load_dotenv()

from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = os.getenv("APP_NAME", "AdvanceSelf API")
    api_prefix: str = os.getenv("API_PREFIX", "/api/v1")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./advanceself.db")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    enable_real_gemini: bool = os.getenv("ENABLE_REAL_GEMINI", "false").lower() == "true"
    score_model_version: str = os.getenv("SCORE_MODEL_VERSION", "mediapipe-v1")


settings = Settings()
