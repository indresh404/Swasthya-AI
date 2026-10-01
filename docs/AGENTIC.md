# SWASTHYA AI — AGENTIC HEALTHCARE CONTINUITY ARCHITECTURE & DEPLOYMENT MANUAL

> **Swasthya AI** is a multilingual, voice-first, agentic healthcare continuity platform. It continuously maintains a longitudinal patient health memory across Neo4j and Supabase, orchestrating specialized clinical sub-agents across a closed-loop perception-reasoning-action cycle.

---

## 1. PRODUCT & ARCHITECTURAL DEFINITION

Swasthya AI is **not** a chatbot, and it is **not** a diagnostic AI. It is an **agentic clinical-support and healthcare continuity workflow system**.

The system helps patients preserve and communicate longitudinal context across time and language barriers, while empowering clinicians to query grounded health history and close information gaps via automated check-in follow-ups.

### External Facade vs Internal Orchestration

Externally, Swasthya AI exposes **ONE primary agent**:
```text
Swasthya Health Continuity Agent (POST /api/v1/agent)
```

Internally, this agent orchestrates specialized sub-agents, deterministic safety rules, external tools, and graph memory:

```
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

## 2. THE 8-STEP AGENTIC LIFECYCLE

Every interaction follows this strict, observable lifecycle:

```
[1. Perceive] ──> [2. Understand] ──> [3. Retrieve Memory] ──> [4. Route Agent]
                                                                      │
[8. Respond]  <── [7. Update Memory] <── [6. Execute Action] <── [5. Safety & Tools]
```

1. **Perceive**: Ingests raw text, voice transcript, or clinical event in English or Indian languages (via Sarvam AI).
2. **Understand**: Extracts structured clinical intent, symptom entities, duration, severity, and temporal recurrence markers.
3. **Retrieve Memory**: Queries Neo4j AuraDB for historical symptoms, chronic conditions, and previous episodes, plus active medications from Supabase.
4. **Route Agent**: Selects the appropriate sub-agent (`CheckInAgent`, `MedicineAgent`, `DoctorQAAgent`, `EscalationAgent`, `OnboardingAgent`).
5. **Execute Tools & Safety**: Calls external tools (e.g. OpenFDA) and executes pure-Python deterministic safety rules (e.g. cardiac risk + dyspnea recurrence).
6. **Execute Action**: Creates clinician review flags, schedules reminders, or queues follow-up questions.
7. **Update Memory**: Writes newly observed symptoms and health facts back into Neo4j longitudinal graph and persists the structured audit event.
8. **Respond**: Returns an empathetic, clinically grounded response with observable step traces.

---

## 3. SPECIALIZED SUB-AGENTS

| Sub-Agent | Role | Tools & Knowledge Sources |
| :--- | :--- | :--- |
| **Check-In Agent** | Evaluates periodic updates, detects symptom changes, compares against previous episodes | Neo4j Symptom Nodes, Temporal Recurrence Matrix |
| **Medicine Agent** | Answers medication inquiries, verifies active prescriptions, checks contraindications | OpenFDA API, Supabase Medication Table, Deterministic Interaction Matrix |
| **Escalation Agent** | Evaluates clinical red flags, assigns triage urgency (`URGENT_EVALUATION`, `EMERGENCY`), alerts doctor | Clinician Notification Tool, Safety Rules Engine |
| **Doctor Q&A Agent** | Synthesizes strictly grounded clinical summaries; queues check-in questions when context is missing | Neo4j Patient Chart, Timeline Log, Follow-up Question Queue |
| **Onboarding Agent** | Multi-turn structured health intake, identifies missing fields, initializes health graph | Neo4j User Node, Initial Profile Schema |
| **Cognitive Support Agent** | Computes calibrated cognitive review priority scores (OASIS-derived indicators); clinical support signal | Priority Logistic Calibration, SHAP Feature Importance |

---

## 4. CLOSED-LOOP DOCTOR Q&A WORKFLOW

Swasthya demonstrates a closed agentic loop when clinical records lack information requested by a clinician:

```
Clinician Question
       │
       ▼
Retrieve Graph Context
       │
Insufficient Records? 
       ├── NO  ──> Synthesize grounded answer with source citations
       └── YES ──> 1. Set grounded = false
                   2. Identify missing fields (e.g. "No recent HbA1c lab records")
                   3. Automatically generate & queue patient question for next check-in
                   4. Patient responds during next check-in
                   5. Graph memory is updated
                   6. Clinician question is now answerable
```

---

## 5. DETERMINISTIC SAFETY LAYER

To guarantee safety, all clinical triage decisions are driven by pure-Python inspectable rules:

```python
# Pure Python Deterministic Escalation
if has_breathing_difficulty and (is_recurring or patient_age >= 55 or has_cardiac_history):
    requires_clinician_review = True
    escalation_level = "URGENT_EVALUATION"
    reasons.append("Recurrent dyspnea detected in patient with cardiovascular risk profile.")
```

- **Zero LLM Hallucination for Triage**: LLMs extract context; deterministic rules decide escalation.
- **Inspectable Triggers**: Every flagged interaction includes exact rule IDs and reasoning.

---

## 6. RENDER API & AIKART DEPLOYMENT SPECIFICATION

The backend is fully compatible with **Render Web Services** and **aiKart API Testing Mode**.

### Public Endpoints

| Method | Path | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Application health and agent status check | None |
| `POST` | `/api/v1/agent` | **Primary Swasthya Health Continuity Agent** | None |
| `GET` | `/docs` | Interactive FastAPI Swagger Documentation | None |
| `GET` | `/openapi.json` | OpenAPI 3.1.0 Specification | None |

---

### aiKart Interactive Testing Configuration

```yaml
Interactive Testing Mode: API Endpoint
Allow Buyers to Test: Yes
HTTP Method: POST
Endpoint URL: https://<YOUR-RENDER-SERVICE>.onrender.com/api/v1/agent
Authentication: No authentication required
Input Format: JSON Body
Response Format: JSON Response
Session Request Required: No
```

#### Request Payload (`POST /api/v1/agent`)

```json
{
  "user_id": "DEMO-P001",
  "message": "I've been having breathing difficulty again",
  "language": "en"
}
```

#### Response Payload (`200 OK`)

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
      "step": "Specialized Agent Routing",
      "agent": "check-in-agent",
      "explanation": "Routed workflow to check-in-agent based on clinical perception."
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

---

## 7. SYNTHETIC DEMO PATIENT (`DEMO-P001`)

To test the system deterministically without external credentials:

- **Patient ID**: `DEMO-P001`
- **Name**: Ramesh Patel (Age 58, Male)
- **Documented Conditions**: Hypertension
- **Documented Medications**: Amlodipine 5mg, Telmisartan 40mg
- **Documented Allergies**: Penicillin (High)
- **Previous Episode**: Acute Dyspnea (Severity 7/10) on 2026-09-18
- **Scheduled Appointment**: Dr. Sharma (Cardiologist) on 2026-10-10

### Running the Seed Script
```bash
python scripts/seed_demo_patient.py
```

---

## 8. DEPLOYMENT & VERIFICATION CHECKLIST

1. **Docker Build**:
   ```bash
   docker build -t swasthya-agent .
   ```
2. **Docker Run**:
   ```bash
   docker run -p 8000:8000 -e DEMO_MODE=true swasthya-agent
   ```
3. **Health Verification**:
   ```bash
   curl http://localhost:8000/health
   ```
4. **Agent Workflow Verification**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/agent \
     -H "Content-Type: application/json" \
     -d '{"user_id":"DEMO-P001","message":"I have been having breathing difficulty again","language":"en"}'
   ```
5. **Render Cloud Deployment**:
   - Push to GitHub repository.
   - Connect repository in Render as Web Service (`Docker` runtime, root `Dockerfile`).
   - Add environment variables (`DEMO_MODE=true`, `GROQ_MODEL=llama-3.1-8b-instant`, etc.).
   - Verify public URL: `https://<your-service>.onrender.com/api/v1/agent`.
