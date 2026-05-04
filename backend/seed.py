import asyncio

from sqlalchemy import select

from app.database import SessionLocal, engine
from app.dependencies import hash_password
from app.models import Base, CommunityOutfit, Profile, User


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        existing_user = await db.execute(select(User).where(User.email == "alex@advanceself.dev"))
        demo = existing_user.scalar_one_or_none()
        if demo is None:
            demo = User(username="alex", email="alex@advanceself.dev", password_hash=hash_password("gothic123!"))
            db.add(demo)
            await db.flush()
            db.add(
                Profile(
                    user_id=demo.id,
                    gender="male",
                    face_shape="Oval",
                    preferred_style="Goth Punk",
                    height_cm=180,
                    weight_kg=74,
                )
            )
            for i in range(1, 7):
                db.add(
                    CommunityOutfit(
                        user_id=demo.id,
                        title=f"Outfit #{i}",
                        description="Seeded community look",
                        style_tag="goth-punk",
                        likes=i * 2,
                    )
                )
            await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
