from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.routes._recommendation_base import get_recommendation, refresh_recommendation

router = APIRouter(prefix="/clothing", tags=["clothing"])


@router.get("/recommendations")
async def clothing_recommendations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await get_recommendation("clothing", user, db)


@router.post("/refresh")
async def clothing_refresh(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await refresh_recommendation("clothing", user, db)


@router.get("/store-items")
async def clothing_store_items():
    return {"items": [{"name": "Black blazer", "price": 89}, {"name": "Straight jeans", "price": 45}]}
