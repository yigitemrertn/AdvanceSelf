from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import CommunityOutfit, User
from app.schemas import CommunityPostIn, CommunityPostOut

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/feed", response_model=list[CommunityPostOut])
async def feed(page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)) -> list[CommunityPostOut]:
    page = max(1, page)
    limit = max(1, min(50, limit))
    result = await db.execute(
        select(CommunityOutfit)
        .order_by(CommunityOutfit.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return [CommunityPostOut.model_validate(row) for row in result.scalars().all()]


@router.post("/post", response_model=CommunityPostOut)
async def post_outfit(
    payload: CommunityPostIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommunityPostOut:
    row = CommunityOutfit(
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        style_tag=payload.style_tag,
        anonymous=payload.anonymous,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return CommunityPostOut.model_validate(row)


@router.post("/{post_id}/like")
async def like_post(post_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(CommunityOutfit).where(CommunityOutfit.id == post_id))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Post not found")
    row.likes += 1
    await db.commit()
    return {"id": row.id, "likes": row.likes}
