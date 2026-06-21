# Onboarding Agent

## Role

Runs the very first conversation a patient has with Swasthya AI. Builds the patient's initial health profile through natural, adaptive dialogue instead of a form — and writes the first nodes and relationships into the health graph.

## Why It Exists

A form asks the same fixed questions to everyone. A conversation can follow up intelligently: if a patient mentions diabetes, the agent immediately asks insulin or oral medication, what dosage, how long ago diagnosed — the way an actual intake conversation with a clinician would go, not a static intake sheet.

## How It Works

1. The conversation can happen by voice (via the Sarvam Chat Agent) or text, in Hindi, Marathi, or English.
2. The agent works through a fixed schema of fields it needs to collect — chronic conditions, current medications and dosages, allergies, past surgeries, family disease history, optional income category — but collects them through natural back-and-forth, adapting its next question to whatever the patient just said.
3. The agent tracks which fields are filled and which remain, so the conversation never feels repetitive or robotic.
4. Once all fields are populated, the agent outputs a structured profile and shows the patient a **confirmation card** — a clear summary of everything extracted — before anything is committed.
5. On confirmation, the Graph Agent writes the initial `User`, `Disease`, `FamilyMember`, and `Lifestyle` nodes and their relationships into Neo4j, and structured fields (login, basic profile) are written to Supabase.

## Example Interaction

```
Agent: Do you have any ongoing health conditions?
Patient: Yes, I have diabetes.
Agent: Okay — are you on insulin or oral tablets, and how long ago were you diagnosed?
Patient: Oral tablets, about 4 years ago.
Agent: Got it. Any other conditions, like blood pressure?
...
```

## What It Writes

| Data | Destination |
|---|---|
| Conditions, family history, lifestyle | Neo4j (graph nodes + relationships) |
| Basic profile, income category | Supabase (structured) |

## Hands Off To

Once onboarding is complete, the **Check-In Agent** takes over for all future daily interactions — onboarding only runs once per patient.
