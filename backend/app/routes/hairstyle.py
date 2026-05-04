from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.routes._recommendation_base import get_recommendation, refresh_recommendation

router = APIRouter(prefix="/hairstyle", tags=["hairstyle"])


@router.get("/recommendations")
async def hairstyle_recommendations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_recommendation("hairstyle", user, db)


@router.post("/refresh")
async def hairstyle_refresh(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await refresh_recommendation("hairstyle", user, db)
