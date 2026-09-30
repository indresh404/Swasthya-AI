# 🌿 Swasthya AI — Multilingual Knowledge Graph Health Memory System

[![App CI](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/app.yml/badge.svg)](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/app.yml)
[![Backend CI](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/backend.yml/badge.svg)](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/backend.yml)
[![Web CI](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/web.yml/badge.svg)](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/web.yml)
[![Overall CI](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/overall.yml/badge.svg)](https://github.com/indresh404/Swasthya-AI-v2/actions/workflows/overall.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Neo4j AuraDB](https://img.shields.io/badge/Neo4j-AuraDB_Enterprise-008CC1?logo=neo4j)](https://neo4j.com/cloud/aura/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React Native](https://img.shields.io/badge/Mobile-Expo_SDK_51-000020?logo=expo)](https://expo.dev)

> **Swasthya AI** is a voice-first, multilingual clinical memory and knowledge graph system. Patients build an interconnected health graph over time through natural daily voice interactions in vernacular Indian languages (powered by **Sarvam AI** & **Groq LLaMA 3.3**), while doctors obtain instant, explainable medical context the moment they scan a patient's universal dynamic QR code.

---

## 🌐 Live Demos & Links

- 🖥️ **Live Doctor Web Dashboard**: [Swasthya AI Doctor Portal](https://swasthya-ai-sage.vercel.app/about)
- 📱 **Live App Prototype**: [Swasthya AI Base-44](https://swasthya-smart-care.base44.app)
- 📚 **Comprehensive Documentation Hub**: [`docs/`](docs/Swasthya_AI.md)

---

## 🧩 Key Innovations & Capabilities

### 1. 🧠 Neo4j Clinical Knowledge Graph & Family Hereditary Overlap
- **Cross-temporal Graph Memory**: Maps patient symptoms, conditions, triggers, medications, lifestyle habits, and vitals into a connected graph.
- **Genetic & Contagion Detection**: Detects hereditary disease trends and household contagion overlaps between family members (e.g. parent-child diabetes predisposition or shared viral symptoms).
- **Explainable Clinical Context**: Instant graph queries for doctors summarizing active complaints, drug adherence, contraindications, and chronological disease progression.

### 2. 💊 Pradhan Mantri Jan Aushadhi (PMBJP) Calculator & PDF Prescription
- **Instant Brand-to-Generic Equivalents**: Auto-translates branded medicines (e.g., *Glycomet 500mg* $\rightarrow$ *Metformin HCl 500mg*) with up to **80–88% cost savings**.
- **Printable / Downloadable Jan Aushadhi Rx PDF**: Generates a standard government-format generic prescription that patients can directly hand over to pharmacists at any PMBJP Kendra.
- **Interactive Kendra Store Locator & Map**: Interactive OpenStreetMap / Leaflet web map and native mobile map with GPS navigation, contact numbers, and distance calculations to nearest generic pharmacy outlets.

### 3. 🎙️ Vernacular Multilingual Voice (Sarvam AI)
- Conversational audio check-ins in Hindi, Marathi, Tamil, Telugu, Gujarati, and English with low-latency Speech-to-Text (STT) and expressive Text-to-Speech (TTS).

### 4. 🛡️ Real-Time Drug Safety & OpenFDA Engine
- Automatic contraindication detection and drug-drug / drug-disease interaction checks powered by OpenFDA and clinical LLM safety pipelines.

### 5. 🩻 Universal Dynamic QR & Multi-Agent Architecture
- Generates dynamic QR tokens containing encrypted patient credentials, allowing verified doctors to access real-time clinical timelines, vitals, 3D anatomical heatmaps, and lab histories in under 2 seconds.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client Layer
        A["📱 Patient App (React Native / Expo)"]
        B["🖥️ Doctor Web Dashboard (React + Vite)"]
    end

    subgraph AI Gateway & Backend
        C["🚀 FastAPI Gateway (Python 3.11)"]
        D["🎙️ Sarvam AI (Speech-to-Text & TTS)"]
        E["⚡ Groq LLaMA 3.3 70B (Multi-Agent Extraction)"]
        F["🛡️ OpenFDA Safety Engine"]
    end

    subgraph Persistence & Knowledge Graph
        G[("🌐 Neo4j AuraDB (Clinical Knowledge Graph)")]
        H[("🗄️ Supabase PostgreSQL (Auth & Records)")]
    end

    A -->|"Voice / Text Check-ins"| C
    B -->|"Scan QR / View Timeline"| C
    C <--> D
    C <--> E
    C <--> F
    C <--> G
    C <--> H
```

---

## 🧬 Neo4j Clinical Knowledge Graph Schema

The Neo4j database uses a deeply connected biomedical ontology representing patient **Indresh Suresh** and family health networks:

```mermaid
graph LR
    User["(:User {id: 'indresh', name: 'Indresh Suresh'})"]
    Fam["(:FamilyGroup {name: 'Suresh Family Cohort'})"]
    Father["(:User {name: 'Suresh Kumar', relation: 'Father'})"]
    
    Cond1["(:Condition {name: 'Type 2 Diabetes Mellitus'})"]
    Cond2["(:Condition {name: 'Primary Hypertension'})"]
    
    Sym1["(:Symptom {name: 'Morning Fatigue'})"]
    Sym2["(:Symptom {name: 'Occipital Headache'})"]
    
    Fact1["(:HealthFact {category: 'sleep', text: '5.5-6.5 hrs sleep'})"]
    Fact2["(:HealthFact {category: 'stress', text: 'Sprint deadline stress'})"]
    
    Med1["(:Medication {name: 'Glycomet 500mg'})"]
    Med2["(:Medication {name: 'Amlokind 5mg'})"]
    
    JA1["(:JanAushadhiMedicine {name: 'Jan Aushadhi Metformin 500mg', price: 9.20})"]
    Kendra["(:JanAushadhiKendra {name: 'Jan Aushadhi Dadar (West)'})"]
    
    Doc["(:Doctor {name: 'Dr. Rajesh Mehta, MD'})"]
    Vital["(:VitalSign {type: 'Fasting Blood Sugar', value: 112})"]

    Fam -->|CONTAINS| User
    Fam -->|CONTAINS| Father
    User -->|FAMILY_MEMBER| Father
    
    User -->|HAS_CONDITION| Cond1
    User -->|HAS_CONDITION| Cond2
    Father -->|HAS_CONDITION| Cond1
    
    User -->|HAS_SYMPTOM| Sym1
    User -->|HAS_SYMPTOM| Sym2
    
    User -->|HAS_FACT| Fact1
    User -->|HAS_FACT| Fact2
    Sym2 -->|TRIGGERED_BY| Fact2
    
    User -->|TAKES_MEDICATION| Med1
    User -->|TAKES_MEDICATION| Med2
    Med1 -->|TREATS| Cond1
    Med2 -->|TREATS| Cond2
    
    Med1 -->|JAN_AUSHADHI_EQUIVALENT| JA1
    JA1 -->|STOCKED_AT| Kendra
    
    User -->|CONSULTS_WITH| Doc
    Doc -->|PRESCRIBED| Med1
    User -->|RECORDED_VITAL| Vital
```

### Useful Cypher Queries to Run in Neo4j Browser / Bloom:

```cypher
// 1. Inspect complete health picture for Indresh
MATCH (u:User {id: 'indresh'})-[r]->(n)
RETURN u, r, n;

// 2. View generic drug savings and PMBJP Kendra links
MATCH (m:Medication)-[r1:JAN_AUSHADHI_EQUIVALENT]->(ja:JanAushadhiMedicine)-[r2:STOCKED_AT]->(k:JanAushadhiKendra)
RETURN m.name AS Brand, ja.name AS Generic, ja.brand_price AS MRP, ja.jan_aushadhi_price AS JanPrice, k.name AS Kendra;

// 3. Detect family symptom and hereditary condition overlap
MATCH (fg:FamilyGroup)-[:CONTAINS]->(member:User)-[r:HAS_CONDITION]->(c:Condition)
RETURN member.name, c.name, r.status;
```

---

## 📂 Repository Directory Layout

```
Swasthya-AI/
├── .github/
│   └── workflows/
│       ├── app.yml          # React Native / Expo Lint, TypeCheck & Web Export Build
│       ├── backend.yml      # FastAPI Python 3.11 Lint, Flake8, Compile & Test Suite
│       ├── web.yml          # Vite + React Doctor Dashboard Build & TypeScript Check
│       ├── overall.yml      # Git merge conflict marker scanner
│       └── assign.yml       # Automated PR review routing and issue triage
├── app/                     # React Native Expo Patient Mobile App
│   ├── app/                 # Expo Router tabs (home, chat, meds, profile)
│   ├── components/          # UI Components, JanAushadhiMap (.web.tsx & .native.tsx)
│   ├── services/            # Supabase & Backend API clients
│   └── store/               # Zustand global state management
├── backend/                 # FastAPI AI Backend
│   ├── routes/              # Health Graph, Chat, Meds, Schemes, Risk, Safety
│   ├── services/            # Neo4j, Groq, Sarvam, OpenFDA, Supabase clients
│   ├── scratch/             # Seed scripts for Neo4j Aura DB
│   └── main.py              # Application entrypoint
├── web/                     # Doctor & Hospital Web Dashboard (React + Vite + Three.js)
│   ├── src/pages/           # Patient profile, appointments, medicine directory, scanner
│   └── src/components/      # 3D Anatomical Body Viewer & Analytics
└── docs/                    # Technical & Hackathon Documentation
```

---

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: 3.11+
- **Neo4j AuraDB Instance**: (Credentials in `.env`)
- **Supabase Project**: (PostgreSQL DB + Auth)
- **Groq API Key**: (For fast LLaMA 3.3 multi-agent inference)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Seed Neo4j Knowledge Graph with Indresh's Medical Data:
```bash
python scratch/seed_neo4j_indresh.py
```

### 3. Patient Mobile App (Expo)
```bash
cd app
npm install

```
- Press `w` to open in Web Browser.
- Scan the QR code with the **Expo Go** app on Android/iOS.

### 4. Doctor Web Dashboard
```bash
cd web
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

Create a `.env` file inside `backend/` with the following keys:

```ini
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Groq Cloud API
GROQ_API_KEY=gsk_your_groq_api_key

# Sarvam AI Voice Engine
SARVAM_API_KEY=sk_your_sarvam_api_key

# Neo4j AuraDB Enterprise
NEO4J_URI=neo4j+s://63ba98a5.databases.neo4j.io
NEO4J_USERNAME=63ba98a5
NEO4J_PASSWORD=your_neo4j_aura_password
```

---

## 🤖 Multi-Agent LLM Orchestration

Swasthya AI deploys an ensemble of 11 cooperative AI agents:
1. **Onboarding Agent**: Elicits patient medical history, allergies, and lifestyle.
2. **Check-in Agent**: Conducts conversational daily voice check-ins.
3. **Symptom Extraction Agent**: Isolates anatomical locations, duration, severity, and triggers.
4. **Lifestyle & Habit Agent**: Catalogs diet, sleep patterns, screen time, and exercise.
5. **Medical History Agent**: Classifies chronic conditions and past surgical interventions.
6. **Family Hereditary Agent**: Correlates genetic risk indicators across household trees.
7. **Jan Aushadhi Scheme Agent**: Computes generic drug equivalencies and calculates direct savings.
8. **Drug Safety & OpenFDA Agent**: Validates concurrent medications for adverse interactions.
9. **Doctor Q&A Agent**: Answers clinical questions based on grounded graph context.
10. **Appointment Agent**: Automates specialist triage and booking workflows.
11. **Workflow Orchestrator**: Coordinates background jobs and health alert triggers.

---

## 🛠️ CI / CD Pipeline Health

All continuous integration pipelines are configured in `.github/workflows/`:
- **`app.yml`**: Dependency security audit, TypeScript compiler checks (`tsc --noEmit`), ESLint rules, and production web export (`expo export --platform web`).
- **`backend.yml`**: Black code formatting, Flake8 logic analysis, Python bytecode compileall check, server import sanity, and unit test suites.
- **`web.yml`**: Vite React production bundling and TypeScript validation.
- **`overall.yml`**: Pre-merge validation ensuring zero unresolved git conflict markers across all code files.

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
