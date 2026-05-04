from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Profile, User

router = APIRouter(prefix="/image", tags=["image"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


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

    # Placeholder analysis response so the flow is demo-ready.
    return {
        "file_name": file.filename,
        "stored_as": str(target),
        "analysis": {
            "dominant_vibe": preferred_style,
            "fit_feedback": f"Photo aligns with {preferred_style} direction.",
            "face_shape_hint": f"Detected profile context suggests {face_shape} face-shape styling.",
            "next_actions": [
                "Try a stronger contrast top to frame your face better.",
                "Use one statement accessory and keep other elements minimal.",
            ],
        },
    }
