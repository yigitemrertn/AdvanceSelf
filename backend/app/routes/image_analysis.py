import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import ImageAnalysis, Profile, User
from app.schemas import ImageAnalysisOut

router = APIRouter(prefix="/image", tags=["image"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _serialize_analysis(row: ImageAnalysis) -> ImageAnalysisOut:
    return ImageAnalysisOut(
        id=row.id,
        file_name=row.file_name,
        dominant_vibe=row.dominant_vibe,
        face_shape_hint=row.face_shape_hint,
        fit_feedback=row.fit_feedback,
        style_score=row.style_score,
        color_suggestions=json.loads(row.color_suggestions) if row.color_suggestions else [],
        next_actions=json.loads(row.next_actions) if row.next_actions else [],
        created_at=row.created_at,
    )


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image files are accepted.")

    ext = Path(file.filename or "image").suffix or ".jpg"
    safe_name = f"{user.id}_{uuid4().hex}{ext}"
    target = UPLOAD_DIR / safe_name

    content = await file.read()
    target.write_bytes(content)

    profile_result = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = profile_result.scalar_one_or_none()
    preferred_style = profile.preferred_style if profile and profile.preferred_style else "Minimalist"
    face_shape = profile.face_shape if profile and profile.face_shape else "Oval"
    gender = profile.gender if profile and profile.gender else "unspecified"

    # Generate a deterministic style score from profile completeness.
    score_base = 72
    if profile:
        if profile.preferred_style:
            score_base += 5
        if profile.face_shape:
            score_base += 4
        if profile.height_cm:
            score_base += 3
        if profile.skin_tone:
            score_base += 4
        if profile.age:
            score_base += 2
    style_score = min(score_base, 98)

    color_suggestions = ["#5B4BFF", "#FF5FA2", "#20B26C", "#FFB703", "#845EF7"]
    next_actions = [
        f"Try a stronger contrast top to frame your {face_shape.lower()} face better.",
        "Use one statement accessory and keep other elements minimal.",
        f"Experiment with {preferred_style}-inspired layering for added depth.",
        "Consider matching shoe tones with your outerwear for a polished look.",
    ]

    fit_feedback = (
        f"Your photo aligns well with a {preferred_style} style direction. "
        f"Based on your {face_shape} face shape, we recommend styles that "
        f"{'soften angular lines' if face_shape in ('Square', 'Diamond', 'Triangle') else 'add structure and definition'}. "
        f"Overall style compatibility score: {style_score}%."
    )

    face_shape_hint = (
        f"Detected profile context suggests {face_shape} face-shape styling. "
        f"{'Opt for rounded collars and soft layers.' if face_shape in ('Square', 'Diamond') else ''}"
        f"{'V-necks and structured cuts work well.' if face_shape in ('Round', 'Oval') else ''}"
        f"{'Heart shapes benefit from wider necklines.' if face_shape == 'Heart' else ''}"
    ).strip()

    # Persist analysis result
    analysis_row = ImageAnalysis(
        user_id=user.id,
        file_name=file.filename or "upload",
        stored_path=str(target),
        dominant_vibe=preferred_style,
        face_shape_hint=face_shape_hint,
        fit_feedback=fit_feedback,
        style_score=style_score,
        color_suggestions=json.dumps(color_suggestions),
        next_actions=json.dumps(next_actions),
    )
    db.add(analysis_row)
    await db.commit()
    await db.refresh(analysis_row)

    return {
        "file_name": file.filename,
        "stored_as": str(target),
        "analysis": {
            "id": analysis_row.id,
            "dominant_vibe": preferred_style,
            "fit_feedback": fit_feedback,
            "face_shape_hint": face_shape_hint,
            "style_score": style_score,
            "color_suggestions": color_suggestions,
            "next_actions": next_actions,
        },
    }


@router.get("/analysis")
async def get_latest_analysis(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(ImageAnalysis)
        .where(ImageAnalysis.user_id == user.id)
        .order_by(desc(ImageAnalysis.created_at))
    )
    row = result.scalars().first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No analysis found. Upload a photo first.")
    return {"analysis": _serialize_analysis(row).model_dump(mode="json")}


@router.get("/analysis/history")
async def get_analysis_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
) -> list[dict]:
    result = await db.execute(
        select(ImageAnalysis)
        .where(ImageAnalysis.user_id == user.id)
        .order_by(desc(ImageAnalysis.created_at))
        .limit(min(limit, 50))
    )
    return [_serialize_analysis(row).model_dump(mode="json") for row in result.scalars().all()]
