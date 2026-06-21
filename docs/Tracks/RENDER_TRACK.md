# Render Workflows Track

**Requirement:** The product must use Render Workflows, with at least one workflow consisting of multiple connected tasks/stages, demonstrated through a live deployment on Render, performing meaningful work beyond simple deployment or API calls. Evidence of workflow runs/logs must be included.

---

## How Swasthya AI Meets This

Swasthya AI's agent pipeline is not a single LLM call — it's a sequence of distinct stages, each with its own responsibility, that must run in order, handle failure gracefully, and sometimes wait on external input (a patient's next check-in) before completing. This is exactly the kind of multi-stage, reliability-sensitive process Render Workflows is built for, and it sits at the center of the product rather than as an optional add-on.

The **Daily Workflow Orchestrator** is the primary Render Workflow: it chains together voice processing, symptom extraction, graph updates, family risk analysis, pattern matching, explanation generation, and the final recommendation — seven distinct stages, each calling a different agent, each able to retry independently if one step fails.

---

## Primary Workflow — Daily Workflow Orchestrator

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
Pattern Similarity Agent (compare against known patterns)
        ↓
Explanation Agent (generate grounded reasoning)
        ↓
Recommendation Agent (generate next-step guidance)
        ↓
Voice Response (Sarvam TTS)
```

This is a single patient interaction, but it touches seven independently-owned agent stages. Running this as one unsupervised function call would mean any single failure (a slow Neo4j query, a Groq timeout) silently breaks the entire response. Running it as a Render Workflow means each stage executes, retries, and logs independently — and the workflow can be inspected stage-by-stage when something goes wrong.

---

## Secondary Workflow — Escalation & Doctor Notification

Triggered whenever the Escalation Agent detects a danger-signal combination:

```
Escalation Detected
        ↓
Severity Classification (rule-based, deterministic)
        ↓
Doctor Lookup (which doctor is assigned to this patient)
        ↓
Notification Dispatch (push notification + dashboard alert)
        ↓
Graph Log (escalation event recorded for future context)
```

This runs in the background, independent of whether the patient is still in the app, and must complete reliably even if the patient closes the conversation immediately after the triggering message.

---

## Why Render Workflows, Specifically

- **Reliability** — a missed escalation notification or a half-written graph update is not an acceptable failure mode in a health product. Workflow-level retry support directly addresses this.
- **Background execution** — the doctor Q&A loop depends on a question being queued and re-asked during the *patient's next* check-in, potentially hours or days later. This requires durable, stateful orchestration, not a synchronous function call.
- **Observability** — every stage of every patient interaction can be traced, which matters both for debugging during development and for the kind of auditability a health product should have from day one.

---

## Evidence

Workflow run logs / execution screenshots from the live Render deployment: *(to be attached before submission)*
