# Advance Self — AI Style Consultant

A full-stack personalized **Imagemaker / Style Consultant** web application powered by an LLM. The system analyzes your physical profile and style preferences to generate clothing recommendations, accessory pairings, hairstyle guides, and visual moodboards.

> **Core Philosophy**: Enhance your natural physical traits through optimized clothing, accessories, and grooming — not physical modifications.

---

## Architecture Overview

```
AdvanceSelf/
├── backend/          # FastAPI · Python · PostgreSQL · Groq LLM
└── frontend/         # Next.js 14 (App Router) · Tailwind CSS
```

```
Browser ──► Next.js (Port 3000) ──► FastAPI (Port 8000) ──► PostgreSQL
                                           │
                                           └──► Groq API (Llama 3.3-70B)
```

All data exchange between frontend, backend, and LLM is **strict JSON**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand, Axios |
| Backend | Python 3.11+, FastAPI, async SQLAlchemy 2.0 |
| Database | PostgreSQL 15 |
| LLM | Groq API (Llama 3.3-70B) — free tier |
| Auth | JWT (python-jose), bcrypt (passlib) |

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Auth credentials (email, username, hashed password) |
| `physical_profiles` | Height, weight, body type, face shape |
| `style_preferences` | Target style, dominant colors, accessory & hair prefs |
| `ai_recommendations` | Cached LLM outputs keyed by user + category |
| `chat_messages` | Full chat history per user |
| `community_outfits` | Anonymous outfit posts with likes |

---

## Application Pages

| Route | Page |
|---|---|
| `/login` | Email/password login |
| `/register` | Account creation |
| `/dashboard` | Home with style identity banner |
| `/dashboard/chat` | AI style advisor chat |
| `/dashboard/clothing` | Color palettes, cuts & daily outfit combo |
| `/dashboard/accessories` | Jewelry & accessory recommendations |
| `/dashboard/hairstyle` | Face-shape matched hairstyle guide |
| `/dashboard/moodboard` | Pinterest-style aesthetic image grid |
| `/dashboard/community` | Anonymous outfit feed |

---

## Setup Guide

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15 running locally
- (Optional) Groq API key — [https://console.groq.com](https://console.groq.com)

---

### 1. Database

```sql
-- In psql or pgAdmin
CREATE DATABASE advanceself;
```

---

### 2. Backend

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
# Edit .env — set DATABASE_URL, JWT_SECRET_KEY, and optionally GROQ_API_KEY
```

#### Environment Variables (`.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@localhost:5432/advanceself` | ✅ |
| `JWT_SECRET_KEY` | Long random string for signing JWTs | ✅ |
| `JWT_ALGORITHM` | Default: `HS256` | ✅ |
| `JWT_EXPIRE_MINUTES` | Default: `43200` (30 days) | ✅ |
| `GROQ_API_KEY` | Get free at console.groq.com | ❌ (mock fallback used if absent) |
| `GROQ_MODEL` | Default: `llama-3.3-70b-versatile` | ❌ |
| `DEBUG` | Default: `true` | ❌ |
| `CORS_ORIGINS` | Default: `["http://localhost:3000"]` | ❌ |

```bash
# Seed the database (creates tables + seed user + 12 community posts)
python seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Seed user credentials:**
- Email: `alex@advanceself.dev`
- Password: `gothic123!`

---

### 3. Frontend

```bash
cd frontend

# Install dependencies (already done if scaffolded)
npm install

# Configure environment
# Create .env.local with:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend: [http://localhost:3000](http://localhost:3000)

---

## LLM Integration

The `LLMService` class (`backend/app/llm_service.py`) handles all AI interactions:

- **Context injection**: Every prompt receives the user's full physical profile and style preferences.
- **JSON enforcement**: Recommendation endpoints instruct the LLM to return only a valid JSON object matching a predefined schema.
- **Mock fallback**: When `GROQ_API_KEY` is absent or empty, the service returns curated mock data matching the seed user's gothic profile. The app is fully functional without an API key.
- **Swappable**: The Groq client is injected at init time. Swapping to Gemini requires only implementing the same `generate_recommendations` / `chat` interface.

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
- [ ] Add rate limiting (e.g., `slowapi`) on auth and LLM endpoints
- [ ] Configure proper CORS origins
- [ ] Add Redis caching layer for LLM recommendations
- [ ] Deploy behind a reverse proxy (nginx/Caddy)

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
│   ├── llm_service.py   # Groq integration with mock fallback
│   └── routes/
│       ├── auth.py
│       ├── profile.py
│       ├── chat.py
│       ├── clothing.py
│       ├── accessories.py
│       ├── hairstyle.py
│       ├── moodboard.py
│       ├── community.py
│       └── _recommendation_base.py   # Shared get/refresh factory
├── seed.py              # DB seeder
└── requirements.txt
```
