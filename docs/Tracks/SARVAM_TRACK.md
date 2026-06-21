# Sarvam AI Track

**Requirement:** Sarvam APIs must play a central role in the user experience or product functionality. Core product functionality should rely on Sarvam's AI capabilities, not a secondary add-on.

---

## How Swasthya AI Meets This

Voice is a primary interaction mode in Swasthya AI, not an accessibility afterthought bolted onto a text app. Sarvam AI powers both directions of every voice interaction: the patient speaks, Sarvam converts it to text for the agent pipeline to process; the agent responds, Sarvam converts that response back to natural speech — in the patient's own language.

This matters specifically for the population the product is built for. A large share of patients in India are far more comfortable speaking than typing, and many are far more comfortable in Hindi or Marathi than in English. A text-only, English-first health app simply excludes them. Sarvam is what removes that barrier.

---

## Where Sarvam Is Used

| Capability | Where It's Used |
|---|---|
| **Speech-to-Text (STT)** | Onboarding conversation, daily check-ins, AI chatbot — every voice message a patient sends |
| **Text-to-Speech (TTS)** | Every agent response that the patient hears spoken back, in the same language they used |
| **Multilingual support** | Hindi, Marathi, and English, selectable by the patient and detected per message |

---

## Example Flow

```
Patient speaks: "मुझे 3 दिन से बुखार है"
        ↓
Sarvam STT → "मुझे 3 दिन से बुखार है" (text)
        ↓
Symptom extraction (fever, 3 days, moderate severity)
        ↓
Graph update (Neo4j) + reasoning
        ↓
Agent response generated: "आपको डॉक्टर से सलाह लेनी चाहिए।"
        ↓
Sarvam TTS → spoken response in Hindi
```

This loop runs identically for the Onboarding Agent, Check-In Agent, and the main AI chatbot (Sarvam Chat Agent) — voice is not a separate "mode," it is the default interaction path.

---

## Why Sarvam Is Central, Not Optional

If Sarvam were removed, the product would lose its primary interaction method for a large share of its intended users — not a convenience feature, but the actual front door to the app for anyone not fluent in typed English. The accessibility pillar of Swasthya AI depends directly on Sarvam working correctly, every time a patient opens the app.

---

## Demo

Live voice interaction demo: *(to be shown during presentation — onboarding or check-in conducted fully by voice, in Hindi)*
