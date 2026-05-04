from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.routes._recommendation_base import get_recommendation, refresh_recommendation

router = APIRouter(prefix="/accessories", tags=["accessories"])


@router.get("/recommendations")
async def accessories_recommendations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_recommendation("accessories", user, db)


@router.post("/refresh")
async def accessories_refresh(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await refresh_recommendation("accessories", user, db)


@router.get("/store-items")
async def accessories_store_items():
    return {"items": [{"name": "Silver ring", "price": 24}, {"name": "Chain necklace", "price": 39}]}
