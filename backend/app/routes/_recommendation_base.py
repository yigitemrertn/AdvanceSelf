from datetime import datetime

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Profile, Recommendation, User
from app.schemas import RecommendationOut
from app.services import dump_payload, mock_recommendation_for, parse_payload


async def _profile_for_user(db: AsyncSession, user_id: int) -> Profile | None:
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    return result.scalar_one_or_none()


async def get_recommendation(category: str, user: User, db: AsyncSession) -> RecommendationOut:
    cached = await db.execute(
        select(Recommendation)
        .where(Recommendation.user_id == user.id, Recommendation.category == category)
        .order_by(desc(Recommendation.created_at))
    )
    row = cached.scalars().first()
    if row:
        return RecommendationOut(category=category, payload=parse_payload(row.payload), created_at=row.created_at)
    return await refresh_recommendation(category, user, db)


async def refresh_recommendation(category: str, user: User, db: AsyncSession) -> RecommendationOut:
    profile = await _profile_for_user(db, user.id)
    payload = mock_recommendation_for(category, profile)
    rec = Recommendation(user_id=user.id, category=category, payload=dump_payload(payload))
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return RecommendationOut(category=category, payload=payload, created_at=rec.created_at or datetime.utcnow())
