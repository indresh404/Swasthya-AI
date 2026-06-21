# Check-In Agent

## Role

Generates short, adaptive daily check-in conversations — 2 to 3 questions, freshly generated each day from the patient's own graph — and extracts structured data from whatever the patient answers.

## Why It Exists

A static daily questionnaire ("rate your pain 1-10, did you take your medicine, how did you sleep") becomes ignorable noise within a week. A check-in that visibly remembers what the patient said yesterday — and follows up specifically on it — stays relevant, and surfaces real signal instead of routine box-ticking.

## How It Works

1. Before generating questions, the agent reads the patient's recent graph context: symptoms reported in the last few days, active medicines, family risk flags, and any pending Doctor Q&A questions that need to be asked.
2. It generates 2-3 personalised questions. If the patient mentioned lower back pain three days ago, one question asks whether it's improved, worsened, or stayed the same.
3. If a Smartwatch Risk Agent anomaly is on file (e.g. elevated resting heart rate), a relevant question is included — about chest comfort or breathlessness — without the patient bringing it up first.
4. As the patient answers (by voice or text), each response is passed through symptom extraction, and the result is written to the graph as a new `SymptomEvent`, connected via `RECURRED_AS` if it matches a prior report of the same symptom.
5. If a Doctor Q&A question is pending for this patient, it's woven naturally into the conversation, and the answer is routed back to notify the doctor once extracted.

## Example Interaction

```
Agent: Yesterday you mentioned your lower back was hurting — how is it today?
Patient: Still there, maybe a bit worse.
Agent: Got it, noted. Also — your watch showed your heart rate was a bit higher
        than usual the last two nights. Any chest discomfort or trouble breathing?
Patient: No, I feel fine on that front.
```

## What It Writes

| Data | Destination |
|---|---|
| New/recurring `SymptomEvent` nodes | Neo4j |
| Check-in completion log | Supabase |

## Depends On

- **Family Genetics Agent** and **Smartwatch Risk Agent** outputs, for context-aware question generation
- **Doctor Q&A Agent**, for injecting pending doctor questions into the conversation
