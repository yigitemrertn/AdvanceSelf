from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import ChatMessage, User
from app.schemas import ChatMessageIn, ChatMessageOut

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageOut)
async def send_message(
    payload: ChatMessageIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatMessageOut:
    user_msg = ChatMessage(user_id=user.id, role="user", message=payload.message)
    assistant_text = "Stil hedefin icin su an mock danisman yaniti donuyor. Sonraki adimda LLM baglanacak."
    assistant_msg = ChatMessage(user_id=user.id, role="assistant", message=assistant_text)
    db.add_all([user_msg, assistant_msg])
    await db.commit()
    await db.refresh(assistant_msg)
    return ChatMessageOut.model_validate(assistant_msg)


@router.get("/history", response_model=list[ChatMessageOut])
async def get_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[ChatMessageOut]:
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.user_id == user.id).order_by(ChatMessage.created_at.asc())
    )
    return [ChatMessageOut.model_validate(row) for row in result.scalars().all()]


@router.delete("/history")
async def clear_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> dict:
    await db.execute(delete(ChatMessage).where(ChatMessage.user_id == user.id))
    await db.commit()
    return {"ok": True}
