<div align="center">

# ✦ AdvanceSelf

**AI-Powered Personal Style & Imagemaker Platform**

*Know your face. Master your look. Evolve your style.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Google Gemini](https://img.shields.io/badge/Gemini%20AI-1.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

**AdvanceSelf** is a full-stack mobile application that acts as your personal AI style consultant and imagemaker. It analyzes your facial geometry using MediaPipe, understands your body type and lifestyle preferences via a guided onboarding survey, and then leverages Google Gemini to deliver hyper-personalized fashion, hairstyle, and accessory recommendations — all wrapped in a premium dark-themed mobile experience.

Whether you want to refine your existing aesthetic or discover a completely new identity, AdvanceSelf gives you the data-driven insights of a professional stylist in your pocket.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **Facial Analysis** | MediaPipe Face Mesh extracts 468 landmarks to compute proportions, symmetry, and face shape classification |
| 🤖 **AI Recommendations** | Google Gemini generates context-aware style advice across fashion, hair, accessories, and grooming |
| 📊 **Progress Tracking** | Weekly comparison snapshots track physical changes and style evolution over time |
| 🎨 **Style Survey** | Guided onboarding captures body type, skin tone, preferred aesthetics, and lifestyle |
| 📸 **Photo Upload** | Capture or upload a selfie directly in-app for instant facial analysis |
| 📱 **Mobile-First** | Built with Expo & React Native for smooth 60fps native performance on Android & iOS |
| 🌑 **Premium Dark UI** | Electric Violet accent palette with glassmorphism cards and micro-animations |

---

## 🏗️ Architecture

```
AdvanceSelf/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Bottom-tab navigation group
│   │   ├── home.tsx            # Dashboard & quick actions
│   │   ├── survey.tsx          # Onboarding survey
│   │   ├── recommendations.tsx # AI style recommendations
│   │   ├── progress.tsx        # Weekly progress tracker
│   │   └── profile.tsx         # User profile & settings
│   ├── index.tsx               # Entry / splash redirect
│   ├── modal.tsx               # Global modal screen
│   └── _layout.tsx             # Root navigator
├── src/
│   ├── theme/                  # Design system (colors, spacing, radii)
│   ├── components/             # Shared UI components
│   └── services/               # API client & helpers
├── backend/
│   ├── app/
│   │   ├── api/routes.py       # FastAPI route handlers
│   │   ├── core/               # Config, DB engine, security
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response contracts
│   │   ├── services/           # Business logic & AI orchestration
│   │   │   ├── domain.py       # Core service layer
│   │   │   └── mediapipe_service.py  # Facial landmark extraction
│   │   └── jobs/               # Background task queue
│   ├── uploads/                # User photo storage
│   └── requirements.txt
└── assets/                     # App icons, splash, fonts
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| Python | ≥ 3.11 |
| Expo Go (mobile) | Latest |
| pip | ≥ 23 |

### 1. Clone the Repository

```bash
git clone https://github.com/yigitemrertn/AdvanceSelf.git
cd AdvanceSelf
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# ⚠️  Edit .env and add your GEMINI_API_KEY
```

**Start the API server:**

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# From project root
npm install
```

**Run on device (same Wi-Fi required):**

```bash
npx expo start --lan
# Scan the QR code with Expo Go (Android) or Camera (iOS)
```

**Run on web:**

```bash
npx expo start --web
```

---

## 🔑 Environment Variables

Create `backend/.env` from the example:

```env
APP_NAME=AdvanceSelf API
API_PREFIX=/api/v1
DATABASE_URL=sqlite:///./advanceself.db

# Google Gemini
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
ENABLE_REAL_GEMINI=true          # false = mock responses for dev

# Analysis
SCORE_MODEL_VERSION=mediapipe-v1
```

> **Get a free Gemini API key:** https://aistudio.google.com/app/apikey

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Authenticate and receive JWT |
| `PATCH` | `/api/v1/users/{id}/profile` | Update style survey profile |
| `POST` | `/api/v1/analyses/upload` | Upload photo for facial analysis |
| `GET` | `/api/v1/analyses/latest/{user_id}` | Fetch latest analysis results |
| `POST` | `/api/v1/recommendations/regenerate` | Trigger new AI recommendation |
| `GET` | `/api/v1/progress/latest/{user_id}` | Get weekly progress snapshot |
| `GET` | `/health` | Health check |

Full interactive docs: `http://localhost:8000/docs`

---

## 🛠️ Tech Stack

**Frontend**
- [Expo](https://expo.dev) + [Expo Router](https://expo.github.io/router/) (file-based routing)
- [React Native](https://reactnative.dev) 0.81
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) (animations)
- [Lucide React Native](https://lucide.dev) (icons)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) + [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur-view/)

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) (async REST API)
- [SQLAlchemy](https://www.sqlalchemy.org) + SQLite (dev) / PostgreSQL (prod)
- [MediaPipe](https://mediapipe.dev) (facial landmark detection)
- [Google Gemini AI](https://ai.google.dev) (style recommendations)
- [Pydantic v2](https://docs.pydantic.dev) (schema validation)

---

## 🌿 Branch Strategy

```
main            ← stable, production-ready
  ├── frontend  ← Expo / React Native development
  └── backend   ← FastAPI / Python development
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch from `frontend` or `backend`
3. Commit your changes with clear messages
4. Open a pull request targeting the appropriate branch

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ✦ by [yigitemrertn](https://github.com/yigitemrertn)

</div>
