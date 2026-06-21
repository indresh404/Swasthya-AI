# Family Genetics Agent

## Role

Traverses the family branch of the patient's health graph to surface inherited and shared risk — father has diabetes, user shows early signs of the same pattern — and keeps that reasoning fully explainable: which relationship, which condition, why it's relevant.

## Why It Exists

Family history is one of the strongest predictors of risk in conditions like diabetes, hypertension, and cardiac disease, but it's almost never actually used in the moment a doctor is evaluating a patient — it's buried in a verbal history the patient may not think to repeat at every visit. This agent makes family risk a live, queryable part of every relevant interaction instead of a fact mentioned once during onboarding and then forgotten.

## How It Works

1. During onboarding, family members and their known conditions are written into the graph as `FamilyMember` nodes connected via `HAS_DISEASE` relationships.
2. Whenever a risk assessment is needed — during a check-in, a doctor's question, or the ML risk model's feature extraction — the Family Genetics Agent runs a graph traversal:
   ```cypher
   MATCH (u:User {id: $userId})-[:RELATED_TO]->(f:FamilyMember)-[:HAS_DISEASE]->(d:Disease)
   RETURN f.relation, d.name
   ```
3. The result is passed to the Explanation Agent as grounded context — never just a flag, always tied to the specific relationship and condition that produced it.

## Example Output

```
Query: Does this patient have relevant family risk for cardiac issues?

Result: Father — Hypertension
        Grandfather — Cardiac event (age 58)

Used in explanation: "Risk is elevated in part because of a family history
of hypertension (father) and a cardiac event in your grandfather."
```

## What It Reads

Reads only — does not write new data. Pulls from `FamilyMember` and `Disease` nodes already established during onboarding or later updated through the Family QR system.

## Used By

- **Check-In Agent**, to inform which questions are clinically relevant for this specific patient
- **Explanation Agent**, to ground risk explanations in specific, named family relationships rather than vague risk language
- **ML Model**, as one of the structured input features for risk prediction
