# Advance Self — AI Style Consultant

A full-stack personalized **Imagemaker / Style Consultant** application powered by AI. The system analyzes your physical profile and style preferences to generate clothing recommendations, accessory pairings, hairstyle guides, visual moodboards, and image-based style analysis.

> **Core Philosophy**: Enhance your natural physical traits through optimized clothing, accessories, and grooming — not physical modifications.

---

## Architecture Overview

```
AdvanceSelf/
├── backend/          # FastAPI · Python · SQLite (async) · SQLAlchemy 2.0
└── frontend/         # Flet (Python) — desktop & web UI
```

```
Flet UI (Desktop / Web) ──► FastAPI (Port 8000) ──► SQLite / PostgreSQL
                                    │
                                    └──► (Optional) LLM API for recommendations
```

All data exchange between frontend and backend is **strict JSON** over REST.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Python 3.11+, Flet 0.84+ (desktop & web) |
| Backend | Python 3.11+, FastAPI, async SQLAlchemy 2.0 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (python-jose), pbkdf2_sha256 (passlib) |
| Image Analysis | Server-side analysis with style scoring |

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Auth credentials (email, username, hashed password) |
| `profiles` | Height, weight, body type, face shape, style preference |
| `recommendations` | Cached recommendation outputs keyed by user + category |
| `chat_messages` | Full chat history per user |
| `community_outfits` | Anonymous outfit posts with likes |
| `image_analyses` | Image analysis results with style scores |

---

## Application Pages

| Route | Page |
|---|---|
| `/landing` | Public landing page with hero and process overview |
| `/login` | Login / Register split-screen |
| `/survey` | Physical profile + style preference survey |
| `/main` | Dashboard — recommendations, photo upload, style plan |
| `/analysis` | Dedicated image analysis results with score, palette, and actions |

---

## Setup Guide

### Prerequisites

- Python 3.11+
- (Optional) PostgreSQL 15 for production

---

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
copy .env.example .env
# Edit .env — set JWT_SECRET_KEY
```

#### Environment Variables (`.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./advanceself.db` (default) | ✅ |
| `JWT_SECRET_KEY` | Long random string for signing JWTs | ✅ |
| `JWT_ALGORITHM` | Default: `HS256` | ✅ |
| `JWT_EXPIRE_MINUTES` | Default: `43200` (30 days) | ✅ |
| `DEBUG` | Default: `true` | ❌ |

```bash
# Seed the database (creates tables + seed user + community posts)
python seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Seed user credentials:**
- Email: `alex@advanceself.dev`
- Password: `gothic123!`

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
pip install -r requirements.txt

# Run as desktop app
python main.py

# Or run as web app
python main.py --web
```

Frontend (web mode): [http://localhost:8550](http://localhost:8550)

---

## API Reference (Summary)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/profile/
PUT    /api/v1/profile/physical
PUT    /api/v1/profile/preferences

POST   /api/v1/chat/message
GET    /api/v1/chat/history
DELETE /api/v1/chat/history

GET    /api/v1/clothing/recommendations
POST   /api/v1/clothing/refresh
GET    /api/v1/clothing/store-items

GET    /api/v1/accessories/recommendations
POST   /api/v1/accessories/refresh
GET    /api/v1/accessories/store-items

GET    /api/v1/hairstyle/recommendations
POST   /api/v1/hairstyle/refresh

GET    /api/v1/moodboard/recommendations
POST   /api/v1/moodboard/refresh

POST   /api/v1/image/analyze
GET    /api/v1/image/analysis
GET    /api/v1/image/analysis/history

GET    /api/v1/community/feed?page=1&limit=10
POST   /api/v1/community/post
POST   /api/v1/community/{id}/like

GET    /api/v1/health
```

---

## Production Checklist

- [ ] Set a strong `JWT_SECRET_KEY` (32+ random chars)
- [ ] Set `DEBUG=false`
- [ ] Use Alembic migrations instead of `create_all` (`alembic init migrations && alembic revision --autogenerate`)
- [ ] Move to httpOnly cookies for JWT (more secure than localStorage)
- [ ] Add rate limiting (e.g., `slowapi`) on auth and image endpoints
- [ ] Configure proper CORS origins
- [ ] Deploy behind a reverse proxy (nginx/Caddy)
- [ ] Switch to PostgreSQL for production

---

## Folder Structure (Backend)

```
backend/
├── app/
│   ├── main.py          # FastAPI app, CORS, router registration, lifespan
│   ├── config.py        # Pydantic Settings (env vars)
│   ├── database.py      # Async SQLAlchemy engine + session factory + Base
│   ├── models.py        # SQLAlchemy ORM models (6 tables)
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── dependencies.py  # get_db, get_current_user, create_access_token
│   ├── services.py      # Mock recommendation generator
│   └── routes/
│       ├── auth.py
│       ├── profile.py
│       ├── chat.py
│       ├── clothing.py
│       ├── accessories.py
│       ├── hairstyle.py
│       ├── moodboard.py
│       ├── community.py
│       ├── image_analysis.py
│       └── _recommendation_base.py   # Shared get/refresh factory
├── seed.py              # DB seeder
├── styles.json          # Style options data
└── requirements.txt
```

## Folder Structure (Frontend)

```
frontend/
├── main.py              # Flet application — all views and routing
├── requirements.txt     # flet, requests
├── run_web.bat           # Windows batch launcher
└── run_web.ps1           # PowerShell launcher
```
