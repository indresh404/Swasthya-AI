# Patient App — Features

Every feature below exists to feed or draw from the same health memory graph. Nothing here is a standalone tool — each one either writes a new connection into the graph or reads an explainable insight out of it.

---

**Conversational Onboarding** — No forms. A multi-turn AI conversation collects chronic conditions, medications, allergies, surgeries, and family history, asking natural follow-ups ("diabetes — insulin or tablets?"). Ends with a confirmation card before anything is saved to the graph.

**Voice-Enabled AI Chatbot** — Patients speak or type, in Hindi, Marathi, or English, through Sarvam AI. Every message is parsed for symptoms, and every symptom becomes a connected node — linked to past occurrences of the same symptom, not logged in isolation.

**Daily Adaptive Check-In** — 2–3 questions generated fresh each day from the patient's own graph: recent symptoms, active medicines, family flags. Never a static questionnaire.

**3D Body Heatmap** — A 3D body model that highlights zones based on symptom frequency and recency. Mention back pain repeatedly and the back lights up — the graph's pattern made visible at a glance.

**Family QR & Family Health Graph** — One QR per family. Each member's record stays private; the family view only shows shared, non-sensitive risk context — built by traversing relationships in the graph (father → diabetes → user's elevated risk).

**Health Pattern & Family Similarity Insights** — The system explains *why* a risk reads the way it does, citing the actual graph relationships behind it: recurring symptom, family history, or a known pattern match — never a black-box number.

**Medicine Tracker** — Add a medicine, get reminders, track adherence.

**Drug Conflict Checker (OpenFDA)** — Every new medicine is checked against everything already on the patient's list before it's saved. If a conflict exists, a plain-language warning is shown immediately — the medicine isn't saved until the check completes.

**Jan Aushadhi Calculator** — Compares the patient's current medicines against Jan Aushadhi generic equivalents, calculates real savings, and generates a printable PDF the patient can hand straight to a pharmacist.

**Government Scheme Eligibility** — When risk crosses a threshold, an agent scans the patient's uploaded income certificate, verifies it, and matches eligible government health schemes automatically — no manual search required.

**Smartwatch / Wearable Tracking** — Heart rate, SpO2, and BP sync in from Google Health Connect or Apple Health, feeding the same risk graph as self-reported symptoms.

**Doctor Q&A Check-In Loop** — If a doctor asks something the system can't yet answer, the question is queued and naturally asked back to the patient in their next check-in — closing the loop without the patient needing to be told a doctor asked.

**Appointment Booking** — Browse or get auto-matched to an available doctor and book directly from the app.
