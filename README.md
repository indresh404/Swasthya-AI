# Swasthya AI

> A multilingual, voice-enabled health memory system. Patients build a connected health graph over time through natural conversation; doctors get instant, explainable context the moment they scan a patient's QR.

Read [`Swasthya_AI.md`](docs/Swasthya_AI.md) first for the full idea.
https://swasthya-ai-sage.vercel.app/about

---

## What's In This Repo

| Path | What it is |
|---|---|
| `app/` | Patient mobile app — React Native + Expo |
| `web/` | Doctor dashboard — React + Vite |
| `backend/` | FastAPI AI backend — agents, routes, services |
| `database/` | Supabase schema (`schema.sql`) |
| `docs/` | All product, agent, feature, and track documentation |

---

## Documentation Map

Start here, then go deeper as needed.

```
docs/
├── Swasthya_AI.md          → the core idea, read this first
├── APP.md                  → patient app overview
├── WEB.md                  → doctor dashboard overview
├── APP_FEATURES.md         → every app feature, one line each
├── WEB_FEATURE.md          → every dashboard feature, one line each
├── AGENTS.md               → all 11 agents, what each one does
├── ML_MODEL.md             → the prediction model
├── DATASET.md              → every dataset used and its source
│
├── Features/                → one detailed file per major feature
│   ├── family-qr-system.md
│   ├── jan-aushadhi-calculator.md
│   ├── 3d-body-heatmap.md
│   ├── scheme-eligibility.md
│   ├── doctor-qna-loop.md
│   ├── smartwatch-tracking.md
│   └── doctor-appointment-system.md
│
├── Agents/                   → one detailed file per agent
│   ├── onboarding-agent.md
│   ├── checkin-agent.md
│   ├── sarvam-chat-agent.md
│   ├── escalation-agent.md
│   ├── family-genetics-agent.md
│   ├── medical-scan-agent.md
│   ├── medicine-reminder-agent.md
│   ├── smartwatch-risk-agent.md
│   ├── doctor-qa-agent.md
│   ├── appointment-automation-agent.md
│   └── daily-workflow-orchestrator.md
│
└── Tracks/                    → how the project satisfies each hackathon track
    ├── EXPO_TRACK.md
    ├── NEO4J_TRACK.md
    ├── SARVAM_TRACK.md
    ├── RENDER_TRACK.md
    └── BASE44_TRACK.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Patient App | React Native (Expo), TypeScript, Three.js (via WebView, GLB model) |
| Doctor Dashboard | React, TypeScript, Vite |
| AI Backend | FastAPI (Python), Groq (LLaMA) |
| Health Graph | Neo4j AuraDB |
| Structured Data | Supabase (PostgreSQL) |
| Voice | Sarvam AI (Speech-to-Text, Text-to-Speech, multilingual) |
| Orchestration | Render Workflows |
| Drug Safety | OpenFDA API |
| Wearables | Google Health Connect / Apple Health |

---

## High-Level Architecture

```
Patient (voice or text)
       │
       ▼
  React Native App
       │
       ▼
   FastAPI Backend ──────► Render Workflows (orchestrates multi-step agent runs)
       │
       ├──► Sarvam AI (voice in/out)
       ├──► Groq LLaMA (reasoning, extraction, generation)
       ├──► Neo4j AuraDB (health graph: symptoms, family, patterns)
       ├──► Supabase (auth, medicines, appointments, schemes)
       └──► OpenFDA (drug interaction checks)
       │
       ▼
  Doctor Web Dashboard (React + Vite)
```

---

## Quick Start

### Patient App
```bash
cd app
npm install
npx expo start
```

### Doctor Dashboard
```bash
cd web
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Environment variables (`.env` in `backend/`):
```
GROQ_API_KEY=
NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=
SUPABASE_URL=
SUPABASE_KEY=
SARVAM_API_KEY=
```

### Database
Run `database/schema.sql` against your Supabase project to set up structured tables. Neo4j AuraDB schema/constraints are created on first run via `backend/services/neo4j_service.py`.

---

## Hackathon Tracks

This project is built to satisfy five tracks simultaneously — see [`Tracks/`](docs/Tracks/) for how each requirement is met:

- **Expo** — the patient app is Expo/React Native end-to-end
- **Neo4j AuraDB** — the health graph is the core reasoning layer, not a side feature
- **Sarvam AI** — voice is a primary interaction mode, not a bolt-on
- **Render Workflows** — multi-stage agent pipelines run as orchestrated workflows
- **Base44** — early prototype, link pending (see `Tracks/BASE44_TRACK.md`)
