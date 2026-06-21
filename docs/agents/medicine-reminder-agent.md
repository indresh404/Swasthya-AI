# Medicine Reminder Agent

## Role

Owns the patient's medicine list end-to-end: reminders, adherence tracking, and — critically — the synchronous OpenFDA drug interaction check that runs every time a new medicine is added, before it's ever saved.

## Why It Exists

Medicine management in most health apps is passive — a list with alarms. This agent treats it as an active safety layer: nothing gets added to a patient's regimen without first being checked against everything else they're already taking, because that's the one moment where a warning can actually prevent harm instead of just documenting it afterward.

## How It Works

### Adding a Medicine (Conflict Check)
1. Patient (or doctor, via the dashboard) adds a new medicine.
2. The agent calls the **OpenFDA API** with the new medicine and the patient's full current medicine list.
3. If a conflict is found, a plain-language warning is generated (which medicines interact, what it means, severity level) and shown to the patient **before the medicine is saved**.
4. Only once the check completes — with no conflict, or with the conflict acknowledged — is the medicine actually added to the active list.

See [`Features/drug-conflict-checker.md`](../Features/drug-conflict-checker.md) for full detail on this flow.

### Reminders
Once a medicine is on the list, the agent schedules reminders based on the prescribed frequency and logs whether each dose was taken on time.

### Adherence Tracking
Missed doses are tracked over time. Patterns of missed adherence for medicines tied to chronic conditions (e.g. consistently missing a diabetes medication) are surfaced to both the patient and, where relevant, flagged on the doctor's dashboard.

## Example Flow

```
Patient adds: Ibuprofen
        ↓
Agent checks against active list: [Metformin]
        ↓
OpenFDA returns: interaction flagged (kidney stress risk in diabetic patients)
        ↓
Plain-language warning shown — "Caution" severity
        ↓
Patient acknowledges → medicine saved with flag attached
        ↓
Same flag visible on doctor dashboard
```

## What It Writes

| Data | Destination |
|---|---|
| Active medicine list | Supabase |
| Conflict flags | Supabase (visible to both patient and doctor) |
| Adherence log | Supabase |

## Related Features

- [Drug Conflict Checker](../Features/drug-conflict-checker.md)
- [Jan Aushadhi Calculator](../Features/jan-aushadhi-calculator.md) — uses this agent's medicine list as its input
