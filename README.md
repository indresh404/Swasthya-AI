# 🌿 Swasthya AI — Multilingual Agentic Healthcare Continuity

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Neo4j AuraDB](https://img.shields.io/badge/Neo4j-AuraDB_Enterprise-008CC1?logo=neo4j)](https://neo4j.com/cloud/aura/)
[![React Native](https://img.shields.io/badge/Mobile-Expo_SDK_51-000020?logo=expo)](https://expo.dev)
[![React + Vite](https://img.shields.io/badge/Doctor_Portal-React_Vite-61DAFB?logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Swasthya AI** is a multilingual, voice-first, **agentic healthcare continuity system** that maintains a longitudinal patient health memory across **Neo4j** and **Supabase**, using specialized clinical sub-agents to continuously:
> 
> $$\text{Perceive} \longrightarrow \text{Understand} \longrightarrow \text{Retrieve} \longrightarrow \text{Reason} \longrightarrow \text{Use Tools} \longrightarrow \text{Act} \longrightarrow \text{Update Memory} \longrightarrow \text{Follow Up}$$

---

## 🧭 Why Swasthya AI is Truly Agentic

Swasthya AI is **not** a diagnostic chatbot and **not** a raw LLM wrapper.

```
Traditional Chatbot:    User Message ──> LLM ──> Unverified Text Answer

Swasthya Agent Loop:   Patient / Clinician Input
                                    │
                              [1. Perceive] (Sarvam Multilingual Voice & STT)
                                    │
                             [2. Understand] (Structured Entity & Intent Parsing)
                                    │
                          [3. Retrieve Context] (Neo4j Graph & Supabase Active Chart)
                                    │
                            [4. Route Agent] (Check-in, Medicine, Escalation, Doctor Q&A)
                                    │
                             [5. Tool Use] (OpenFDA, Graph Search, Follow-up Queue)
                                    │
                            [6. Safety Check] (Pure Python Deterministic Rules)
                                    │
                           [7. Action & Audit] (Clinician Review Alert, Event Store)
                                    │
                          [8. Memory Update] (Neo4j Longitudinal Graph Mutation)
                                    │
                             [9. Follow-Up] (Closed-loop Check-in Question Queue)
```

---

## 🏛️ System Architecture

```text
                         ┌─────────────────────────────────────────┐
                         │               SWASTHYA AI               │
                         │     Health Continuity Primary Agent     │
                         └────────────────────┬────────────────────┘
                                              │
                                      Agent Orchestrator
                                              │
             ┌────────────────────────────────┼────────────────────────────────┐
             │                                │                                │
     Context Retrieval                Specialized Agents                  Safety Layer
             │                                │                                │
      Neo4j + Supabase             ┌──────────┼──────────┐             Deterministic Pure Python
    (Longitudinal Graph)           │          │          │              (Zero LLM Hallucination)
                              Check-In     Medicine  Escalation
                                   │          │          │
                              Doctor Q&A  Onboarding Cognitive
                                              │
                                        Tool Selection
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
             Neo4j Graph Tool           Supabase Tool             OpenFDA Tool
         (Symptoms, Conditions)     (Medications, Events)    (Labeling & Interactions)
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                        Action / Audit
                                              │
                                   Longitudinal Health Memory
                                        (Neo4j Update)
                                              │
                                    Patient / Clinician
                                         Follow-Up
```

---

## 🚀 Public API & aiKart Compatibility Contract

Swasthya AI exposes **ONE unified public agent endpoint** callable by external orchestrators and buyers (such as **aiKart API Endpoint Testing Mode**):

```http
POST /api/v1/agent
Content-Type: application/json
```

### Request Schema
```json
{
  "user_id": "DEMO-P001",
  "message": "I've been having breathing difficulty again",
  "language": "en"
}
```

### Response Schema (`200 OK`)
```json
{
  "agent": "swasthya-health-continuity-agent",
  "status": "completed",
  "response": "I have recorded your breathing difficulty update and noted that this is a recurring episode. Because of your health history, this has been flagged for clinician review. Please seek urgent care if your breathing worsens.",
  "context_used": [
    "previous_symptoms_history",
    "previous_breathlessness_episode",
    "active_medications",
    "chronic_conditions_chart"
  ],
  "tools_used": [
    "get_patient_context",
    "get_active_medications",
    "check_escalation_rules",
    "create_clinician_notification",
    "update_health_memory",
    "create_health_event"
  ],
  "actions": [
    "clinician_notification_created",
    "follow_up_required",
    "health_event_recorded"
  ],
  "memory_updated": true,
  "requires_clinician_review": true,
  "trace": [
    {
      "step": "Perceive & Understand",
      "agent": "swasthya-health-continuity-agent",
      "explanation": "Interpreted intent as 'symptom_report' with 1 symptom(s) and temporal context 'recurring'."
    },
    {
      "step": "Retrieve Memory",
      "agent": "swasthya-health-continuity-agent",
      "tool": "get_patient_context",
      "explanation": "Retrieved patient chart (Ramesh Patel, age 58) and 2 active medications from Neo4j & Supabase."
    },
    {
      "step": "Deterministic Safety Check",
      "agent": "safety-rules-engine",
      "explanation": "Evaluated safety rules: Level 'URGENT_EVALUATION'. Clinician review required = True."
    },
    {
      "step": "Memory Update",
      "agent": "swasthya-health-continuity-agent",
      "tool": "update_health_memory",
      "explanation": "Persisted health event and updated Neo4j graph nodes for patient DEMO-P001."
    }
  ]
}
```

### Core Public Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/health` | `GET` | System health check (`{"status": "healthy", "agent": "swasthya-health-continuity-agent", "version": "1.0.0"}`) |
| `/api/v1/agent` | `POST` | **Primary Swasthya Health Continuity Agent** |
| `/api/v1/agent/doctor-qa` | `POST` | Grounded Clinician Q&A with closed-loop follow-up queue |
| `/docs` | `GET` | Interactive Swagger UI API documentation |
| `/openapi.json` | `GET` | OpenAPI specification |

---

## 🏆 Flagship Hackathon Scenarios

### Scenario 1: Patient Recurrent Symptom Check-In
1. **Patient Input**: `"I've been having breathing difficulty again."`
2. **Perception**: Extracts `breathing difficulty` + `recurrence=True`.
3. **Memory Retrieval**: Pulls patient `DEMO-P001` chart from Neo4j showing previous acute dyspnea episode on `2026-09-18` and active `Amlodipine 5mg` / `Telmisartan 40mg` prescriptions.
4. **Deterministic Safety Engine**: Evaluates `RULE_01_RECURRENT_DYSPNEA_CARDIO_RISK` $\rightarrow$ triggers `requires_clinician_review = True` (Level: `URGENT_EVALUATION`).
5. **Action & Memory**: Creates priority clinician notification, writes updated symptom node into Neo4j, logs health event in Supabase.
6. **Response**: Delivers clinically grounded, empathetic guidance.

### Scenario 2: Grounded Doctor Q&A & Closed-Loop Follow-Up
1. **Clinician asks**: `"What happened during the patient's recent breathing episodes?"`
2. **Doctor Q&A Agent**: Retrieves patient graph records and synthesizes a strictly grounded summary with exact dates (`2026-09-18`), severity (`7/10`), and medication context without hallucinating.
3. **Clinician asks for missing data**: `"What are the patient's recent fasting glucose levels?"`
4. **Closed-Loop Resolution**: Because lab results are absent from graph memory, the agent returns `grounded: false` and **automatically queues a follow-up question** for the patient's next check-in.

---

## 🛡️ Deterministic Safety Rules

To guarantee clinical reliability:
- **Zero Diagnostic Claims**: The system assists continuity and triage; it does not replace medical practitioners.
- **Pure Python Rules**: Clinical red flags (e.g. concurrent chest pain + dyspnea, medication collisions with Penicillin allergy) are evaluated via transparent rule matrices, never delegated solely to LLM probabilistic output.

---

## 🧪 Quickstart & Local Testing

### 1. Clone & Setup Python Virtual Environment
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
*(By default `DEMO_MODE=true` is enabled, allowing end-to-end execution without live cloud credentials).*

### 3. Seed Synthetic Demo Patient
```bash
python ../scripts/seed_demo_patient.py
```

### 4. Run Acceptance Test Suite
```bash
python tests/test_agent_workflow.py
```

### 5. Start Backend Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🐳 Docker & Cloud Deployment (Render)

### Local Docker Build & Run
```bash
# Build image
docker build -t swasthya-agent .

# Run container
docker run -p 8000:8000 -e DEMO_MODE=true swasthya-agent
```

### Render Deployment Configuration
The repository includes `render.yaml` and a production-ready `Dockerfile`.
- **Runtime**: Docker
- **Health Check Path**: `/health`
- **Dynamic Port**: Binds automatically to `${PORT:-8000}`.

For in-depth architectural specifications, see [`AGENTIC.md`](AGENTIC.md).

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
