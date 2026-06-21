# Doctor Appointment System

## What It Is

A booking flow where a patient either chooses a doctor directly or is automatically matched to one based on availability, with the booking instantly reflected on the doctor's web dashboard — backed by the patient's existing health graph context, so the doctor isn't starting from zero.

## The Problem It Solves

Booking a doctor's appointment today is disconnected from everything the patient has already told the app. The doctor walks into the appointment with no more context than usual, even though the platform already has weeks of relevant health history sitting in the graph. Separately, manually browsing and picking a doctor is unnecessary friction when the system already knows the patient's condition and could match them automatically.

## How It Works

1. The patient browses available doctors in the app, or requests auto-assignment.
2. If auto-assignment is chosen, the **Appointment Automation Agent** matches the patient to an available doctor based on specialty relevance (drawn from the patient's flagged conditions) and open time slots.
3. The patient selects or confirms a date and time.
4. The booking is written to Supabase (structured, transactional data) and immediately appears on the doctor's web dashboard.
5. When the doctor opens that appointment, they see the patient's graph-derived summary attached — recent symptoms, family risk context, and any pending Doctor Q&A questions — rather than a blank slot with just a name and time.

## Why Structured Data (Supabase), Not the Graph, Powers Booking

Appointments are inherently transactional — a time slot, a status, a doctor ID, a patient ID. This is exactly what a relational table is good at, and forcing it into the graph would add no reasoning value. The graph still supplies the *context* attached to the appointment; Supabase handles the *scheduling mechanics*. This is a deliberate split, not an inconsistency — Neo4j is used where relationships matter, Supabase where structured records do.

## What the Doctor Sees Per Appointment

| Field | Description |
|---|---|
| Patient name & basic info | Standard identification |
| Reason for visit | If provided at booking |
| Graph-derived summary | Recent symptoms, family risk flags, relevant history |
| Pending Doctor Q&A | Any questions the doctor previously asked that are now answered |

## Agent Responsible

**Appointment Automation Agent** — handles matching and booking logic. The patient summary attached to each appointment is generated the same way as the rest of the dashboard's patient view, via the underlying health graph.
