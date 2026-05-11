from datetime import datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    birth_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(32), nullable=True)
    height: Mapped[float | None] = mapped_column(Float, nullable=True)
    body_shape: Mapped[str | None] = mapped_column(String(50), nullable=True)
    face_shape: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_styles: Mapped[str | None] = mapped_column(Text, nullable=True)


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    analysis_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    is_first_analysis: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    photo_url: Mapped[str] = mapped_column(Text, nullable=False)
    skin_type: Mapped[str] = mapped_column(String(64), nullable=False)
    facial_proportions: Mapped[str] = mapped_column(Text, nullable=False)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class ProgressSnapshot(Base):
    __tablename__ = "progress_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    base_analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), nullable=False)
    current_analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), nullable=False)
    delta_weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    delta_skin_type: Mapped[str] = mapped_column(String(64), nullable=False)
    delta_metrics: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
