# Doctor Q&A Agent

## Role

Answers a doctor's free-text question about a specific patient, grounded entirely in that patient's own graph data. If the answer isn't available yet, it rewrites the question for the patient and queues it for their next check-in — closing the loop automatically instead of leaving the doctor with "no data available."

## Why It Exists

A doctor's question deserves an actual answer, not just a confirmation that the system doesn't currently have one. Most systems stop at the second option. This agent treats a missing answer as an unfinished task — it goes and gets it through the same conversational channel the system already uses with the patient.

## How It Works

### When the Answer Exists
1. Doctor types a question in the dashboard: *"Has this patient had recurring headaches?"*
2. The agent searches the patient's Neo4j graph (and structured Supabase records where relevant) for grounded data.
3. If found, the answer is returned with its **source and date** attached, so the doctor can evaluate it rather than just trust it.

### When the Answer Doesn't Exist
1. The agent rewrites the doctor's question into natural, conversational language suitable for asking the patient directly.
2. The question is queued.
3. On the patient's **next check-in**, the Check-In Agent inserts this question naturally into the conversation.
4. The patient's answer is extracted and written to the graph, exactly like any other check-in response.
5. The Doctor Q&A Agent notifies the doctor that their question has now been answered.

See [`Features/doctor-qna-loop.md`](../Features/doctor-qna-loop.md) for the full flow diagram.

## Example

```
Doctor: "Is the chest pain from last week still present?"
        ↓
Agent searches graph → no recent update on this specific symptom found
        ↓
Question rewritten: "How has your chest discomfort been since last week —
still there, better, or gone?"
        ↓
Queued → asked in patient's next check-in
        ↓
Patient answers → graph updated → doctor notified
```

## What It Writes

| Data | Destination |
|---|---|
| Answered questions + source/date | Returned to doctor dashboard |
| Queued questions | Supabase (pending question queue) |

## Depends On

**Check-In Agent**, to actually deliver queued questions to the patient and route the extracted answer back.
