import json
import os
from pathlib import Path
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timezone
import httpx

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.entities import Analysis, Recommendation, User, UserProfile
from app.schemas.contracts import AnalysisCreateRequest, ProfileUpsertRequest
from app.services.mediapipe_service import extract_face_features_from_bytes

CATEGORIES = ["skin_care", "style", "makeup", "accessory", "looksmax"]


def register_user(db: Session, email: str, password: str) -> tuple[int, str]:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email is already registered")
    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user.id, create_access_token(str(user.id))


def login_user(db: Session, email: str, password: str) -> tuple[int, str]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user.id, create_access_token(str(user.id))


def upsert_profile(db: Session, user_id: int, payload: ProfileUpsertRequest) -> UserProfile:
    if not db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first() or UserProfile(user_id=user_id)
    db.add(profile)
    profile.birth_date = payload.birth_date
    profile.gender = payload.gender
    profile.height = payload.height
    profile.body_shape = payload.body_shape
    profile.face_shape = payload.face_shape
    profile.preferred_styles = json.dumps(payload.preferred_styles)
    db.commit()
    db.refresh(profile)
    return profile


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _read_image_bytes_from_photo_url(photo_url: str) -> bytes:
    if photo_url.startswith("http://") or photo_url.startswith("https://"):
        response = httpx.get(photo_url, timeout=20.0)
        response.raise_for_status()
        return response.content
    if os.path.isfile(photo_url):
        return Path(photo_url).read_bytes()
    raise HTTPException(
        status_code=422,
        detail="photo_url is not reachable by backend. For mobile, use /analyses/upload endpoint.",
    )


def _extract_face_features(photo_url: str) -> tuple[str, dict]:
    image_bytes = _read_image_bytes_from_photo_url(photo_url)
    try:
        return extract_face_features_from_bytes(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def create_analysis(db: Session, payload: AnalysisCreateRequest) -> Analysis:
    if not payload.photo_url.strip():
        raise HTTPException(status_code=422, detail="photo_url is required")
    if not db.query(User).filter(User.id == payload.user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    previous_count = db.query(Analysis).filter(Analysis.user_id == payload.user_id).count()
    skin_type, facial_proportions = _extract_face_features(payload.photo_url)
    analysis = Analysis(
        user_id=payload.user_id,
        is_first_analysis=previous_count == 0,
        weight=payload.weight,
        photo_url=payload.photo_url,
        skin_type=skin_type,
        facial_proportions=json.dumps(facial_proportions),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


def create_analysis_from_upload(
    db: Session,
    user_id: int,
    filename: str,
    image_bytes: bytes,
    weight: float | None = None,
) -> Analysis:
    safe_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}_{filename.replace(' ', '_')}"
    saved_path = UPLOAD_DIR / safe_name
    saved_path.write_bytes(image_bytes)
    payload = AnalysisCreateRequest(user_id=user_id, photo_url=str(saved_path), weight=weight)
    return create_analysis(db, payload)


def get_analysis(db: Session, analysis_id: int) -> Analysis:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


def latest_analysis(db: Session, user_id: int) -> Analysis:
    analysis = db.query(Analysis).filter(Analysis.user_id == user_id).order_by(desc(Analysis.analysis_date)).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found")
    return analysis


def _gemini_stub(analysis: Analysis, category: str) -> dict:
    # Gemini integration point: replace stub with model call + JSON schema validation.
    base_text = f"{category} recommendation based on skin type {analysis.skin_type}"
    return {
        "title": category.replace("_", " ").title(),
        "summary": base_text,
        "confidence": 0.82,
        "actions": ["Apply SPF every morning", "Track routine consistency for 7 days"],
    }


def _build_gemini_prompt(analysis: Analysis, category: str, profile: UserProfile | None = None) -> str:
    prompt = (
        "You are a beauty, style, and looksmaxing recommendation assistant.\n"
        "Return ONLY valid JSON with keys: title, summary, confidence, actions.\n"
        "actions must be an array of short strings.\n"
        f"Category: {category}\n"
        f"Weight: {analysis.weight}\n"
        f"Skin type: {analysis.skin_type}\n"
        f"Facial and Organ Proportions (Score out of 100): {analysis.facial_proportions}\n"
    )
    if profile:
        prompt += (
            f"User Profile Info:\n"
            f"- Gender: {profile.gender}\n"
            f"- Height: {profile.height} cm\n"
            f"- Body Shape: {profile.body_shape}\n"
            f"- Face Shape: {profile.face_shape}\n"
            f"- Preferred Styles: {profile.preferred_styles}\n"
        )
    prompt += "Language: Turkish.\n"
    return prompt


def _gemini_generate(analysis: Analysis, category: str, profile: UserProfile | None = None) -> dict:
    if not settings.enable_real_gemini or not settings.gemini_api_key:
        return _gemini_stub(analysis, category)
    try:
        from google import genai

        client = genai.Client(api_key=settings.gemini_api_key)
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=_build_gemini_prompt(analysis, category, profile),
            config={"temperature": 0.2},
        )
        text = (response.text or "").strip()  # type: ignore[attr-defined]
        if text.startswith("```"):
            text = text.strip("`")
            text = text.replace("json", "", 1).strip()
        parsed = json.loads(text)
        return parsed
    except Exception:
        return _fallback_recommendation(category)


def _fallback_recommendation(category: str) -> dict:
    return {
        "title": category.replace("_", " ").title(),
        "summary": "Fallback recommendation generated from deterministic rules",
        "confidence": 0.6,
        "actions": ["Maintain a simple daily routine", "Re-evaluate after 7 days"],
    }


def _coerce_recommendation_schema(payload: dict, category: str) -> dict:
    required = {"title", "summary", "confidence", "actions"}
    if not required.issubset(payload):
        return _fallback_recommendation(category)
    if not isinstance(payload["actions"], list) or not payload["actions"]:
        return _fallback_recommendation(category)
    return payload


def generate_recommendations(db: Session, user_id: int, analysis_id: int) -> list[Recommendation]:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == user_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    items: list[Recommendation] = []
    for category in CATEGORIES:
        content = _coerce_recommendation_schema(_gemini_generate(analysis, category, profile), category)
        item = Recommendation(user_id=user_id, analysis_id=analysis_id, category=category, content=json.dumps(content))
        db.add(item)
        items.append(item)
    db.commit()
    for item in items:
        db.refresh(item)
    return items


def list_recommendations(db: Session, user_id: int, analysis_id: int) -> list[Recommendation]:
    return db.query(Recommendation).filter(Recommendation.user_id == user_id, Recommendation.analysis_id == analysis_id).all()


def compare_latest_vs_first(db: Session, user_id: int) -> dict:
    first_analysis = db.query(Analysis).filter(Analysis.user_id == user_id).order_by(asc(Analysis.analysis_date)).first()
    latest = db.query(Analysis).filter(Analysis.user_id == user_id).order_by(desc(Analysis.analysis_date)).first()
    if not first_analysis or not latest:
        raise HTTPException(status_code=404, detail="Not enough analyses for comparison")
    if first_analysis.id == latest.id:
        raise HTTPException(status_code=400, detail="At least two analyses are required")
    delta_weight = None
    if first_analysis.weight is not None and latest.weight is not None:
        delta_weight = round(latest.weight - first_analysis.weight, 2)
    delta_metrics = {"baseline_skin_type": first_analysis.skin_type, "current_skin_type": latest.skin_type}
    return {
        "user_id": user_id,
        "base_analysis_id": first_analysis.id,
        "current_analysis_id": latest.id,
        "delta_weight": delta_weight,
        "delta_skin_type": f"{first_analysis.skin_type}->{latest.skin_type}",
        "delta_metrics": delta_metrics,
        "created_at": datetime.now(timezone.utc),
    }


def latest_snapshot(db: Session, user_id: int) -> dict:
    return compare_latest_vs_first(db, user_id)
