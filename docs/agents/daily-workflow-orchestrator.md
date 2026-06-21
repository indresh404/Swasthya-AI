# Daily Workflow Orchestrator

## Role

The Render Workflow that ties every other agent together. Runs scheduled and event-triggered multi-stage pipelines reliably, in order, with retry support — so a full patient interaction (voice in → graph update → family risk check → explanation → recommendation → voice out) executes as a supervised sequence instead of one unsupervised LLM call trying to do everything at once.

## Why It Exists

A single patient interaction touches seven or more distinct responsibilities — transcription, extraction, graph writing, family risk traversal, pattern matching, explanation, recommendation, and speech synthesis. Running all of that as one giant prompt is fragile: any single failure point (a slow graph query, a timed-out API call) silently breaks the whole response, with no way to know which stage failed or retry just that piece. This orchestrator exists to make the pipeline observable and resilient instead of a black box.

## How It Works

```
Voice Input (Sarvam STT)
        ↓
Conversation Agent (maintain context)
        ↓
Symptom Extraction Agent (detect symptom, severity, duration)
        ↓
Graph Agent (write nodes + relationships to Neo4j)
        ↓
Family Genetics Agent (traverse family risk)
        ↓
Pattern Similarity Agent (compare against known health patterns)
        ↓
Explanation Agent (generate grounded reasoning)
        ↓
Recommendation Agent (generate next-step guidance)
        ↓
Voice Response (Sarvam TTS)
```

Each stage is an independently executable, retryable step within the Render Workflow — not a function call nested inside another function call. If the Family Genetics Agent's graph traversal is slow or fails, that stage retries without forcing the entire pipeline (including the parts the patient is already waiting on) to restart from scratch.

## Two Workflow Types

**Synchronous (within a conversation):** The full pipeline above, running each time a patient's message needs a response — fast enough to feel like a normal conversation, but executed as discrete, monitorable stages.

**Asynchronous (background):** Triggered by events like an Escalation Agent alert or a queued Doctor Q&A question — these run independently of whether the patient still has the app open, and must complete reliably regardless. See [`Tracks/RENDER_TRACK.md`](../Tracks/RENDER_TRACK.md) for the escalation-specific workflow.

## Why This Matters for Reliability

| Without orchestration | With the Daily Workflow Orchestrator |
|---|---|
| One failure breaks the entire response | Each stage retries independently |
| No visibility into which step failed | Every stage is logged and traceable |
| Background tasks (queued doctor questions) have no durable home | Async workflows run reliably regardless of app state |

## What It Coordinates

Every other agent in the system passes through this orchestrator at some point — it is the execution engine the rest of the agent architecture runs on top of, not a separate feature alongside them.
