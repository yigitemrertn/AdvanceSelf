import json
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, UploadFile, Header
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, get_db
from app.models.entities import User
from app.jobs.in_memory_jobs import job_queue
from app.schemas.contracts import (
    AnalysisCreateRequest,
    AnalysisResponse,
    AuthResponse,
    JobStatusResponse,
    LoginRequest,
    ProgressHistoryResponse,
    ProfileResponse,
    ProfileUpsertRequest,
    ProgressResponse,
    RecommendationItem,
    RecommendationListResponse,
    RecommendationRegenerateRequest,
    RegisterRequest,
    WeeklyCompareRequest,
)
from app.services.domain import (
    create_analysis,
    create_analysis_from_upload,
    create_progress_snapshot,
    generate_recommendations,
    get_analysis,
    get_profile,
    latest_analysis,
    latest_snapshot,
    list_progress_snapshots,
    list_recommendations,
    login_user,
    register_user,
    upsert_profile,
)

router = APIRouter()


def _analysis_to_response(analysis) -> AnalysisResponse:
    return AnalysisResponse(
        analysis_id=analysis.id,
        user_id=analysis.user_id,
        analysis_date=analysis.analysis_date,
        is_first_analysis=analysis.is_first_analysis,
        weight=analysis.weight,
        photo_url=analysis.photo_url,
        skin_type=analysis.skin_type,
        facial_proportions=json.loads(analysis.facial_proportions),
    )


@router.post("/auth/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user_id, token = register_user(db, payload.email, payload.password, payload.full_name)
    return AuthResponse(user_id=user_id, access_token=token)


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user_id, token = login_user(db, payload.email, payload.password)
    return AuthResponse(user_id=user_id, access_token=token)


@router.patch("/users/{user_id}/profile", response_model=ProfileResponse)
def patch_profile(user_id: int, payload: ProfileUpsertRequest, db: Session = Depends(get_db)):
    profile = upsert_profile(db, user_id, payload)
    user = db.query(User).filter(User.id == user_id).first()
    return ProfileResponse(
        user_id=profile.user_id,
        full_name=user.full_name if user else None,
        birth_date=profile.birth_date,
        age=profile.age,
        gender=profile.gender,
        height=profile.height,
        weight=profile.weight,
        body_shape=profile.body_shape,
        face_shape=profile.face_shape,
        preferred_styles=json.loads(profile.preferred_styles or "[]"),
    )


@router.get("/users/{user_id}/profile", response_model=ProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    profile = get_profile(db, user_id)
    user = db.query(User).filter(User.id == user_id).first()
    return ProfileResponse(
        user_id=profile.user_id,
        full_name=user.full_name if user else None,
        birth_date=profile.birth_date,
        age=profile.age,
        gender=profile.gender,
        height=profile.height,
        weight=profile.weight,
        body_shape=profile.body_shape,
        face_shape=profile.face_shape,
        preferred_styles=json.loads(profile.preferred_styles or "[]"),
    )


@router.post("/analyses", response_model=AnalysisResponse)
def create_analysis_endpoint(payload: AnalysisCreateRequest, db: Session = Depends(get_db), x_gemini_key: str | None = Header(None)):
    analysis = create_analysis(db, payload)
    generate_recommendations(db, payload.user_id, analysis.id, gemini_key=x_gemini_key)
    return _analysis_to_response(analysis)


@router.post("/analyses/upload", response_model=AnalysisResponse)
async def create_analysis_upload_endpoint(
    user_id: int = Form(...),
    weight: float | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_gemini_key: str | None = Header(None),
):
    image_bytes = await image.read()
    analysis = create_analysis_from_upload(
        db=db,
        user_id=user_id,
        filename=image.filename or "upload.jpg",
        image_bytes=image_bytes,
        weight=weight,
    )
    generate_recommendations(db, user_id, analysis.id, gemini_key=x_gemini_key)
    return _analysis_to_response(analysis)


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_endpoint(analysis_id: int, db: Session = Depends(get_db)):
    return _analysis_to_response(get_analysis(db, analysis_id))


@router.get("/analyses/latest/{user_id}", response_model=AnalysisResponse)
def get_latest_analysis(user_id: int, db: Session = Depends(get_db)):
    return _analysis_to_response(latest_analysis(db, user_id))


@router.post("/recommendations/regenerate", response_model=RecommendationListResponse)
def regenerate_recommendations(payload: RecommendationRegenerateRequest, db: Session = Depends(get_db), x_gemini_key: str | None = Header(None)):
    analysis = latest_analysis(db, payload.user_id)
    generate_recommendations(db, payload.user_id, analysis.id, gemini_key=x_gemini_key)
    recs = list_recommendations(db, payload.user_id, analysis.id)
    return RecommendationListResponse(items=[RecommendationItem(category=r.category, content=json.loads(r.content), created_at=r.created_at) for r in recs])


@router.get("/recommendations/latest/{user_id}", response_model=RecommendationListResponse)
def get_latest_recommendations(user_id: int, db: Session = Depends(get_db), x_gemini_key: str | None = Header(None)):
    analysis = latest_analysis(db, user_id)
    recs = list_recommendations(db, user_id, analysis.id)
    if not recs:
        recs = generate_recommendations(db, user_id, analysis.id, gemini_key=x_gemini_key)
    return RecommendationListResponse(
        items=[RecommendationItem(category=r.category, content=json.loads(r.content), created_at=r.created_at) for r in recs]
    )


@router.get("/recommendations/{user_id}/{analysis_id}", response_model=RecommendationListResponse)
def get_recommendations_for_analysis(user_id: int, analysis_id: int, db: Session = Depends(get_db)):
    recs = list_recommendations(db, user_id, analysis_id)
    return RecommendationListResponse(
        items=[RecommendationItem(category=r.category, content=json.loads(r.content), created_at=r.created_at) for r in recs]
    )



@router.post("/progress/compare-weekly")
def compare_weekly(payload: WeeklyCompareRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid4())

    def run() -> None:
        worker_db = SessionLocal()
        try:
            create_progress_snapshot(worker_db, payload.user_id)
        finally:
            worker_db.close()

    background_tasks.add_task(job_queue.enqueue, job_id, run)
    return {"job_id": job_id, "status": "queued"}


@router.get("/progress/jobs/{job_id}", response_model=JobStatusResponse)
def get_progress_job(job_id: str):
    return JobStatusResponse(job_id=job_id, status=job_queue.get_status(job_id))


@router.get("/progress/latest/{user_id}", response_model=ProgressResponse)
def get_progress_latest(user_id: int, db: Session = Depends(get_db)):
    snapshot = latest_snapshot(db, user_id)
    return ProgressResponse(
        user_id=snapshot["user_id"],
        base_analysis_id=snapshot["base_analysis_id"],
        current_analysis_id=snapshot["current_analysis_id"],
        delta_weight=snapshot["delta_weight"],
        delta_skin_type=snapshot["delta_skin_type"],
        delta_metrics=snapshot["delta_metrics"],
        created_at=snapshot["created_at"],
    )


@router.get("/progress/history/{user_id}", response_model=ProgressHistoryResponse)
def get_progress_history(user_id: int, limit: int = 12, db: Session = Depends(get_db)):
    snapshots = list_progress_snapshots(db, user_id, limit=max(1, min(limit, 52)))
    items = [
        ProgressResponse(
            user_id=snapshot["user_id"],
            base_analysis_id=snapshot["base_analysis_id"],
            current_analysis_id=snapshot["current_analysis_id"],
            delta_weight=snapshot["delta_weight"],
            delta_skin_type=snapshot["delta_skin_type"],
            delta_metrics=snapshot["delta_metrics"],
            created_at=snapshot["created_at"],
        )
        for snapshot in snapshots
    ]
    return ProgressHistoryResponse(user_id=user_id, items=items)
