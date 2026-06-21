# Patient App

**Stack:** React Native (Expo), TypeScript, Zustand (state), Expo Router (navigation)

The patient app is where the health graph gets built. Every conversation, check-in, and medicine added feeds into Neo4j and Supabase, and every screen reads back from that same connected data — so nothing the patient says is ever asked twice.

---

## What It Does

A patient downloads the app, registers, and is onboarded through a **conversation, not a form**. From that point on, the app is a daily companion: a voice-enabled chatbot that remembers, a body map that visually shows where problems are concentrated, a medicine tracker that checks for dangerous combinations and finds cheaper generics, a family group that shares risk context without exposing private records, and a government scheme finder that surfaces help automatically when it's needed.

---

## Core Flows

### 1. Onboarding
No dropdowns, no forms. The Onboarding Agent has a natural conversation — in voice or text, in Hindi, Marathi, or English — and extracts chronic conditions, medications, allergies, surgeries, and family history as it goes. Ends with a confirmation card the patient reviews before anything is saved.

### 2. Family Setup
After onboarding, the patient creates a new family group (generates a shareable QR) or joins an existing one with a family code. Every member keeps a fully private individual record — the family view only ever shows aggregate, non-sensitive risk context.

### 3. Daily Check-In
A short, adaptive conversation — 2 to 3 questions generated from the patient's own history, not a static questionnaire. If the patient mentioned back pain three days ago, the check-in asks how it's evolved.

### 4. AI Chatbot
The always-available conversational entry point. Patients describe symptoms in natural language (voice or text), the system extracts structured data behind the scenes, updates the health graph, and responds with context-aware follow-up.

### 5. Body Heatmap
A 3D body model (GLB, rendered via Three.js in a WebView) that highlights zones based on accumulated symptom history. Mention back pain repeatedly, and the back lights up — a visual, immediate way to see where the pattern is.

### 6. Medicine Tracker
Add a medicine, get a synchronous conflict check against everything already on the list (OpenFDA-powered), see Jan Aushadhi generic pricing for cost comparison, and set reminders.

### 7. Government Schemes
When risk crosses a threshold, the app surfaces relevant schemes automatically, matched against the patient's income (verified via an uploaded income certificate) and condition.

### 8. Appointments
Browse or get matched to a doctor, book a slot, and have your summarised profile ready for them before you walk in.

---

## Key Screens

| Screen | Purpose |
|---|---|
| `(auth)` | Login, OTP, welcome |
| `(onboarding)` | Conversational profile builder, family setup, summary confirmation |
| `(tabs)/home` | Risk score, body map card, alerts, family members, smartwatch widget |
| `(tabs)/chatbot` | Main AI conversation interface |
| `(tabs)/checkin` | Daily adaptive check-in |
| `(tabs)/meds` | Medicine list, conflict warnings, Jan Aushadhi pricing |
| `(tabs)/profile` | Full medical profile, family tab, health graph view, schemes, AI insights |

---

## What Makes the App Different

It's not a logging tool. The patient never has to remember what they said last time — the app already knows, because every fact lives as a connected node in the health graph, not a buried message in a chat history nobody re-reads.
