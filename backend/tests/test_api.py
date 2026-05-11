from fastapi.testclient import TestClient
from uuid import uuid4
import io
import cv2
import numpy as np

from app.main import app

client = TestClient(app)

def build_test_jpeg_bytes() -> bytes:
    image = np.zeros((128, 128, 3), dtype=np.uint8)
    cv2.circle(image, (64, 64), 20, (255, 255, 255), -1)
    ok, encoded = cv2.imencode(".jpg", image)
    assert ok
    return encoded.tobytes()


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    openapi = client.get("/openapi.json")
    assert openapi.status_code == 200


def test_register_and_login_flow():
    email = f"{uuid4()}@example.com"
    register = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "secret123"},
    )
    assert register.status_code == 200
    assert register.json()["access_token"]

    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "secret123"},
    )
    assert login.status_code == 200
    assert login.json()["user_id"] == register.json()["user_id"]

    profile = client.get(f"/api/v1/users/{register.json()['user_id']}/profile")
    assert profile.status_code == 200
    assert profile.json()["user_id"] == register.json()["user_id"]


def test_analysis_recommendation_and_progress_flow():
    jpeg_bytes = build_test_jpeg_bytes()
    email = f"{uuid4()}@example.com"
    register = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "secret123"},
    )
    user_id = register.json()["user_id"]

    profile = client.patch(
        f"/api/v1/users/{user_id}/profile",
        json={
            "gender": "female",
            "body_shape": "hourglass",
            "face_shape": "oval",
            "preferred_styles": ["minimal"],
        },
    )
    assert profile.status_code == 200

    first_analysis = client.post(
        "/api/v1/analyses/upload",
        data={"user_id": str(user_id), "weight": "65.2"},
        files={"image": ("selfie_1.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")},
    )
    assert first_analysis.status_code == 200
    assert first_analysis.json()["is_first_analysis"] is True

    second_analysis = client.post(
        "/api/v1/analyses/upload",
        data={"user_id": str(user_id), "weight": "64.7"},
        files={"image": ("selfie_2.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")},
    )
    assert second_analysis.status_code == 200
    assert second_analysis.json()["is_first_analysis"] is False

    recommendations = client.post("/api/v1/recommendations/regenerate", json={"user_id": user_id})
    assert recommendations.status_code == 200
    assert len(recommendations.json()["items"]) >= 5

    compare = client.post("/api/v1/progress/compare-weekly", json={"user_id": user_id})
    assert compare.status_code == 200
    assert compare.json()["status"] == "queued"
    assert compare.json()["job_id"]

    job_id = compare.json()["job_id"]
    job_status = client.get(f"/api/v1/progress/jobs/{job_id}")
    assert job_status.status_code == 200
    assert job_status.json()["status"] in {"queued", "running", "completed"}

    latest_progress = client.get(f"/api/v1/progress/latest/{user_id}")
    assert latest_progress.status_code == 200
    assert "delta_weight" in latest_progress.json()

    latest_recommendations = client.get(f"/api/v1/recommendations/latest/{user_id}")
    assert latest_recommendations.status_code == 200
    assert len(latest_recommendations.json()["items"]) >= 5

    progress_history = client.get(f"/api/v1/progress/history/{user_id}")
    assert progress_history.status_code == 200
    assert progress_history.json()["user_id"] == user_id
    assert len(progress_history.json()["items"]) >= 1
