# Neo4j AuraDB Track

**Requirement:** Relationships must be central to how the product works, powered by AuraDB. The graph database must not be optional or secondary — it must be the reason the product works better. AuraDB must be the primary database for core data interactions, with real queries executed against it.

---

## How Swasthya AI Meets This

Neo4j AuraDB is not a feature of Swasthya AI — it is the reasoning layer the entire product is designed around. Every core insight the system produces (recurring symptoms, family risk, pattern matches, explainable risk scores) depends on traversing relationships in the graph. None of these are achievable with flat tables and lookups; they require relationship-aware queries.

Supabase (PostgreSQL) handles structured, transactional data — authentication, medicine schedules, appointments — because that data is naturally tabular and doesn't benefit from graph modeling. **Symptoms, family history, lifestyle factors, and health patterns live in Neo4j**, because that data is fundamentally relational, and the product's core value (memory and explainability) comes directly from traversing those relationships.

---

## Why a Graph, Specifically

A stateless chatbot can say "you have a fever." It cannot say "this is the third time this month, and it follows the same pattern as when your father was diagnosed." That second sentence is only possible because the underlying data is modeled as connected nodes, not isolated rows.

---

## Data Model

**Nodes:**
- `User` — name, age, gender
- `Symptom` — fever, cough, headache, back pain, etc.
- `SymptomEvent` — date, severity, duration (an instance of a symptom being reported)
- `FamilyMember` — father, mother, sibling, grandparent
- `Disease` — diabetes, hypertension, cardiac conditions, etc.
- `Lifestyle` — smoking, exercise, sleep habits

**Relationships:**
```
(User)-[:REPORTED]->(SymptomEvent)
(SymptomEvent)-[:IS_SYMPTOM]->(Symptom)
(SymptomEvent)-[:NEXT_EVENT]->(SymptomEvent)
(SymptomEvent)-[:RECURRED_AS]->(SymptomEvent)
(User)-[:RELATED_TO]->(FamilyMember)
(FamilyMember)-[:HAS_DISEASE]->(Disease)
(User)-[:HAS_LIFESTYLE]->(Lifestyle)
(User)-[:MATCHES_PATTERN]->(HealthPattern)
```

---

## Real Queries Run Against AuraDB

**Detecting symptom recurrence:**
```cypher
MATCH (u:User {id: $userId})-[:REPORTED]->(e1:SymptomEvent)-[:IS_SYMPTOM]->(s:Symptom)
MATCH (u)-[:REPORTED]->(e2:SymptomEvent)-[:IS_SYMPTOM]->(s)
WHERE e1.date < e2.date
RETURN s.name, e1.date, e2.date, e2.date - e1.date AS gap
ORDER BY e2.date DESC
```

**Family risk traversal:**
```cypher
MATCH (u:User {id: $userId})-[:RELATED_TO]->(f:FamilyMember)-[:HAS_DISEASE]->(d:Disease)
RETURN f.relation, d.name
```

**Building the symptom timeline (chained events):**
```cypher
MATCH path = (e1:SymptomEvent)-[:NEXT_EVENT*]->(e2:SymptomEvent)
WHERE e1.userId = $userId
RETURN path ORDER BY e1.date
```

---

## Which Agents Depend on AuraDB

- **Graph Agent** — writes every new node and relationship as conversations happen
- **Family Genetics Agent** — runs the family risk traversal queries directly against AuraDB
- **Pattern Similarity / Explanation Agent** — reads connected history to generate grounded, relationship-based explanations, not generic LLM output

Without AuraDB, these agents have nothing to traverse — they would degrade into the same stateless, single-message reasoning every other health chatbot already does. The graph is not optional here; it is the entire premise of the product.
