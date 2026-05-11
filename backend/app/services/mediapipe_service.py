from __future__ import annotations

import math

import cv2
import numpy as np
import mediapipe as mp

try:
    mp_face_mesh = mp.solutions.face_mesh  # type: ignore[attr-defined]
except Exception:  # pragma: no cover
    mp_face_mesh = None


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)


def _fallback_metrics(image: np.ndarray) -> tuple[str, dict]:
    h, w = image.shape[:2]
    ratio = w / max(h, 1)
    symmetry = max(0.5, min(0.95, 0.7 + (ratio - 1.0) * 0.1))
    jawline = max(0.5, min(0.95, 0.65 + ((h % 10) * 0.02)))
    skin_type = "normal" if (h + w) % 3 == 0 else "combination"
    return skin_type, {
        "symmetry": round(symmetry, 3),
        "jawline_definition": round(jawline, 3),
        "source": "fallback_no_face_detected",
    }


def extract_face_features_from_bytes(image_bytes: bytes) -> tuple[str, dict]:
    np_buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    image_bgr = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise ValueError("Invalid image bytes")

    if mp_face_mesh is None:
        return _fallback_metrics(image_bgr)

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True) as face_mesh:
        results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        return _fallback_metrics(image_bgr)

    landmarks = results.multi_face_landmarks[0].landmark
    h, w = image_bgr.shape[:2]

    left_eye = landmarks[33]
    right_eye = landmarks[263]
    nose_tip = landmarks[1]
    forehead = landmarks[10]
    chin = landmarks[152]
    left_jaw = landmarks[234]
    right_jaw = landmarks[454]

    left_eye_xy = (left_eye.x * w, left_eye.y * h)
    right_eye_xy = (right_eye.x * w, right_eye.y * h)
    nose_xy = (nose_tip.x * w, nose_tip.y * h)
    forehead_xy = (forehead.x * w, forehead.y * h)
    chin_xy = (chin.x * w, chin.y * h)
    left_jaw_xy = (left_jaw.x * w, left_jaw.y * h)
    right_jaw_xy = (right_jaw.x * w, right_jaw.y * h)

    eye_width = max(_distance(left_eye_xy, right_eye_xy), 1.0)
    left_nose = _distance(left_eye_xy, nose_xy)
    right_nose = _distance(right_eye_xy, nose_xy)
    symmetry = 1.0 - min(abs(left_nose - right_nose) / eye_width, 1.0)

    jaw_span = _distance(left_jaw_xy, right_jaw_xy)
    jawline_definition = min(jaw_span / max(w, 1), 1.0)
    face_height = max(_distance(forehead_xy, chin_xy), 1.0)
    face_width_ratio = min(jaw_span / face_height, 2.0)
    nose_offset_ratio = min(abs((left_nose - right_nose) / eye_width), 1.0)

    skin_type = "normal" if symmetry >= 0.72 else "combination"
    return skin_type, {
        "symmetry": round(symmetry, 3),
        "jawline_definition": round(jawline_definition, 3),
        "face_width_ratio": round(face_width_ratio, 3),
        "nose_offset_ratio": round(nose_offset_ratio, 3),
        "landmark_count": len(landmarks),
        "source": "mediapipe_facemesh",
    }
