# Appointment Automation Agent

## Role

Matches patients to available doctors and handles booking — either the patient chooses directly, or the agent auto-assigns based on doctor specialty relevance and open time slots — with the booking instantly reflected on the doctor's dashboard, attached to the patient's existing graph context.

## Why It Exists

Booking a doctor's appointment is usually disconnected from everything the platform already knows about the patient. This agent closes that gap on two fronts: it removes the friction of manually browsing for a relevant doctor when the system already knows the patient's flagged conditions, and it ensures the resulting appointment carries the patient's health context with it instead of starting from nothing.

## How It Works

1. The patient either browses the doctor list directly, or requests auto-assignment.
2. For auto-assignment, the agent matches based on:
   - Specialty relevance to the patient's flagged conditions (drawn from the health graph)
   - Doctor availability (open time slots)
3. The patient confirms a date and time.
4. The booking is written to Supabase and immediately visible on the doctor's web dashboard.
5. When the doctor opens the appointment, the patient's graph-derived summary (recent symptoms, family risk context, any pending Doctor Q&A) is attached automatically — see [`Features/doctor-appointment-system.md`](../Features/doctor-appointment-system.md) for the full flow.

## Example Flow

```
Patient requests auto-match for: recurring back pain
        ↓
Agent matches: orthopedic specialist with an open slot this week
        ↓
Patient confirms slot
        ↓
Booking written to Supabase
        ↓
Appears on doctor's dashboard with attached graph summary:
"3 reports of lower back pain over 2 weeks, family history of spinal condition (father)"
```

## What It Writes

| Data | Destination |
|---|---|
| Appointment record (doctor, patient, time, status) | Supabase |

## Why Supabase, Not the Graph

Appointments are transactional records — a time slot, a status, two IDs — exactly what a relational table handles well. The graph still supplies the *context* attached to the appointment; this agent just doesn't duplicate that reasoning into the graph itself. See [`Tracks/NEO4J_TRACK.md`](../Tracks/NEO4J_TRACK.md) for the full reasoning behind the Neo4j/Supabase split.
