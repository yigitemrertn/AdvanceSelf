import json
from datetime import datetime

from app.models import Profile


def mock_recommendation_for(category: str, profile: Profile | None) -> dict:
    style = profile.preferred_style if profile and profile.preferred_style else "Minimalist"
    face = profile.face_shape if profile and profile.face_shape else "Oval"
    generated_at = datetime.utcnow().isoformat()
    base = {
        "title": f"{category.title()} recommendations",
        "style": style,
        "notes": [
            f"Face shape: {face}",
            "This payload is deterministic mock data for MVP delivery.",
        ],
        "generated_at": generated_at,
    }

    if category == "hairstyle":
        return {
            **base,
            "items": [
                {"name": "Soft layers around the face", "reason": f"Balances {face} proportions"},
                {"name": "Side part with movement", "reason": "Adds structure without harsh lines"},
                {"name": "Textured crop or lob", "reason": f"Keeps the {style} energy without looking stiff"},
            ],
        }

    if category == "clothing":
        return {
            **base,
            "cuts": [
                "Tailored slim fit through the shoulder",
                "Straight or relaxed leg (not overly skinny)",
                "Cropped or structured outer layer for clean lines",
            ],
            "colors": ["#5B4BFF", "#FF5FA2", "#20B26C", "#FFB703", "#845EF7"],
            "palette_note": "You can mix these freely; keep one piece as the 'hero' color.",
            "items": [
                {"name": "Structured base layer", "reason": f"Grounds the {style} silhouette"},
                {"name": "Statement outer piece", "reason": "Adds contrast and texture"},
            ],
        }

    if category == "accessories":
        return {
            **base,
            "items": [
                {"name": "Slim metal watch or bracelet", "reason": "Refines wrist line without noise"},
                {"name": "Medium-scale earrings or chain", "reason": f"Echoes {style} attitude"},
                {"name": "Clean belt or bag in a palette color", "reason": "Pulls the outfit together"},
            ],
        }

    if category == "moodboard":
        return {
            **base,
            "title": "Moodboard direction",
            "items": [
                {"name": "Reference mood", "reason": f"{style} lighting and proportions"},
                {"name": "Texture mix", "reason": "Matte + one shine surface"},
            ],
        }

    return {
        **base,
        "items": [
            {"name": "Core piece", "reason": f"Matches {style} vibe"},
            {"name": "Accent item", "reason": "Adds contrast and texture"},
        ],
    }


def parse_payload(payload: str) -> dict:
    return json.loads(payload)


def dump_payload(payload: dict) -> str:
    return json.dumps(payload, ensure_ascii=True)
