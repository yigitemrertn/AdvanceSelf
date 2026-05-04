from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    model_config = {"from_attributes": True}


class PhysicalProfileUpdate(BaseModel):
    gender: str | None = None
    height_cm: int | None = None
    weight_kg: int | None = None
    age: int | None = None
    face_shape: str | None = None
    body_type: str | None = None
    skin_tone: str | None = None


class PreferenceUpdate(BaseModel):
    preferred_style: str | None = None


class ProfileOut(BaseModel):
    gender: str | None = None
    height_cm: int | None = None
    weight_kg: int | None = None
    age: int | None = None
    face_shape: str | None = None
    body_type: str | None = None
    preferred_style: str | None = None
    skin_tone: str | None = None

    model_config = {"from_attributes": True}


class ChatMessageIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatMessageOut(BaseModel):
    role: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RecommendationOut(BaseModel):
    category: str
    payload: dict
    created_at: datetime


class CommunityPostIn(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=5, max_length=2000)
    style_tag: str = "general"
    anonymous: bool = True


class CommunityPostOut(BaseModel):
    id: int
    title: str
    description: str
    style_tag: str
    likes: int
    anonymous: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ImageAnalysisOut(BaseModel):
    id: int
    file_name: str
    dominant_vibe: str
    face_shape_hint: str | None = None
    fit_feedback: str
    style_score: int
    color_suggestions: list[str] = []
    next_actions: list[str] = []
    created_at: datetime

    model_config = {"from_attributes": True}
