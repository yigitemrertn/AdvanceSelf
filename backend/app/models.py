from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    gender: Mapped[str] = mapped_column(String(20), default="unspecified")
    height_cm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    face_shape: Mapped[str | None] = mapped_column(String(40), nullable=True)
    body_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    preferred_style: Mapped[str | None] = mapped_column(String(80), nullable=True)
    skin_tone: Mapped[str | None] = mapped_column(String(40), nullable=True)

    user: Mapped[User] = relationship(back_populates="profile")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(20))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CommunityOutfit(Base):
    __tablename__ = "community_outfits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    style_tag: Mapped[str] = mapped_column(String(80), default="general")
    likes: Mapped[int] = mapped_column(Integer, default=0)
    anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ImageAnalysis(Base):
    __tablename__ = "image_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    file_name: Mapped[str] = mapped_column(String(255))
    stored_path: Mapped[str] = mapped_column(String(500))
    dominant_vibe: Mapped[str] = mapped_column(String(80), default="Minimalist")
    face_shape_hint: Mapped[str] = mapped_column(String(120), nullable=True)
    fit_feedback: Mapped[str] = mapped_column(Text)
    style_score: Mapped[int] = mapped_column(Integer, default=75)
    color_suggestions: Mapped[str] = mapped_column(Text, default="[]")
    next_actions: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
