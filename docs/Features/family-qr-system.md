# Family QR System

## What It Is

One QR code shared by an entire family unit, acting as a group health identity — without exposing any individual member's private records.

## The Problem It Solves

A doctor treating one family member often needs context about the others — a father's hypertension matters when assessing a son's risk — but pulling that context today means asking the patient to remember and report it verbally, which is unreliable and incomplete. At the same time, family members should not be able to see each other's private medical records just because they're related.

## How It Works

1. The first family member to onboard creates a family group. The backend generates a unique QR code tied to that group's ID.
2. Other family members join by scanning the QR or entering a shareable family code.
3. Each member retains a **fully private individual account** — their own conversations, symptom history, and medicines are never accessible through the family QR.
4. The QR only unlocks an **aggregate, non-sensitive view**: which members are linked, their general risk level, and shared condition tags (e.g. "diabetes present in family") — not specific records, conversations, or sensitive diagnoses.
5. The Family Genetics Agent uses the underlying graph relationships (not the QR itself) to power family risk reasoning for each individual member's own profile.

## Why a Graph Makes This Better

This isn't just a shared folder. The family relationship is a real edge in the Neo4j graph — `(User)-[:RELATED_TO]->(FamilyMember)-[:HAS_DISEASE]->(Disease)` — which means family risk can be *traversed* and reasoned over, not just displayed as a static list. A new disease added to a family member's profile immediately becomes available context for every other linked member's risk reasoning, without anyone re-entering it.

## What's Shown vs. What's Private

| Visible via Family QR | Never Visible |
|---|---|
| Member is linked to the group | Specific symptoms or conversations |
| General, non-sensitive risk level | Sensitive diagnoses (mental health, HIV, etc.) |
| Shared condition tags (e.g. "diabetes in family") | Medicine lists |
| Member count and basic profile info | Check-in history |

## Where the QR Is Used

- Shown in the patient app at any time, displayable on screen or printable
- Scanned by a doctor in the web dashboard to load the family overview before drilling into an individual member's full record (with the individual's own consent/access)
