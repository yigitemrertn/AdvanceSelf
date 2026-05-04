from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Profile, User
from app.schemas import PhysicalProfileUpdate, PreferenceUpdate, ProfileOut

router = APIRouter(prefix="/profile", tags=["profile"])


async def _get_or_create_profile(db: AsyncSession, user_id: int) -> Profile:
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if profile is None:
        profile = Profile(user_id=user_id)
        db.add(profile)
        await db.flush()
    return profile


@router.get("/", response_model=ProfileOut)
async def get_profile(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> ProfileOut:
    profile = await _get_or_create_profile(db, user.id)
    await db.commit()
    await db.refresh(profile)
    return ProfileOut.model_validate(profile)


@router.put("/physical", response_model=ProfileOut)
async def update_physical(
    payload: PhysicalProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    profile = await _get_or_create_profile(db, user.id)
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, key, value)
    await db.commit()
    await db.refresh(profile)
    return ProfileOut.model_validate(profile)


@router.put("/preferences", response_model=ProfileOut)
async def update_preferences(
    payload: PreferenceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileOut:
    profile = await _get_or_create_profile(db, user.id)
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, key, value)
    await db.commit()
    await db.refresh(profile)
    return ProfileOut.model_validate(profile)
