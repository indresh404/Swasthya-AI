# Doctor Q&A Loop

## What It Is

A free-text interface where a doctor asks a question about a specific patient in plain language, and the system either answers immediately from the patient's existing graph data — or, if the answer isn't available, automatically asks the patient on the doctor's behalf during their next check-in.

## The Problem It Solves

A doctor often has a specific question that isn't fully answered by a static summary: *"Has this patient had recurring headaches before?"* or *"Is the chest pain from last week still present?"* Normally, this question either goes unanswered until the next in-person visit, or requires the doctor to manually message the patient outside the platform. Neither closes the loop reliably.

## How It Works

### Answer-Found Path
1. The doctor types a question in the dashboard.
2. The **Doctor Q&A Agent** searches the patient's Neo4j graph and any structured records for a grounded answer.
3. If the answer exists, it's returned immediately — along with the source data and date it came from, so the doctor can evaluate it, not just trust it blindly.

### Answer-Not-Found Path
1. If the graph doesn't contain enough information to answer, the agent doesn't return "no data available" and stop there.
2. It rewrites the doctor's question into natural, conversational language suitable for the patient.
3. The question is queued and automatically inserted into the patient's **next check-in** conversation.
4. When the patient answers, the Check-In Agent extracts the response, the Graph Agent writes it into the health graph, and the doctor is notified that their question has been answered.

```
Doctor asks → checked against graph
       │
   ┌───┴───┐
 found   not found
   │         │
 answer   question rewritten
returned  → queued → asked in
to doctor   patient's next check-in
                 │
            patient answers
                 │
            graph updated
                 │
          doctor notified
```

## Why This Is the Most Original Part of the System

Most "ask a question about this patient" features stop at "data not available." This loop treats that as an unfinished task, not a dead end — the system goes and gets the answer through the same conversational channel it already uses with the patient, then reports back. This only works because the conversation and the graph are the same continuous system, not two disconnected tools.

## Agent Responsible

**Doctor Q&A Agent** — handles both the search-and-answer path and the question-rewriting/queueing logic. Hands off to the **Check-In Agent** to actually deliver the question to the patient.
