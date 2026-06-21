# ML Model — Symptom Risk Prediction

Alongside the LLM-driven agents, Swasthya AI includes one dedicated machine learning model for symptom-based risk prediction. The agents handle extraction, reasoning, and explanation; this model handles the one task that benefits from a trained classifier instead of a prompt: estimating risk level from a structured pattern of symptoms.

---

## Why a Separate Model

LLMs are good at extracting and explaining. They are not the right tool for consistent, calibrated probability estimates over a fixed feature set. A trained classifier gives a repeatable, auditable number — the same input always produces the same output, which matters when that output feeds into an escalation decision.

The graph supplies the features. The model turns those features into a calibrated risk estimate. The Explanation step (handled by the agents, not the model) turns that number into language a patient or doctor can actually read.

---

## Model Choice

**Random Forest Classifier** (scikit-learn), trained on structured symptom data: symptom type, severity, duration, frequency of recurrence, and relevant family history flags pulled from the graph.

Random Forest was chosen over a single decision tree or logistic regression because:

- **Handles non-linear symptom combinations well** — risk isn't a straight line; chest pain alone and chest pain + breathlessness + family cardiac history behave very differently, and a forest captures that interaction without needing it hand-engineered.
- **Resistant to overfitting** on a relatively small, hackathon-scale training set, compared to a single deep tree.
- **Feature importance is directly inspectable** — which matters for an explainable system. The model can report *which* features drove a given prediction, which feeds directly into the Explanation Agent's output instead of being a black box.
- Easier to defend live in front of judges than a deep learning approach: the reasoning behind any single prediction can be shown, not just claimed.

---

## Features Used

| Feature | Source |
|---|---|
| Symptom type | Extracted from check-in / chatbot conversation |
| Severity (1–10) | Patient-reported, extracted by the Check-In Agent |
| Duration | Patient-reported |
| Recurrence count | Graph traversal — how many times this symptom (or a related one) has appeared |
| Family history flag | Graph traversal via Family Genetics Agent |
| Wearable anomaly flag | Smartwatch Risk Agent, when available |

---

## Output

| Output | Description |
|---|---|
| `risk_level` | Low / Moderate / Elevated / High |
| `confidence` | Model's confidence in the prediction |
| `top_features` | The features that most influenced this specific prediction |

The model's output is never shown to the patient as a raw number or label on its own — it is always passed to the Explanation Agent, which turns it into a plain-language reason grounded in the graph (e.g. *"Risk is elevated because this is the third time back pain has been reported this month, alongside a family history of spinal conditions"*).

---

## Honesty Note

This model represents the system's intended approach to risk prediction. It is a deliberately simple, explainable choice over a more opaque deep learning model, in keeping with the platform's core constraint: every output must be traceable back to a reason a doctor or patient can actually evaluate.
