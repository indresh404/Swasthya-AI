# Medical Scan Agent

## Role

Reads and verifies uploaded documents — most centrally, income certificates used for government scheme eligibility — extracting the relevant fields and confirming them before they're used anywhere else in the system.

## Why It Exists

Government scheme eligibility depends on verified income data, not a number the patient types in. Requiring an actual uploaded document, scanned and verified, keeps the scheme-matching feature honest and prevents it from being trivially gamed by entering an arbitrary income figure.

## How It Works

1. The patient photographs or uploads their income certificate through the app (using Expo Camera).
2. The Medical Scan Agent processes the document — extracting the income figure, the issuing authority, BPL/non-BPL status, and the certificate's validity/date.
3. Extracted fields are verified for internal consistency (e.g. does the document look like a genuine income certificate format, are the required fields present) before being marked as confirmed.
4. The verified income category is written to the patient's structured profile (Supabase) and made available to the Scheme Eligibility feature for matching.

## Example Flow

```
Patient uploads: income certificate (photo)
        ↓
Medical Scan Agent extracts:
  - Income: ₹X per annum
  - Category: BPL / Non-BPL
  - Issuing authority: [authority name]
        ↓
Verified and written to patient profile (Supabase)
        ↓
Available to Scheme Eligibility matching
```

## What It Writes

| Data | Destination |
|---|---|
| Verified income category | Supabase (structured patient profile) |

## Used By

**Scheme Eligibility** feature — the verified income category from this agent is one of the three matching inputs (alongside flagged condition and patient age) used to determine which government schemes a patient qualifies for.

## Scope Note

This agent is currently scoped to income certificate verification for scheme matching. The same scan-and-extract approach is designed to extend to other document types (e.g. past prescriptions, lab reports) as the medical record timeline feature grows.
