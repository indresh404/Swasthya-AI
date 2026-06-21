# Government Scheme Eligibility

## What It Is

An automatic, condition-aware feature that surfaces relevant government healthcare schemes the moment a patient's risk crosses a meaningful threshold — without the patient needing to search for, understand, or apply for anything manually.

## The Problem It Solves

Patients diagnosed with a serious or chronic condition are often completely unaware that schemes like Ayushman Bharat (PM-JAY) or applicable state-level programs could cover a significant share of their treatment cost. The information exists, but it's scattered, bureaucratic, and rarely reaches the patient at the moment they actually need it.

## How It Works

1. When the patient's risk score (computed from the health graph) crosses an elevated threshold for a given condition, the system flags eligibility for scheme matching.
2. The patient uploads an **income certificate**, which the **Medical Scan Agent** reads, verifies, and extracts the relevant fields from (income bracket, BPL/non-BPL status, issuing authority).
3. Eligibility is matched using three data points:
   - The flagged condition
   - The patient's age (from their confirmed profile)
   - The verified income category
4. The patient is shown a condition-specific panel listing applicable schemes — coverage amount, conditions covered, documents required, and (where available) nearby empanelled hospitals.

## Why This Is Triggered Automatically, Not On-Demand

Most patients don't know to ask. By tying the scheme search to the same risk threshold that already exists in the system — rather than waiting for the patient to think to look for it — the financial guidance reaches the patient at the exact moment it's relevant, the same way the rest of the platform proactively surfaces insight instead of waiting to be asked.

## What's Shown Per Scheme

| Field | Description |
|---|---|
| Scheme name | e.g. Ayushman Bharat (PM-JAY), applicable state schemes |
| Conditions covered | Which diagnoses qualify |
| Age / income eligibility | Requirements to qualify |
| Coverage amount | What the scheme actually pays for |
| Documents required | What the patient needs to bring |
| Empanelled hospitals (where available) | Nearby facilities accepting the scheme |

## Agent Responsible

The **Medical Scan Agent** handles document verification; the matching logic itself runs against the Government Health Scheme dataset (see `DATASET.md`) using the verified income and flagged condition as inputs.
