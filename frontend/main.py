import json
import os
from pathlib import Path

import flet as ft
import requests

API_BASE_URL = os.getenv("ADVANCESELF_API_URL", "http://127.0.0.1:8000/api/v1")
PROJECT_ROOT = Path(__file__).resolve().parent.parent
STYLES_FILE = PROJECT_ROOT / "backend" / "styles.json"

# Stitch-inspired palette (digital couture / deep purple)
BG_COLOR = "#F7F7FF"
SURFACE = "#FFFFFF"
NAVY = "#0A0033"
PURPLE_DEEP = "#2E1065"
PRIMARY = "#5B21B6"
PRIMARY_DARK = "#4C1D95"
ACCENT = "#7C3AED"
TEXT_MAIN = "#0F172A"
TEXT_MUTED = "#64748B"
LAVENDER = "#E0E7FF"
LAVENDER_SOFT = "#EDE9FE"
SUCCESS = "#059669"
ERROR = "#DC2626"
CARD_COLOR = SURFACE

# Stock photos (Unsplash) — demo visuals for empty image slots; replace with CDN assets anytime.
IMG_LOGIN_HERO = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=80"
IMG_LANDING_HERO = "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
IMG_DASH_HAIR = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80"
IMG_DASH_OUTFIT = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
IMG_DASH_ACCESSORY = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
IMG_STEP_SCAN = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80"
IMG_STEP_AI = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
IMG_STEP_CURATE = "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80"


def cover_image(
    src: str,
    *,
    height: int,
    width: int | None = None,
    border_radius: int = 16,
    expand: bool = False,
) -> ft.Container:
    return ft.Container(
        height=height,
        width=width,
        expand=expand,
        border_radius=border_radius,
        clip_behavior=ft.ClipBehavior.ANTI_ALIAS,
        content=ft.Image(src=src, fit=ft.ImageFit.COVER, expand=True, width=width, height=height),
    )


APP_STATE = {
    "token": None,
    "username": "friend",
    "profile": {},
    "recommendations": {},
    "community_feed": [],
    "image_analysis": None,
    "picking_photo": False,
}


def title_text(value: str, size: int = 34) -> ft.Text:
    return ft.Text(value, size=size, weight=ft.FontWeight.W_700, color=TEXT_MAIN)


def subtitle_text(value: str) -> ft.Text:
    return ft.Text(value, size=14, color=TEXT_MUTED)


def section_heading(value: str) -> ft.Text:
    return ft.Text(value, size=20, weight=ft.FontWeight.W_600, color=TEXT_MAIN)


def field(label: str, password: bool = False, width: int = 340, numeric: bool = False) -> ft.TextField:
    return ft.TextField(
        label=label,
        width=width,
        border_radius=12,
        border_color="#DCE2F1",
        focused_border_color=PRIMARY,
        cursor_color=PRIMARY,
        password=password,
        can_reveal_password=password,
        keyboard_type=ft.KeyboardType.NUMBER if numeric else ft.KeyboardType.TEXT,
        text_style=ft.TextStyle(color=TEXT_MAIN),
        label_style=ft.TextStyle(color=TEXT_MUTED),
    )


def card(content: ft.Control, padding: int = 24) -> ft.Container:
    return ft.Container(
        bgcolor=CARD_COLOR,
        border_radius=18,
        padding=padding,
        shadow=ft.BoxShadow(blur_radius=22, color="#14000000", offset=ft.Offset(0, 8)),
        content=content,
    )


def stitch_input(label: str, icon, *, password: bool = False) -> ft.TextField:
    return ft.TextField(
        label=label,
        width=400,
        border_radius=14,
        border_color="#E2E8F0",
        focused_border_color=PRIMARY,
        cursor_color=PRIMARY,
        prefix_icon=icon,
        password=password,
        can_reveal_password=password,
        text_style=ft.TextStyle(color=TEXT_MAIN),
        label_style=ft.TextStyle(color=TEXT_MUTED, size=12, weight=ft.FontWeight.W_500),
        bgcolor=SURFACE,
    )


def api_headers(auth_required: bool = True) -> dict:
    headers = {"Content-Type": "application/json"}
    token = APP_STATE.get("token")
    if auth_required and token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def login_user(email: str, password: str) -> str:
    payload = {"email": email, "password": password}
    response = requests.post(f"{API_BASE_URL}/auth/login", json=payload, timeout=12)
    response.raise_for_status()
    return response.json()["access_token"]


def register_or_login(email: str, username: str, password: str) -> str:
    payload = {"email": email, "username": username, "password": password}
    resp = requests.post(f"{API_BASE_URL}/auth/register", json=payload, timeout=12)
    if resp.status_code in (200, 201):
        return resp.json()["access_token"]
    # If already exists (or similar), fall back to login with the same credentials.
    if resp.status_code == 400:
        login_payload = {"email": email, "password": password}
        login = requests.post(f"{API_BASE_URL}/auth/login", json=login_payload, timeout=12)
        login.raise_for_status()
        return login.json()["access_token"]
    # Raise a useful error for other cases (422 etc.)
    resp.raise_for_status()
    raise RuntimeError("Unexpected auth response")


def error_detail(exc: requests.RequestException) -> str:
    resp = getattr(exc, "response", None)
    if resp is not None:
        try:
            data = resp.json()
            if isinstance(data, dict) and "detail" in data:
                return str(data["detail"])
        except Exception:
            pass
        return f"{resp.status_code} {resp.reason}"
    return str(exc)


def fetch_bootstrap_data() -> None:
    me = requests.get(f"{API_BASE_URL}/auth/me", headers=api_headers(), timeout=12)
    me.raise_for_status()
    APP_STATE["username"] = me.json().get("username", "friend")

    profile = requests.get(f"{API_BASE_URL}/profile/", headers=api_headers(), timeout=12)
    profile.raise_for_status()
    APP_STATE["profile"] = profile.json()

    APP_STATE["recommendations"] = {}
    for category in ["hairstyle", "clothing", "accessories", "moodboard"]:
        resp = requests.get(f"{API_BASE_URL}/{category}/recommendations", headers=api_headers(), timeout=12)
        resp.raise_for_status()
        APP_STATE["recommendations"][category] = resp.json()

    APP_STATE["community_feed"] = []


def refresh_all_recommendations_from_api(page: ft.Page) -> None:
    if not APP_STATE.get("token"):
        navigate(page, "/login")
        return
    try:
        for cat in ("hairstyle", "clothing", "accessories", "moodboard"):
            requests.post(f"{API_BASE_URL}/{cat}/refresh", headers=api_headers(), timeout=25).raise_for_status()
        fetch_bootstrap_data()
        toast(page, "Recommendations refreshed from the server.")
        navigate(page, "/main")
    except requests.RequestException as exc:
        toast(page, f"Refresh failed: {error_detail(exc)}")


def open_detail_dialog(page: ft.Page, title: str, body: str, extra: str = "") -> None:
    def close(_: ft.ControlEvent) -> None:
        if page.dialog:
            page.dialog.open = False
            page.update()

    page.dialog = ft.AlertDialog(
        modal=True,
        title=ft.Text(title, weight=ft.FontWeight.W_700),
        content=ft.Column(
            [ft.Text(body, size=14), ft.Text(extra, size=12, color=TEXT_MUTED)] if extra else [ft.Text(body, size=14)],
            tight=True,
            scroll=ft.ScrollMode.AUTO,
        ),
        actions=[ft.TextButton("Close", on_click=close)],
        actions_alignment=ft.MainAxisAlignment.END,
    )
    page.dialog.open = True
    page.update()


def save_survey_and_fetch_data(profile_payload: dict, preferred_style: str) -> None:
    requests.put(f"{API_BASE_URL}/profile/physical", json=profile_payload, headers=api_headers(), timeout=12).raise_for_status()
    requests.put(
        f"{API_BASE_URL}/profile/preferences",
        json={"preferred_style": preferred_style},
        headers=api_headers(),
        timeout=12,
    ).raise_for_status()
    fetch_bootstrap_data()


def analyze_uploaded_image(image_bytes: bytes, filename: str) -> dict:
    response = requests.post(
        f"{API_BASE_URL}/image/analyze",
        headers={"Authorization": f"Bearer {APP_STATE.get('token')}"},
        files={"file": (filename, image_bytes)},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    APP_STATE["image_analysis"] = payload
    return payload


def has_completed_profile() -> bool:
    profile = APP_STATE.get("profile", {})
    return bool(profile.get("preferred_style") and profile.get("face_shape"))


def logout(page: ft.Page) -> None:
    # Avoid navigating while a native picker dialog is active (can close session mid-await).
    if APP_STATE.get("picking_photo"):
        return
    APP_STATE["token"] = None
    APP_STATE["username"] = "friend"
    APP_STATE["profile"] = {}
    APP_STATE["recommendations"] = {}
    APP_STATE["community_feed"] = []
    APP_STATE["image_analysis"] = None
    navigate(page, "/landing")


def navigate(page: ft.Page, route: str) -> None:
    # NOTE: In Flet 0.84, `Page.push_route` is async and must be awaited.
    # For sync click handlers + simple routing, `go()` remains the most reliable option.
    page.go(route)


def toast(page: ft.Page, message: str) -> None:
    page.snack_bar = ft.SnackBar(ft.Text(message), bgcolor=NAVY)
    page.snack_bar.open = True
    page.update()


def brand_logo_text(size: int = 22) -> ft.Text:
    return ft.Text(
        "Advance Self",
        size=size,
        weight=ft.FontWeight.W_700,
        italic=True,
        color=PURPLE_DEEP,
    )


def nav_link(label: str, on_click) -> ft.TextButton:
    return ft.TextButton(
        label,
        style=ft.ButtonStyle(color=TEXT_MUTED),
        on_click=on_click,
    )


def build_top_nav(
    page: ft.Page,
    *,
    for_app: bool,
    profile: dict | None = None,
    on_refresh_recommendations=None,
) -> ft.Container:
    profile = profile or {}

    def go_landing(_: ft.ControlEvent) -> None:
        navigate(page, "/landing")

    def go_login(_: ft.ControlEvent) -> None:
        navigate(page, "/login")

    def go_main(_: ft.ControlEvent) -> None:
        if APP_STATE.get("token"):
            navigate(page, "/main" if has_completed_profile() else "/survey")
        else:
            navigate(page, "/login")

    def on_get_reco_click(_: ft.ControlEvent) -> None:
        if on_refresh_recommendations is not None:
            on_refresh_recommendations()
        else:
            go_main(_)

    def stub(msg: str):
        def _(_e: ft.ControlEvent) -> None:
            toast(page, msg)

        return _

    right_controls: list[ft.Control] = [
        ft.IconButton(ft.Icons.NOTIFICATIONS_OUTLINED, icon_color=TEXT_MUTED, on_click=stub("No new notifications yet.")),
        ft.IconButton(ft.Icons.AUTO_AWESOME, icon_color=TEXT_MUTED, on_click=stub("AI style tools — stay tuned.")),
        ft.FilledButton(
            "Get Recommendations",
            bgcolor=PRIMARY,
            color="white",
            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=24)),
            on_click=on_get_reco_click,
        ),
    ]
    if for_app and APP_STATE.get("token"):
        initial = (APP_STATE.get("username") or "?")[0].upper()
        right_controls.append(
            ft.Container(
                width=40,
                height=40,
                border_radius=20,
                bgcolor=LAVENDER,
                alignment=ft.Alignment(0, 0),
                content=ft.Text(initial, size=16, weight=ft.FontWeight.W_600, color=PRIMARY_DARK),
            )
        )
    else:
        right_controls.append(ft.TextButton("Log in", style=ft.ButtonStyle(color=ACCENT), on_click=go_login))

    return ft.Container(
        padding=ft.Padding.symmetric(horizontal=24, vertical=16),
        bgcolor=SURFACE,
        border=ft.border.only(bottom=ft.BorderSide(1, "#E2E8F0")),
        content=ft.Row(
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.CENTER,
            controls=[
                ft.Row(
                    spacing=4,
                    controls=[
                        ft.TextButton(content=brand_logo_text(20), style=ft.ButtonStyle(color=PURPLE_DEEP), on_click=go_landing),
                        ft.Container(width=28),
                        *(
                            [
                                nav_link("Home", lambda _: navigate(page, "/main")),
                                nav_link("Our Navigator", lambda _: navigate(page, "/survey")),
                                nav_link("Lookbook", stub("Lookbook — coming soon.")),
                            ]
                            if for_app and APP_STATE.get("token")
                            else [
                                nav_link("Styles", stub("Sign in to personalize your style deck.")),
                                nav_link("Lookbook", stub("Lookbook unlocks after sign-in.")),
                                nav_link("Moodboard", stub("Moodboards appear in your recommendations.")),
                            ]
                        ),
                    ],
                ),
                ft.Row(spacing=8, controls=right_controls),
            ],
        ),
    )


def build_landing_view(page: ft.Page) -> ft.View:
    def go_login(_: ft.ControlEvent) -> None:
        navigate(page, "/login")

    def start_transform(_: ft.ControlEvent) -> None:
        if APP_STATE.get("token"):
            navigate(page, "/main" if has_completed_profile() else "/survey")
        else:
            navigate(page, "/login")

    hero_left = ft.Container(
        expand=1,
        padding=ft.Padding.only(right=24, top=16, bottom=24),
        content=ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.START,
            spacing=16,
            controls=[
                ft.Container(
                    padding=ft.Padding.symmetric(horizontal=14, vertical=8),
                    border_radius=20,
                    bgcolor=LAVENDER,
                    content=ft.Text("AI-Powered Style Intelligence", size=12, weight=ft.FontWeight.W_600, color=PRIMARY_DARK),
                ),
                ft.Text(
                    "Discover Your Digital Couture Identity.",
                    size=40,
                    weight=ft.FontWeight.W_800,
                    color=NAVY,
                ),
                ft.Text(
                    "Facial geometry, tone, and computational taste — personalized hairstyles, outfits, "
                    "and accessories tailored to you.",
                    size=15,
                    color=TEXT_MUTED,
                ),
                ft.Row(
                    spacing=12,
                    controls=[
                        ft.FilledButton(
                            content=ft.Row(
                                [ft.Text("Start Your Transformation", color="white"), ft.Icon(ft.Icons.ARROW_FORWARD, color="white", size=18)],
                                tight=True,
                            ),
                            bgcolor=PRIMARY,
                            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=28), padding=20),
                            on_click=start_transform,
                        ),
                        ft.OutlinedButton(
                            "Explore Moodboards",
                            style=ft.ButtonStyle(
                                color=PRIMARY_DARK,
                                side=ft.BorderSide(1.5, LAVENDER),
                                shape=ft.RoundedRectangleBorder(radius=28),
                                padding=20,
                            ),
                            on_click=go_login,
                        ),
                    ],
                ),
            ],
        ),
    )

    hero_visual = ft.Container(
        expand=1,
        height=420,
        border_radius=28,
        clip_behavior=ft.ClipBehavior.ANTI_ALIAS,
        content=ft.Stack(
            [
                ft.Image(src=IMG_LANDING_HERO, fit=ft.ImageFit.COVER, expand=True, height=420),
                ft.Container(
                    expand=True,
                    gradient=ft.LinearGradient(
                        begin=ft.Alignment(-0.8, -1),
                        end=ft.Alignment(0.8, 1),
                        colors=["#1e1b4b99", "#4c1d9599", "#7c3aed88"],
                    ),
                ),
                ft.Container(
                    padding=20,
                    alignment=ft.Alignment(0, 1),
                    content=ft.Container(
                        padding=16,
                        border_radius=16,
                        bgcolor="#35FFFFFF",
                        content=ft.Row(
                            [
                                ft.Icon(ft.Icons.CHECKROOM, color="white", size=22),
                                ft.Column(
                                    spacing=2,
                                    controls=[
                                        ft.Text("Match Score", size=11, color="#E2E8F0"),
                                        ft.Text("98% Compatibility", size=18, weight=ft.FontWeight.W_700, color="white"),
                                    ],
                                    tight=True,
                                ),
                            ],
                            tight=True,
                        ),
                    ),
                ),
            ],
        ),
    )

    def process_step(icon, title: str, desc: str, photo: str) -> ft.Container:
        return ft.Container(
            expand=1,
            padding=10,
            bgcolor="#FAFAFF",
            border_radius=20,
            border=ft.border.all(1, "#E8E0F5"),
            content=ft.Column(
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                spacing=10,
                controls=[
                    cover_image(photo, height=110, border_radius=14, expand=True),
                    ft.Container(
                        width=48,
                        height=48,
                        border_radius=24,
                        bgcolor=LAVENDER_SOFT,
                        alignment=ft.Alignment(0, 0),
                        content=ft.Icon(icon, color=PRIMARY, size=24),
                    ),
                    ft.Text(title, size=15, weight=ft.FontWeight.W_700, color=NAVY, text_align=ft.TextAlign.CENTER),
                    ft.Text(desc, size=12, color=TEXT_MUTED, text_align=ft.TextAlign.CENTER),
                ],
            ),
        )

    process_card = card(
        ft.Column(
            spacing=20,
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            controls=[
                ft.Text("The Styling Process", size=24, weight=ft.FontWeight.W_700, color=NAVY),
                ft.Text(
                    "Effortless transformation driven by precision intelligence.",
                    size=14,
                    color=TEXT_MUTED,
                ),
                ft.Row(
                    alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                    controls=[
                        process_step(
                            ft.Icons.FACE_RETOUCHING_NATURAL,
                            "Scan & Analyze",
                            "Upload a photo for facial geometry and tone cues.",
                            IMG_STEP_SCAN,
                        ),
                        process_step(
                            ft.Icons.MEMORY,
                            "Compute Aesthetics",
                            "Your profile is mapped to curated fashion signals.",
                            IMG_STEP_AI,
                        ),
                        process_step(
                            ft.Icons.DIAMOND,
                            "Curate & Improve",
                            "Looks you can adopt—hairstyles, outfits, and finishing touches.",
                            IMG_STEP_CURATE,
                        ),
                    ],
                ),
            ],
        ),
        padding=32,
    )

    footer = ft.Container(
        padding=ft.Padding.symmetric(horizontal=24, vertical=28),
        content=ft.Row(
            alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
            vertical_alignment=ft.CrossAxisAlignment.START,
            controls=[
                ft.Column(
                    spacing=4,
                    controls=[
                        brand_logo_text(18),
                        ft.Text("© 2024 Advance Self AI Couture. All rights reserved.", size=11, color=TEXT_MUTED),
                    ],
                    tight=True,
                ),
                ft.Row(
                    spacing=8,
                    wrap=True,
                    controls=[
                        ft.TextButton(
                            "Privacy Policy",
                            style=ft.ButtonStyle(color=ACCENT),
                            on_click=lambda _: toast(page, "Privacy — add your policy URL."),
                        ),
                        ft.TextButton(
                            "Terms of Service",
                            style=ft.ButtonStyle(color=ACCENT),
                            on_click=lambda _: toast(page, "Terms — add your terms URL."),
                        ),
                        ft.TextButton(
                            "AI Ethics",
                            style=ft.ButtonStyle(color=ACCENT),
                            on_click=lambda _: toast(page, "AI ethics — add your statement."),
                        ),
                        ft.TextButton(
                            "Contact",
                            style=ft.ButtonStyle(color=ACCENT),
                            on_click=lambda _: toast(page, "Contact — add support email."),
                        ),
                    ],
                ),
            ],
        ),
    )

    body = ft.Column(
        spacing=0,
        expand=True,
        controls=[
            build_top_nav(page, for_app=False),
            ft.Container(
                padding=ft.Padding.symmetric(horizontal=24, vertical=20),
                content=ft.Column(
                    spacing=24,
                    controls=[
                        ft.ResponsiveRow(
                            columns=12,
                            controls=[
                                ft.Container(col={"xs": 12, "lg": 6}, content=hero_left),
                                ft.Container(col={"xs": 12, "lg": 6}, content=hero_visual),
                            ],
                        ),
                        process_card,
                        footer,
                    ],
                ),
            ),
        ],
    )
    return ft.View(route="/landing", bgcolor=BG_COLOR, padding=0, scroll=ft.ScrollMode.AUTO, controls=[body])


def load_style_options() -> list[str]:
    try:
        with STYLES_FILE.open("r", encoding="utf-8") as f:
            styles_data = json.load(f)
        return [d["name"] for d in styles_data if "name" in d]
    except Exception:
        return ["Preppy", "Minimalist", "Goth Punk"]


def build_login_view(page: ft.Page) -> ft.View:
    username_field = stitch_input("Username", ft.Icons.PERSON_OUTLINE)
    email_field = stitch_input("Email address", ft.Icons.EMAIL_OUTLINED)
    password_field = stitch_input("Password", ft.Icons.LOCK_OUTLINE, password=True)
    feedback = ft.Text("", size=13, color=ERROR)

    def login_click(_: ft.ControlEvent) -> None:
        try:
            email = (email_field.value or "").strip()
            password = (password_field.value or "").strip()
            if not email or not password:
                raise ValueError("Email ve password zorunlu.")
            APP_STATE["token"] = login_user(email, password)
            fetch_bootstrap_data()
            navigate(page, "/main" if has_completed_profile() else "/survey")
        except ValueError as exc:
            feedback.value = str(exc)
            feedback.color = ERROR
            page.update()
        except requests.RequestException as exc:
            feedback.value = f"Giris basarisiz: {error_detail(exc)}"
            feedback.color = ERROR
            page.update()

    def register_click(_: ft.ControlEvent) -> None:
        try:
            username = (username_field.value or "").strip()
            email = (email_field.value or "").strip()
            password = (password_field.value or "").strip()
            if not username or not email or not password:
                raise ValueError("Register icin username/email/password gerekli.")
            APP_STATE["token"] = register_or_login(email, username, password)
            fetch_bootstrap_data()
            feedback.value = "Kayit basarili. Simdi survey doldur."
            feedback.color = SUCCESS
            navigate(page, "/survey")
        except ValueError as exc:
            feedback.value = str(exc)
            feedback.color = ERROR
            page.update()
        except requests.RequestException as exc:
            feedback.value = f"Kayit basarisiz: {error_detail(exc)}"
            feedback.color = ERROR
            page.update()

    left_panel = ft.Container(
        expand=1,
        height=640,
        clip_behavior=ft.ClipBehavior.ANTI_ALIAS,
        content=ft.Stack(
            [
                ft.Image(src=IMG_LOGIN_HERO, fit=ft.ImageFit.COVER, expand=True, height=640),
                ft.Container(
                    expand=True,
                    gradient=ft.LinearGradient(
                        begin=ft.Alignment(-0.5, -1),
                        end=ft.Alignment(0.2, 1),
                        colors=["#020617cc", "#1e1b4bdd", "#4c1d95cc"],
                    ),
                ),
                ft.Container(
                    padding=40,
                    alignment=ft.Alignment(-1, 1),
                    content=ft.Column(
                        alignment=ft.MainAxisAlignment.END,
                        horizontal_alignment=ft.CrossAxisAlignment.START,
                        spacing=12,
                        controls=[
                            ft.Text("Digital Couture.", size=36, weight=ft.FontWeight.W_800, color="white"),
                            ft.Text(
                                "Experience personalized style recommendations powered by cutting-edge computational intelligence.",
                                size=15,
                                color="#E2E8F0",
                            ),
                            ft.Container(height=24),
                        ],
                    ),
                ),
            ],
        ),
    )

    form_card = ft.Container(
        width=460,
        padding=36,
        bgcolor=SURFACE,
        border_radius=24,
        shadow=ft.BoxShadow(blur_radius=40, color="#25000018", offset=ft.Offset(0, 18)),
        content=ft.Column(
            horizontal_alignment=ft.CrossAxisAlignment.START,
            spacing=18,
            controls=[
                brand_logo_text(22),
                ft.Text("Welcome Back", size=26, weight=ft.FontWeight.W_800, color=NAVY),
                ft.Text(
                    "Log in to access your personalized digital wardrobe.",
                    size=13,
                    color=TEXT_MUTED,
                ),
                username_field,
                email_field,
                password_field,
                feedback,
                ft.FilledButton(
                    content=ft.Row(
                        [
                            ft.Text("Log In", size=15, weight=ft.FontWeight.W_600, color="white"),
                            ft.Icon(ft.Icons.ARROW_FORWARD, color="white", size=20),
                        ],
                        alignment=ft.MainAxisAlignment.CENTER,
                    ),
                    width=400,
                    height=52,
                    bgcolor=NAVY,
                    style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=28)),
                    on_click=login_click,
                ),
                ft.Divider(height=1, color="#E2E8F0"),
                ft.Row(
                    alignment=ft.MainAxisAlignment.CENTER,
                    controls=[
                        ft.TextButton(
                            "Forgot password?",
                            style=ft.ButtonStyle(color=ACCENT),
                            on_click=lambda _: toast(page, "Password reset — connect your email flow here."),
                        ),
                    ],
                ),
                ft.Row(
                    alignment=ft.MainAxisAlignment.CENTER,
                    controls=[
                        ft.Text("Don't have an account? ", size=13, color=TEXT_MUTED),
                        ft.TextButton(
                            "Sign up",
                            style=ft.ButtonStyle(color=ACCENT),
                            on_click=register_click,
                        ),
                    ],
                ),
                ft.TextButton(
                    "Back to home",
                    style=ft.ButtonStyle(color=TEXT_MUTED),
                    on_click=lambda _: navigate(page, "/landing"),
                ),
            ],
        ),
    )

    right_slot = ft.Container(
        expand=1,
        bgcolor=BG_COLOR,
        alignment=ft.Alignment(0, 0),
        padding=32,
        content=form_card,
    )

    row = ft.Row(spacing=0, expand=True, controls=[left_panel, right_slot])

    return ft.View(route="/login", bgcolor=BG_COLOR, padding=0, controls=[row])


def build_survey_view(page: ft.Page) -> ft.View:
    styles = load_style_options()
    feedback = ft.Text("", size=13, color=ERROR)

    gender_group = ft.RadioGroup(
        value="male",
        content=ft.Row(
            spacing=16,
            controls=[
                ft.Radio(value="male", label="Male"),
                ft.Radio(value="female", label="Female"),
                ft.Radio(value="unspecified", label="Prefer not to say"),
            ],
        ),
    )
    height_field = field("Height (cm)", numeric=True)
    weight_field = field("Weight (kg)", numeric=True)
    age_field = field("Age", numeric=True)
    face_shape = ft.Dropdown(
        width=340,
        border_radius=12,
        border_color="#DCE2F1",
        focused_border_color=PRIMARY,
        label="Face Shape",
        options=[ft.dropdown.Option(x) for x in ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong", "Triangle"]],
    )
    preferred_style = ft.Dropdown(
        width=340,
        border_radius=12,
        border_color="#DCE2F1",
        focused_border_color=PRIMARY,
        label="Preferred Style",
        options=[ft.dropdown.Option(x) for x in styles],
    )

    def to_int_or_none(raw: str | None) -> int | None:
        value = (raw or "").strip()
        if not value:
            return None
        return int(value)

    def submit_survey(_: ft.ControlEvent) -> None:
        try:
            if not APP_STATE.get("token"):
                raise ValueError("Once login olmalisin.")
            if not face_shape.value:
                raise ValueError("Face shape secmelisin.")
            if not preferred_style.value:
                raise ValueError("Preferred style secmelisin.")

            payload = {
                "gender": gender_group.value or "unspecified",
                "height_cm": to_int_or_none(height_field.value),
                "weight_kg": to_int_or_none(weight_field.value),
                "age": to_int_or_none(age_field.value),
                "face_shape": face_shape.value,
            }
            save_survey_and_fetch_data(payload, preferred_style.value)
            navigate(page, "/main")
        except ValueError as exc:
            feedback.value = str(exc)
            feedback.color = ERROR
            page.update()
        except requests.RequestException as exc:
            feedback.value = f"Survey kayit hatasi: {error_detail(exc)}"
            feedback.color = ERROR
            page.update()

    container = card(
        ft.Column(
            spacing=14,
            horizontal_alignment=ft.CrossAxisAlignment.START,
            controls=[
                title_text("Complete your style profile", 30),
                subtitle_text("These details personalize all recommendations."),
                gender_group,
                height_field,
                weight_field,
                age_field,
                face_shape,
                preferred_style,
                feedback,
                ft.Row(
                    spacing=10,
                    controls=[
                        ft.FilledButton(
                            "Save and Continue",
                            bgcolor=PRIMARY,
                            color="white",
                            style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=12)),
                            on_click=submit_survey,
                        ),
                        ft.TextButton("Back to home", on_click=lambda _: navigate(page, "/landing")),
                    ],
                ),
            ],
        )
    )

    return ft.View(route="/survey", bgcolor=BG_COLOR, padding=32, controls=[container])


def build_reco_card(title: str, icon: str, body: str) -> ft.Container:
    return card(
        ft.Column(
            spacing=10,
            controls=[
                ft.Row(
                    controls=[
                        ft.Text(icon, size=22),
                        ft.Text(title, size=17, weight=ft.FontWeight.W_600, color=TEXT_MAIN),
                    ]
                ),
                ft.Text(body, size=13, color=TEXT_MUTED),
            ],
        ),
        padding=18,
    )


def _palette_from_payload(payload: dict, fallback: list[str]) -> list[str]:
    raw = payload.get("colors")
    if isinstance(raw, list) and raw:
        return [str(c) for c in raw[:8]]
    return fallback


def _cuts_from_payload(payload: dict) -> list[str]:
    raw = payload.get("cuts")
    if isinstance(raw, list) and raw:
        return [str(c) for c in raw]
    items = payload.get("items") or []
    return [str(x.get("name", "")) for x in items if x.get("name")]


def _story_paragraph(text: str, width: int = 880) -> ft.Container:
    return ft.Container(
        width=width,
        content=ft.Text(text, size=14, color=TEXT_MUTED, text_align=ft.TextAlign.CENTER),
    )


def build_three_tall_cards(items: list[dict], *, icon: str, empty_label: str) -> ft.Row:
    slots = list(items or [])[:3]
    while len(slots) < 3:
        slots.append({"name": empty_label, "reason": ""})
    out: list[ft.Control] = []
    for it in slots:
        name = (it.get("name") or empty_label).strip() or empty_label
        reason = (it.get("reason") or "").strip()
        out.append(
            ft.Container(
                expand=1,
                height=240,
                border_radius=18,
                padding=16,
                gradient=ft.LinearGradient(
                    begin=ft.Alignment(-1, -1),
                    end=ft.Alignment(1, 1),
                    colors=["#E8E5FF", "#FFE8F4"],
                ),
                content=ft.Column(
                    alignment=ft.MainAxisAlignment.CENTER,
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                    spacing=8,
                    controls=[
                        ft.Text(icon, size=34),
                        ft.Text(
                            name,
                            size=15,
                            weight=ft.FontWeight.W_600,
                            color=TEXT_MAIN,
                            text_align=ft.TextAlign.CENTER,
                        ),
                        ft.Text(
                            reason or "—",
                            size=12,
                            color=TEXT_MUTED,
                            text_align=ft.TextAlign.CENTER,
                        ),
                    ],
                ),
            )
        )
    return ft.Row(spacing=12, run_spacing=12, controls=out)


def chic_palette_swatches(hex_colors: list[str]) -> ft.Row:
    row_controls: list[ft.Control] = []
    for c in hex_colors:
        safe = c if isinstance(c, str) and c.startswith("#") and len(c) >= 4 else "#94A3B8"
        label = safe.upper()[:7]
        row_controls.append(
            ft.Container(
                width=104,
                height=104,
                border_radius=26,
                border=ft.border.all(3, "#FFFFFF"),
                shadow=ft.BoxShadow(blur_radius=18, color="#28000018", offset=ft.Offset(0, 8)),
                clip_behavior=ft.ClipBehavior.ANTI_ALIAS,
                content=ft.Stack(
                    [
                        ft.Container(expand=True, bgcolor=safe),
                        ft.Container(
                            expand=True,
                            gradient=ft.LinearGradient(
                                begin=ft.Alignment(0, -1),
                                end=ft.Alignment(0, 1),
                                colors=["#FFFFFF55", "#00000025"],
                            ),
                        ),
                        ft.Container(
                            padding=10,
                            alignment=ft.Alignment(1, 1),
                            content=ft.Text(label, size=11, weight=ft.FontWeight.W_700, color="white"),
                        ),
                    ],
                ),
            )
        )
    return ft.Row(
        spacing=16,
        wrap=True,
        alignment=ft.MainAxisAlignment.CENTER,
        controls=row_controls,
    )


def build_flow_section(title: str, body_controls: list[ft.Control]) -> ft.Container:
    return ft.Container(
        width=960,
        padding=ft.Padding.only(bottom=8, top=12),
        content=ft.Column(
            spacing=14,
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            controls=[
                ft.Text(title, size=26, weight=ft.FontWeight.W_700, color=NAVY, text_align=ft.TextAlign.CENTER),
                *body_controls,
            ],
        ),
    )


def build_main_view(page: ft.Page) -> ft.View:
    if not APP_STATE.get("token"):
        navigate(page, "/landing")
        return ft.View(route="/main", bgcolor=BG_COLOR, controls=[ft.Container()])

    profile = APP_STATE.get("profile", {})
    recs = APP_STATE.get("recommendations", {})
    analysis = (APP_STATE.get("image_analysis") or {}).get("analysis", {})

    hair_payload = recs.get("hairstyle", {}).get("payload", {})
    cloth_payload = recs.get("clothing", {}).get("payload", {})
    acc_payload = recs.get("accessories", {}).get("payload", {})
    mood_payload = recs.get("moodboard", {}).get("payload", {})

    hair_items: list[dict] = list(hair_payload.get("items") or [])
    while len(hair_items) < 3:
        hair_items.append({"name": "Hairstyle idea", "reason": "Personalized pick coming soon."})

    cuts = _cuts_from_payload(cloth_payload)
    cuts_display = ", ".join(cuts) if cuts else "Tailored layers and clean proportions."
    palette = _palette_from_payload(cloth_payload, ["#5B4BFF", "#FF5FA2", "#20B26C", "#FFB703"])
    palette_note = cloth_payload.get("palette_note") if isinstance(cloth_payload.get("palette_note"), str) else None
    if not palette_note:
        palette_note = "Prefer these tones for clothing; you can combine them freely."

    acc_items: list[dict] = list(acc_payload.get("items") or [])
    while len(acc_items) < 3:
        acc_items.append({"name": "Accessory idea", "reason": "Small detail, big cohesion."})

    moodboard_text = mood_payload.get("title", "Moodboard recommendation")
    moodboard_body = ", ".join(
        f"{x.get('name', '')}: {x.get('reason', '')}" for x in (mood_payload.get("items") or [])[:3]
    ) or "Direction for your visual references."

    analysis_feedback = ft.Text("", size=13, color=ERROR)

    async def pick_and_analyze() -> None:
        try:
            APP_STATE["picking_photo"] = True
            # Ephemeral picker only — hosting FilePicker on page.overlay triggers "Unknown control: FilePicker" on some Flet 0.8x clients.
            picked = await ft.FilePicker().pick_files(
                dialog_title="Select outfit photo",
                file_type=ft.FilePickerFileType.CUSTOM,
                allowed_extensions=["png", "jpg", "jpeg", "webp"],
                allow_multiple=False,
                with_data=True,
            )
            if not picked:
                analysis_feedback.value = "No photo selected."
                analysis_feedback.color = ERROR
                page.update()
                return

            pf = picked[0]
            name = getattr(pf, "name", None) or getattr(pf, "file_name", None) or "upload.jpg"

            blob = getattr(pf, "bytes", None)
            if blob:
                analyze_uploaded_image(blob, name)
                analysis_feedback.value = "Photo analyzed successfully."
                analysis_feedback.color = SUCCESS
                page.update()
                return

            path_attr = getattr(pf, "path", None)
            if path_attr:
                with open(path_attr, "rb") as image_file:
                    analyze_uploaded_image(image_file.read(), name)
                analysis_feedback.value = "Photo analyzed successfully."
                analysis_feedback.color = SUCCESS
                page.update()
                return

            analysis_feedback.value = "Could not read selected photo (with_data/path missing)."
            analysis_feedback.color = ERROR
            page.update()
        except requests.RequestException as exc:
            analysis_feedback.value = f"Analyze hatasi: {error_detail(exc)}"
            analysis_feedback.color = ERROR
            page.update()
        except RuntimeError as exc:
            # Typical when the page session is torn down mid-dialog (route change / app close).
            analysis_feedback.value = f"Analyze iptal: {exc}"
            analysis_feedback.color = ERROR
            page.update()
        finally:
            APP_STATE["picking_photo"] = False

    async def on_upload_click(_e) -> None:
        await pick_and_analyze()

    def info_pill(icon, label: str, value: str) -> ft.Container:
        return ft.Container(
            padding=ft.Padding.symmetric(horizontal=18, vertical=14),
            border_radius=18,
            bgcolor=SURFACE,
            border=ft.border.all(1, "#E2E8F0"),
            shadow=ft.BoxShadow(blur_radius=14, color="#1200000a", offset=ft.Offset(0, 4)),
            content=ft.Row(
                [
                    ft.Icon(icon, color=PRIMARY, size=22),
                    ft.Column(
                        [
                            ft.Text(label, size=11, color=TEXT_MUTED),
                            ft.Text(value or "—", size=15, weight=ft.FontWeight.W_700, color=NAVY),
                        ],
                        tight=True,
                        spacing=2,
                    ),
                ],
                spacing=12,
            ),
        )

    hair0 = hair_items[0]
    hair_title = hair0.get("name", "Your signature look")
    hair_desc = hair0.get("reason", "")
    cloth_list = list(cloth_payload.get("items") or [])
    while len(cloth_list) < 2:
        cloth_list.append({"name": "Core piece", "reason": "Layered anchor for your palette."})

    def side_piece_card(tag: str, item: dict, h: int, photo: str) -> ft.Container:
        nm = item.get("name", "")
        rs = item.get("reason", "")
        return ft.Container(
            height=h,
            border_radius=22,
            bgcolor=SURFACE,
            shadow=ft.BoxShadow(blur_radius=24, color="#18000012", offset=ft.Offset(0, 10)),
            padding=14,
            clip_behavior=ft.ClipBehavior.ANTI_ALIAS,
            content=ft.Column(
                expand=True,
                spacing=10,
                controls=[
                    ft.Container(
                        padding=ft.Padding.symmetric(horizontal=10, vertical=4),
                        border_radius=12,
                        bgcolor=LAVENDER_SOFT,
                        content=ft.Text(tag, size=11, weight=ft.FontWeight.W_600, color=PRIMARY_DARK),
                    ),
                    ft.Text(nm, size=16, weight=ft.FontWeight.W_700, color=NAVY),
                    ft.Text(rs, size=12, color=TEXT_MUTED, max_lines=2),
                    ft.Container(
                        expand=True,
                        border_radius=14,
                        clip_behavior=ft.ClipBehavior.ANTI_ALIAS,
                        content=ft.Image(src=photo, fit=ft.ImageFit.COVER, expand=True),
                    ),
                ],
            ),
        )

    large_feature = ft.Container(
        expand=2,
        height=440,
        border_radius=28,
        clip_behavior=ft.ClipBehavior.ANTI_ALIAS,
        content=ft.Stack(
            [
                ft.Image(src=IMG_DASH_HAIR, fit=ft.ImageFit.COVER, expand=True, height=440),
                ft.Container(
                    expand=True,
                    gradient=ft.LinearGradient(
                        begin=ft.Alignment(0, -0.4),
                        end=ft.Alignment(0, 1),
                        colors=["#1e1b4b00", "#1e1b4bcc", "#0f172ae6"],
                    ),
                ),
                ft.Container(
                    padding=22,
                    expand=True,
                    content=ft.Column(
                        alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                        expand=True,
                        controls=[
                            ft.Row(
                                [
                                    ft.Container(
                                        padding=ft.Padding.symmetric(horizontal=12, vertical=6),
                                        border_radius=20,
                                        bgcolor="#45FFFFFF",
                                        content=ft.Row(
                                            [
                                                ft.Icon(ft.Icons.CONTENT_CUT, color="white", size=16),
                                                ft.Text("Hairstyle idea", color="white", size=12, weight=ft.FontWeight.W_600),
                                            ],
                                            tight=True,
                                            spacing=6,
                                        ),
                                    ),
                                ]
                            ),
                            ft.Container(
                                padding=18,
                                border_radius=18,
                                bgcolor="#80000000",
                                content=ft.Column(
                                    spacing=10,
                                    controls=[
                                        ft.Text(hair_title, size=22, weight=ft.FontWeight.W_700, color="white"),
                                        ft.Text(hair_desc, size=13, color="#E2E8F0"),
                                        ft.OutlinedButton(
                                            "View details",
                                            style=ft.ButtonStyle(
                                                color="white",
                                                side=ft.BorderSide(1, "white"),
                                                shape=ft.RoundedRectangleBorder(radius=20),
                                            ),
                                            on_click=lambda _: open_detail_dialog(
                                                page,
                                                hair_title,
                                                hair_desc,
                                                "\n".join(str(n) for n in (hair_payload.get("notes") or []) if n),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                        ],
                    ),
                ),
            ],
        ),
    )

    acc0 = acc_items[0] if acc_items else {"name": "Accessory", "reason": ""}
    right_stack = ft.Column(
        expand=1,
        spacing=12,
        controls=[
            side_piece_card("Outfit pick", cloth_list[0], 204, IMG_DASH_OUTFIT),
            side_piece_card("Accessory", acc0, 204, IMG_DASH_ACCESSORY),
        ],
    )

    feature_row = ft.Row(
        spacing=20,
        run_spacing=16,
        controls=[large_feature, right_stack],
    )

    dashboard_header = ft.Column(
        spacing=18,
        controls=[
            build_top_nav(
                page,
                for_app=True,
                profile=profile,
                on_refresh_recommendations=lambda: refresh_all_recommendations_from_api(page),
            ),
            ft.Container(
                padding=ft.Padding.symmetric(horizontal=8),
                content=ft.Column(
                    spacing=14,
                    controls=[
                        ft.Text(
                            f"Welcome, {APP_STATE.get('username', 'friend')}",
                            size=34,
                            weight=ft.FontWeight.W_800,
                            color=NAVY,
                        ),
                        ft.Row(
                            wrap=True,
                            spacing=12,
                            controls=[
                                info_pill(ft.Icons.STYLE_OUTLINED, "Style", str(profile.get("preferred_style") or "—")),
                                info_pill(ft.Icons.FACE_OUTLINED, "Face shape", str(profile.get("face_shape") or "—")),
                            ],
                        ),
                        feature_row,
                        ft.Row(
                            spacing=10,
                            wrap=True,
                            controls=[
                                ft.FilledButton(
                                    "Refresh recommendations",
                                    bgcolor=PRIMARY_DARK,
                                    color="white",
                                    style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=24)),
                                    on_click=lambda _: refresh_all_recommendations_from_api(page),
                                ),
                                ft.FilledButton(
                                    "Upload photo to analyze",
                                    bgcolor=PRIMARY,
                                    color="white",
                                    style=ft.ButtonStyle(shape=ft.RoundedRectangleBorder(radius=24)),
                                    on_click=on_upload_click,
                                ),
                                ft.OutlinedButton(
                                    "Edit survey",
                                    style=ft.ButtonStyle(
                                        color=PRIMARY_DARK,
                                        side=ft.BorderSide(1, "#C4B5FD"),
                                        shape=ft.RoundedRectangleBorder(radius=24),
                                    ),
                                    on_click=lambda _: navigate(page, "/survey"),
                                ),
                                ft.TextButton(
                                    "Log out",
                                    style=ft.ButtonStyle(color=TEXT_MUTED),
                                    on_click=lambda _: logout(page),
                                ),
                            ],
                        ),
                        analysis_feedback,
                    ],
                ),
            ),
        ],
    )

    hair_lines = "\n".join(
        f"• {it.get('name', '—')}: {it.get('reason', '').strip() or '—'}" for it in hair_items[:6]
    )
    acc_lines = "\n".join(
        f"• {it.get('name', '—')}: {it.get('reason', '').strip() or '—'}" for it in acc_items[:6]
    )

    plan_card = card(
        ft.Column(
            spacing=12,
            controls=[
                ft.Text("Your style plan", size=20, weight=ft.FontWeight.W_700, color=NAVY),
                ft.Text("Hairstyles", size=13, weight=ft.FontWeight.W_600, color=TEXT_MAIN),
                ft.Text(hair_lines, size=13, color=TEXT_MUTED),
                ft.Divider(height=1, color="#E2E8F0"),
                ft.Text("Outfits — cuts & palette", size=13, weight=ft.FontWeight.W_600, color=TEXT_MAIN),
                ft.Text(cuts_display, size=13, color=TEXT_MUTED),
                ft.Text(palette_note, size=12, color=TEXT_MUTED),
                chic_palette_swatches(palette),
                ft.Divider(height=1, color="#E2E8F0"),
                ft.Text("Accessories", size=13, weight=ft.FontWeight.W_600, color=TEXT_MAIN),
                ft.Text(acc_lines, size=13, color=TEXT_MUTED),
                ft.Divider(height=1, color="#E2E8F0"),
                ft.Text("Moodboard", size=13, weight=ft.FontWeight.W_600, color=TEXT_MAIN),
                ft.Text(f"{moodboard_text} — {moodboard_body}", size=13, color=TEXT_MUTED),
            ],
        ),
        padding=22,
    )

    analysis_card = build_reco_card(
        "Photo Analysis",
        "📷",
        analysis.get("fit_feedback", "Upload a photo for instant style analysis."),
    )
    analysis_extra = ft.Text(
        f"Vibe: {analysis.get('dominant_vibe', '-')} | Hint: {analysis.get('face_shape_hint', '-')}",
        size=13,
        color=TEXT_MUTED,
    )

    analysis_block = ft.Container(
        width=1040,
        content=ft.Column(
            spacing=8,
            controls=[
                ft.Text("Photo analysis", size=20, weight=ft.FontWeight.W_700, color=NAVY),
                analysis_card,
                ft.Container(content=analysis_extra, padding=ft.Padding.only(left=4)),
            ],
        ),
    )

    inner = ft.Column(
        spacing=20,
        controls=[
            dashboard_header,
            plan_card,
            analysis_block,
        ],
    )

    body = ft.Container(
        width=1080,
        padding=ft.Padding.symmetric(horizontal=20, vertical=16),
        content=inner,
    )
    return ft.View(
        route="/main",
        bgcolor=BG_COLOR,
        padding=0,
        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        scroll=ft.ScrollMode.AUTO,
        controls=[body],
    )


def main(page: ft.Page) -> None:
    page.title = "Advance Self"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.bgcolor = BG_COLOR
    if not getattr(page, "web", False):
        page.window_min_width = 980
        page.window_min_height = 700
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.padding = 0
    try:
        page.fonts = {
            "Inter": "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Regular.woff2",
        }
        page.theme = ft.Theme(font_family="Inter")
    except Exception:
        page.theme = ft.Theme()

    def route_change(_e) -> None:
        page.views.clear()
        if page.route == "/landing":
            page.views.append(build_landing_view(page))
        elif page.route == "/login":
            page.views.append(build_login_view(page))
        elif page.route == "/survey":
            page.views.append(build_survey_view(page))
        elif page.route == "/main":
            page.views.append(build_main_view(page))
        else:
            navigate(page, "/landing")
            return
        page.update()

    page.on_route_change = route_change
    navigate(page, "/landing")


if __name__ == "__main__":
    import sys

    run_web = os.environ.get("ADVANCESELF_WEB", "").lower() in ("1", "true", "yes") or "--web" in sys.argv
    port = int(os.environ.get("ADVANCESELF_WEB_PORT", "8550"))
    web_host = (os.environ.get("ADVANCESELF_WEB_HOST") or "").strip() or None
    if run_web:
        run_kw: dict = {"view": ft.AppView.WEB_BROWSER, "port": port}
        if web_host:
            run_kw["host"] = web_host
        ft.run(main, **run_kw)
    else:
        ft.run(main)
