# Swasthya AI

**स्वास्थ्य** *(Swasthya)* — Sanskrit for "health." A platform built on the belief that healthcare should remember you, not just react to you.

---

## The Problem

Healthcare in India is not broken — it is **fragmented, reactive, and disconnected between visits.**

- A patient's hypertension history, their mother's pre-diabetes, and a sibling's kidney condition sit in three separate paper files at three different clinics. Nothing connects them.
- A doctor gets 10 minutes per patient. The first 5 are spent reconstructing context — *when did this start, what are you taking, has this happened before* — that already exists somewhere but isn't accessible.
- Nobody is watching the space *between* appointments. A symptom that returns, a pattern that repeats, a family risk that was never asked about — none of it reaches the doctor until the patient is already in the chair.
- Patients buy medicines over the counter with no idea what interacts with what they're already taking.
- Patients with serious conditions often don't know a government scheme could cover their treatment.

Every existing health chatbot treats each conversation as isolated. Ask it about your fever today, and it has no memory that you had the same fever three weeks ago, or that your father has diabetes, or that this is the fourth time this month you've mentioned fatigue. **Without memory, there is no insight — only response.**

---

## The Core Idea

Swasthya AI is a **multilingual, voice-enabled health memory system**. Instead of treating every conversation as a fresh start, it builds a connected, evolving picture of a person's health — symptoms over time, family medical history, lifestyle habits, medicines, and recovery patterns — and reasons over that connected picture to generate explainable insights.

The system is built around one architectural decision: **health data is relational, so it lives in a graph.** A symptom isn't just a record — it's connected to the symptom before it, to the body zone it affects, to the family member who had something similar, to the medicine that might be causing it. Neo4j AuraDB stores this graph as the system's core intelligence layer. Supabase handles the structured, transactional side — accounts, appointments, medicine schedules — but the *reasoning* happens on the graph.

On top of the graph sits a set of specialised AI agents, each responsible for one job — extracting a symptom, checking a drug interaction, matching a government scheme, generating a doctor's morning briefing — all orchestrated through Render Workflows so that no single point of failure breaks the chain, and every multi-step process (like "patient mentions chest pain → escalate → notify doctor → log to graph") runs reliably in the background.

Patients interact by **voice**, in Hindi, Marathi, or English, through Sarvam AI — because real accessibility in India means not assuming someone is comfortable typing in English.

---

## How It's Different From a Symptom Checker

| Stateless Chatbot | Swasthya AI |
|---|---|
| Each message is independent | Every message is added to a connected health timeline |
| "I have a fever" → generic advice | "Fever again — 3rd time this month, same week your father's blood sugar was flagged" → explainable insight |
| No family context | Family history graph traversal feeds every risk read |
| Text-only, English-first | Voice-first, multilingual (Sarvam AI) |
| One-shot Q&A | Doctor can ask questions, patient gets follow-up prompts automatically |
| No financial guidance | Automatic government scheme matching + Jan Aushadhi generic-medicine cost comparison |

Swasthya AI does **not diagnose**. It surfaces explainable risk indicators — "here's what changed and why it matters" — and consistently nudges toward a real doctor. The graph is not a gimmick; it is the reason the system can say *why* something looks different this time, instead of just reacting to what was typed five seconds ago.

---

## The Two Surfaces

**Patient App** (React Native + Expo) — onboarding via AI conversation, daily check-ins, voice chatbot, body heatmap, medicine tracking with Jan Aushadhi price comparison, family QR group, government scheme matching, appointment booking.

**Doctor Web Dashboard** (React + Vite) — QR/ID scan to pull a patient's full history instantly, AI-summarised patient profile, doctor Q&A against patient data, appointment management.

Both surfaces are powered by the same backend: FastAPI, Groq (LLaMA) for reasoning, Neo4j AuraDB for the health graph, Supabase for structured data, Sarvam AI for voice, and Render Workflows for orchestrating every multi-step agent process.

---

## What Success Looks Like

A patient mentions back pain in passing during a voice check-in. Two weeks later they mention it again. The system already knows this is a recurrence, already knows their father has a spine condition, and surfaces this connection to the doctor before the patient even describes it twice in the same room. That is the entire premise of Swasthya AI: **healthcare that remembers, so the people in it don't have to re-explain themselves every single time.**
