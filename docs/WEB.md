# Doctor Web Dashboard

**Stack:** React, TypeScript, Vite

The doctor dashboard is where the health graph pays off for the person on the other side of the consultation. A doctor scans a patient's ID, and instead of a blank record or a stack of paper, they get a summarised, explainable picture of that patient's recent health — built from everything the patient has told the app, without the doctor having to ask for any of it again.

---

## What It Does

Doctors log in, see who needs attention, scan or search for a patient, and get the full context — symptoms, history, habits, family risk — summarised in seconds. They can ask the AI direct questions about a specific patient and get answers grounded in that patient's actual data. They manage appointments and review medicine lists with conflict history attached.

---

## Core Flows

### 1. Patient Lookup
Scan a patient's QR (individual or family) or search by ID. The full profile loads instantly — no waiting on the patient to pull up their own records.

### 2. Patient Summary
A condensed, AI-generated view of the patient's recent health: symptoms reported, how they've evolved, medicine adherence, family risk factors, and anything flagged as concerning — built from the Neo4j health graph, not a raw chat transcript the doctor has to read through.

### 3. AI Assistant (Doctor Q&A)
A free-text interface where the doctor asks a direct question about the patient — *"Has this patient had recurring headaches?"* — and gets an answer grounded in that patient's own data. If the answer isn't available yet, the question is queued and asked to the patient automatically in their next check-in.

### 4. Appointments
Doctors see their booked appointments, patient context attached to each slot, and can manage scheduling.

### 5. Medicine Review
Full visibility into a patient's active medicines, dosage, and any conflict flags raised by the conflict checker — including ones the patient already saw on their end.

---

## Key Pages

| Page | Purpose |
|---|---|
| `Landing` | Public landing page |
| `Auth` / `SignUp` | Doctor login and registration |
| `Dashboard` | Main overview — patients needing attention, summary cards |
| `Scanner` | QR scan entry point for patient lookup |
| `Profile` | Doctor's own profile |
| `Medicine` | Patient medicine list and conflict history |
| `Appointments` | Appointment management |

---

## What Makes the Dashboard Different

The doctor isn't reading a chat log. They're reading a **reasoned summary** — built from a graph that already understands which symptoms are recurring, which are new, and which connect to a family history the patient may not have even thought to mention out loud.
