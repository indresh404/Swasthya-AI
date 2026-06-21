# Agents

Swasthya AI runs on 11 specialised agents instead of one general-purpose chatbot. Each agent has exactly one job, reads from and writes to the same Neo4j health graph (plus Supabase for structured data), and is orchestrated through Render Workflows so multi-step processes — like "patient mentions chest pain → escalate → notify doctor → log to graph" — run reliably in the background, not as a single fragile LLM call.

No agent diagnoses. Every agent either **extracts**, **connects**, **explains**, or **acts on a deterministic rule** — never invents a medical conclusion on its own.

See [`Agents/`](./Agents/) for a detailed file on each one.

---

### 1. Onboarding Agent
Runs the first conversation a patient ever has with the app. Collects chronic conditions, medications, allergies, surgeries, and family history through natural back-and-forth — not a form — and writes the initial graph: the patient's first nodes and relationships.

### 2. Check-In Agent
Generates 2–3 adaptive daily questions from the patient's own graph — recent symptoms, active medicines, family flags — and extracts structured data from the answers. Every check-in adds new nodes and strengthens or resolves existing ones.

### 3. Sarvam Chat Agent
The voice and multilingual layer. Handles speech-to-text and text-to-speech via Sarvam AI so patients can speak naturally in Hindi, Marathi, or English instead of typing in a language they may not be fluent in.

### 4. Escalation Agent
Watches every extracted symptom for danger combinations (e.g. chest pain + breathlessness) and triggers an immediate doctor notification when a deterministic threshold is crossed — this is a rule-based check, not an LLM guess, because a missed emergency cannot depend on a model's mood.

### 5. Family Genetics Agent
Traverses the family branch of the health graph to surface inherited risk — father has diabetes, user shows early signs of the same pattern — and keeps the reasoning explainable: which relationship, which condition, why it matters.

### 6. Medical Scan Agent
Reads and verifies uploaded documents — most importantly, income certificates for government scheme eligibility. Extracts the relevant fields and confirms them before they're used to match schemes.

### 7. Medicine Reminder Agent
Manages the medicine list end-to-end: reminders, adherence tracking, and the synchronous OpenFDA conflict check that runs every time a new medicine is added — a medicine is never saved until the interaction check completes.

### 8. Smartwatch Risk Agent
Pulls heart rate, SpO2, and BP from connected wearables (Google Health Connect / Apple Health) and feeds them into the same risk graph as self-reported symptoms — so a wearable anomaly can prompt a check-in question even before the patient notices anything is wrong.

### 9. Doctor Q&A Agent
Answers a doctor's free-text question about a specific patient, grounded entirely in that patient's graph data. If the answer isn't available, it rewrites the question for the patient and queues it for their next check-in — closing the loop without the doctor having to follow up manually.

### 10. Appointment Automation Agent
Matches patients to available doctors and handles booking — either the patient chooses, or the agent auto-assigns based on availability and specialty, and the doctor's dashboard reflects the booking instantly.

### 11. Daily Workflow Orchestrator
The Render Workflow that ties everything together. Runs scheduled and event-triggered multi-stage pipelines — voice input → extraction → graph update → family risk check → pattern match → explanation → recommendation — so each step executes reliably, in order, with retry support, instead of as one unsupervised LLM call trying to do everything at once.

---

## Why Agents, Not One Chatbot

A single large prompt trying to onboard, extract symptoms, check drug interactions, traverse family history, and answer a doctor's question all at once is unreliable and unexplainable. Splitting responsibility means every output can be traced back to exactly one agent's job — which is what makes the graph's reasoning explainable instead of a black box.
