# 3D Body Heatmap

## What It Is

An interactive 3D human body model that visually highlights zones of the body where the patient has repeatedly reported symptoms — turning weeks of conversation history into something that can be understood in three seconds, by anyone, regardless of language or literacy.

## The Problem It Solves

A patient might mention back pain in passing during three different check-ins over a month, never realizing — and never being shown — that this is a pattern. A doctor reading a chat transcript would have to read every message to notice the same thing. A visual, cumulative representation makes the pattern obvious immediately, without anyone having to read anything at all.

## How It Works

1. The 3D body model is a `.glb` (GLTF binary) file rendered using **Three.js inside a WebView**, embedded within the Expo app (not a separate native 3D engine — this keeps it fully inside the Expo ecosystem).
2. Every time the Symptom Extraction Agent identifies a symptom with an associated body zone (e.g. "back pain" → lower back), the Graph Agent writes that as a connected `SymptomEvent` node linked to the relevant zone.
3. A zone's highlight intensity is computed from:
   - **Frequency** — how many times this zone has been mentioned
   - **Severity** — how severe those reports were
   - **Recency decay** — older reports contribute less; a resolved symptom fades back toward neutral over time, rather than staying permanently red
4. The patient (and, separately, the doctor) can tap any highlighted zone to see exactly which symptoms, on which dates, contributed to that zone's current state.

## Why a Graph Makes This Different From a Static Body Diagram

The heatmap isn't colored by a single "current symptom" field — it's colored by *traversing the patient's symptom history graph* for that zone, applying recency decay across however many connected `SymptomEvent` nodes exist. This is exactly the kind of cumulative, relationship-based computation that a flat table would make awkward and a graph makes natural.

## Where It's Used

- **Patient app** — home screen card and dedicated heatmap view, so the patient can see their own pattern building over time
- **Doctor dashboard** — the same visualization, giving the doctor the full-body risk picture before reading a single note

## What Tapping a Zone Reveals

| Detail | Description |
|---|---|
| Contributing symptoms | Which specific symptoms were logged in this zone |
| Timeline | When each was reported |
| Severity trend | Whether it's worsening, stable, or improving |
| Recurrence count | How many times this zone has come up |
