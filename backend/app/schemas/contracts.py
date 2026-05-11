from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class RegisterRequest(LoginRequest):
    full_name: str | None = None


class AuthResponse(BaseModel):
    user_id: int
    access_token: str
    token_type: str = "bearer"


class ProfileUpsertRequest(BaseModel):
    birth_date: date | None = None
    gender: str | None = None
    height: float | None = None
    body_shape: str | None = None
    face_shape: str | None = None
    preferred_styles: list[str] = Field(default_factory=list)


class ProfileResponse(ProfileUpsertRequest):
    user_id: int


class AnalysisCreateRequest(BaseModel):
    user_id: int
    photo_url: str = Field(min_length=3, max_length=2000)
    weight: float | None = None


class AnalysisResponse(BaseModel):
    analysis_id: int
    user_id: int
    analysis_date: datetime
    is_first_analysis: bool
    weight: float | None = None
    photo_url: str
    skin_type: str
    facial_proportions: dict


class RecommendationRegenerateRequest(BaseModel):
    user_id: int


class RecommendationItem(BaseModel):
    category: str
    content: dict
    created_at: datetime


class RecommendationListResponse(BaseModel):
    items: list[RecommendationItem]


class WeeklyCompareRequest(BaseModel):
    user_id: int


class ProgressResponse(BaseModel):
    user_id: int
    base_analysis_id: int
    current_analysis_id: int
    delta_weight: float | None = None
    delta_skin_type: str
    delta_metrics: dict
    created_at: datetime


class JobStatusResponse(BaseModel):
    job_id: str
    status: str


class ProgressHistoryResponse(BaseModel):
    user_id: int
    items: list[ProgressResponse]
