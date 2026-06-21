# Datasets

Swasthya AI's deterministic features — medicine matching, price comparison, scheme eligibility, and drug safety — are powered by real-world reference datasets rather than LLM-generated guesses. The LLM agents extract and reason; these datasets supply the ground truth they reason over.

---

## 1. Indian Medicines Dataset

**Used by:** Medicine Tracker, Jan Aushadhi Calculator, Medicine Reminder Agent

**Purpose:** Maps branded medicine names to their composition, dosage form, and generic equivalents, so a patient can search by the brand name they actually see on the strip and still get matched to the right generic.

**Source:** Kaggle (Indian medicines dataset) — *exact dataset name/link TBD, to be added.*

---

## 2. Jan Aushadhi Price Dataset

**Used by:** Jan Aushadhi Calculator, scheme/affordability features

**Purpose:** Provides official generic medicine pricing under the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) scheme, used to calculate the price gap between a patient's current branded medicine and its Jan Aushadhi generic equivalent.

**Source:** Jan Aushadhi official dataset — *exact source link TBD, to be added.*

---

## 3. Government Health Scheme Data

**Used by:** Scheme Eligibility feature, Medical Scan Agent (income certificate verification)

**Purpose:** Eligibility rules, coverage details, and documentation requirements for schemes such as PM-JAY (Ayushman Bharat) and applicable state-level schemes, matched against a patient's verified income category and flagged condition.

**Source:** *TBD — to be compiled/sourced and added.*

---

## 4. Drug Interaction Data (OpenFDA)

**Used by:** Drug Conflict Checker

**Purpose:** Live interaction lookups — not a static dataset, but a real-time API call against OpenFDA's drug interaction data every time a new medicine is added, checked against everything already on the patient's list.

**Source:** [OpenFDA API](https://open.fda.gov/) — official, live, public.

---

## Note on Completeness

The medicine and Jan Aushadhi dataset entries above are marked TBD where the exact dataset link has not yet been finalised — the integration and feature logic are built around them; only the citation needs to be filled in before submission.
