from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.routes._recommendation_base import get_recommendation, refresh_recommendation

router = APIRouter(prefix="/moodboard", tags=["moodboard"])


@router.get("/recommendations")
async def moodboard_recommendations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_recommendation("moodboard", user, db)


@router.post("/refresh")
async def moodboard_refresh(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await refresh_recommendation("moodboard", user, db)
