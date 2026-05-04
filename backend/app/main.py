from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routes import accessories, auth, chat, clothing, community, hairstyle, image_analysis, moodboard, profile


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(profile.router, prefix=settings.api_prefix)
app.include_router(chat.router, prefix=settings.api_prefix)
app.include_router(clothing.router, prefix=settings.api_prefix)
app.include_router(accessories.router, prefix=settings.api_prefix)
app.include_router(hairstyle.router, prefix=settings.api_prefix)
app.include_router(moodboard.router, prefix=settings.api_prefix)
app.include_router(community.router, prefix=settings.api_prefix)
app.include_router(image_analysis.router, prefix=settings.api_prefix)


@app.get(f"{settings.api_prefix}/health")
async def health() -> dict:
    return {"ok": True}
