# Jan Aushadhi Calculator

## What It Is

A feature that compares a patient's current medicines against their Jan Aushadhi (government generic medicine scheme) equivalents, calculates the real cost savings, and generates a clean, printable PDF the patient can hand directly to a pharmacist.

## The Problem It Solves

Many patients on long-term medication for chronic conditions are paying significantly more than necessary for branded medicines, simply because they don't know a generic equivalent exists under the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) scheme — or because comparing prices and finding the right generic match is too much friction to bother with.

## How It Works

1. The patient's active medicines (already tracked in the Medicine Tracker) are matched against the Indian Medicines Dataset to identify their generic composition.
2. That composition is cross-referenced against the Jan Aushadhi price dataset to find the equivalent generic product and its official price.
3. The calculator computes:
   - Cost of current medicine (monthly)
   - Cost of Jan Aushadhi equivalent (monthly)
   - Monthly savings
   - Annual savings (projected)
4. A **PDF is generated** listing every active medicine, its Jan Aushadhi equivalent, and the price comparison — formatted so the patient can simply show or print it at a Jan Aushadhi Kendra (government generic pharmacy outlet) without having to explain anything verbally.

## Why This Matters

For a patient managing a chronic condition like diabetes or hypertension, medicine cost is a recurring, compounding expense. A clear, no-effort cost comparison — paired with a document they can just hand over — removes the two real barriers to switching: not knowing the option exists, and not knowing how to act on it at the pharmacy counter.

## What the PDF Includes

| Field | Description |
|---|---|
| Medicine name (branded) | What the patient is currently taking |
| Generic composition | The active ingredient(s) |
| Jan Aushadhi equivalent | Matched generic product name |
| Current price | Branded medicine cost |
| Jan Aushadhi price | Generic equivalent cost |
| Monthly / annual savings | Calculated difference |

## Important Note

This is explicitly **not a medical prescription**. It is a generic-reference cost comparison document. The disclaimer is shown clearly on the generated PDF — the patient still needs their doctor's actual prescription; this tool only helps them get the same medicine for less.
