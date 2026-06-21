# Sarvam Chat Agent

## Role

Handles the voice layer of the entire system — converting a patient's spoken message into text via Sarvam AI's Speech-to-Text, and converting every agent's text response back into natural spoken audio via Sarvam's Text-to-Speech, in the patient's chosen language.

## Why It Exists

Typing is not the natural mode of communication for a large share of Swasthya AI's intended users, and English is often not their first or most comfortable language. A health app that only accepts typed English excludes exactly the population that needs continuous, low-friction health support the most. This agent is what makes Hindi- and Marathi-speaking patients first-class users of the system, not an edge case handled poorly.

## How It Works

1. Patient speaks into the app. Audio is captured and sent to Sarvam's STT endpoint.
2. Sarvam returns transcribed text, with language automatically detected (Hindi, Marathi, or English).
3. The transcribed text is handed to whichever agent owns the current conversation — Onboarding Agent, Check-In Agent, or the general chatbot flow.
4. That agent's text response is sent back through Sarvam's TTS endpoint, generating natural spoken audio in the same language the patient used.
5. The audio is played back to the patient — the entire interaction can happen without the patient reading or typing a single word.

## Example Flow

```
Patient (speaking): "मुझे 3 दिन से बुखार है"
        ↓ Sarvam STT
Text: "मुझे 3 दिन से बुखार है" (I've had a fever for 3 days)
        ↓ handed to Check-In Agent / Symptom Extraction
Response generated: "आपको डॉक्टर से सलाह लेनी चाहिए।"
        ↓ Sarvam TTS
Patient hears the response spoken back in Hindi
```

## What It Writes

This agent doesn't write to the graph directly — it's a transport layer. The text it produces flows into whichever conversational agent owns that turn (Onboarding, Check-In, or general chat), and that agent handles extraction and graph writes as usual.

## Languages Supported

Hindi, Marathi, English — selectable by the patient, detected per message.
