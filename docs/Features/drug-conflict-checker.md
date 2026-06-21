# Drug Conflict Checker (OpenFDA)

## What It Is

A synchronous safety check that runs every time a patient adds a new medicine: the system checks it against everything already on their active medicine list using the OpenFDA drug interaction data, and blocks the save if a conflict is found — showing a plain-language warning before anything is stored.

## The Problem It Solves

Patients routinely buy and take medicines without knowing what they're already taking interacts badly with. A patient on metformin for diabetes who picks up ibuprofen over the counter for a headache has no way of knowing that combination puts stress on the kidneys — and nobody in that chain (not the pharmacist, not a generic app) is positioned to warn them at the moment it matters: before the medicine is taken.

## How It Works

1. The patient (or the system, via the Medicine Reminder Agent) attempts to add a new medicine to the active list.
2. Before it's saved, a request is made to the **OpenFDA API** with the new medicine and the full list of currently active medications.
3. OpenFDA returns known interaction data, including severity classification.
4. If an interaction is found, the result is passed through the LLM layer to generate a **plain-language warning**: which two medicines interact, what the nature of the interaction is in non-technical terms, and the severity level — Informational, Caution, or Do not take without doctor guidance.
5. The medicine is **not saved until this check completes**. This is prevention at the point of action, not a retrospective notification the patient might miss.
6. The same warning is visible on the doctor's dashboard, so a doctor reviewing the patient's medicine list sees exactly what was flagged.

```
New medicine added
        │
        ▼
OpenFDA interaction check
   (against all active meds)
        │
   ┌────┴────┐
no conflict  conflict found
   │             │
 saved      plain-language warning generated
            (severity: Informational / Caution / Do Not Take)
                 │
            shown to patient — medicine blocked until acknowledged
                 │
            same flag visible on doctor dashboard
```

## Why This Is Blocking, Not Advisory

A warning the patient can dismiss without reading is functionally the same as no warning at all. Making the check synchronous and blocking — the medicine simply isn't saved until the check completes — turns this from a notification feature into an actual prevention mechanism embedded in the moment of action, which is the only point where it can actually stop something from happening.

## What's Shown in the Warning

| Field | Description |
|---|---|
| Interacting medicines | The two (or more) medicines involved |
| Plain-language explanation | What the interaction actually means, non-technically |
| Severity level | Informational / Caution / Do not take without doctor guidance |
| Recommendation | Consult the prescribing doctor before proceeding |

## Agent Responsible

**Medicine Reminder Agent** — owns the medicine list and triggers the OpenFDA check on every addition; the plain-language warning generation is handled by the LLM layer feeding off the raw OpenFDA response.
