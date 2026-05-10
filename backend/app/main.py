from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.config import settings
from app.core.database import Base, engine
from app.models import entities  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)
app.include_router(router, prefix=settings.api_prefix)
Path("uploads").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}
