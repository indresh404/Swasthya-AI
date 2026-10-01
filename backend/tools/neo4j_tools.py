from tools.base import AgentTool
from services.neo4j_health_service import neo4j_service
import os
from typing import Dict, Any, List
from datetime import datetime

# In-memory synthetic fallback cache for demo patient
DEMO_PATIENT_GRAPH = {
    "DEMO-P001": {
        "name": "Ramesh Patel",
        "age": 58,
        "conditions": [{"name": "Hypertension", "status": "active", "date": "2024-02-10"}],
        "symptoms": [
            {"name": "breathing difficulty", "severity": 7, "date": "2026-09-18", "status": "active"},
            {"name": "mild chest tightness", "severity": 5, "date": "2026-09-18", "status": "active"}
        ],
        "medications": [
            {"name": "Amlodipine", "dosage": "5mg", "frequency": "once daily", "start_date": "2024-02-12"},
            {"name": "Telmisartan", "dosage": "40mg", "frequency": "once daily", "start_date": "2024-05-10"}
        ],
        "allergies": [{"name": "Penicillin", "severity": "high"}],
        "family_history": ["Cardiac disease (Father)", "Hypertension (Mother)"],
        "appointments": [
            {"doctor": "Dr. Sharma", "specialty": "Cardiologist", "date": "2026-10-10", "reason": "Quarterly cardiology follow-up"}
        ],
        "events": [
            {"date": "2026-09-18", "event_type": "symptom_report", "summary": "Patient reported acute breathlessness episode on exertion."}
        ]
    }
}

class GetPatientContextTool(AgentTool):
    name = "get_patient_context"
    description = "Retrieve relevant longitudinal health context for a patient from Neo4j knowledge graph."

    async def run(self, patient_id: str, **kwargs) -> Dict[str, Any]:
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        
        # Check if Neo4j is operational
        if not demo_mode and neo4j_service.driver:
            try:
                with neo4j_service.driver.session() as session:
                    res = session.run("""
                        MATCH (u:User {id: $patient_id})
                        OPTIONAL MATCH (u)-[rs:HAS_SYMPTOM]->(s:Symptom)
                        OPTIONAL MATCH (u)-[rc:HAS_CONDITION]->(c:Condition)
                        OPTIONAL MATCH (u)-[rm:TAKES_MEDICATION]->(m:Medication)
                        OPTIONAL MATCH (u)-[ra:HAS_ALLERGY]->(a:Allergy)
                        RETURN u.name as name, u.age as age,
                               collect(distinct {name: s.name, severity: rs.severity, last_reported: rs.last_reported}) as symptoms,
                               collect(distinct {name: c.name, status: rc.status}) as conditions,
                               collect(distinct {name: m.name, dosage: rm.dosage, frequency: rm.frequency}) as medications,
                               collect(distinct {name: a.name, severity: ra.severity}) as allergies
                    """, patient_id=patient_id)
                    record = res.single()
                    if record and record["name"]:
                        return {
                            "patient_id": patient_id,
                            "name": record["name"],
                            "age": record["age"],
                            "symptoms": [s for s in record["symptoms"] if s.get("name")],
                            "conditions": [c for c in record["conditions"] if c.get("name")],
                            "medications": [m for m in record["medications"] if m.get("name")],
                            "allergies": [a for a in record["allergies"] if a.get("name")],
                            "source": "neo4j_live_graph"
                        }
            except Exception as e:
                print(f"[GetPatientContextTool] Neo4j live query fallback: {e}")

        # Synthetic fallback for Demo Mode or Unconnected Graph
        if patient_id in DEMO_PATIENT_GRAPH:
            data = DEMO_PATIENT_GRAPH[patient_id].copy()
            data["patient_id"] = patient_id
            data["source"] = "synthetic_longitudinal_memory"
            return data
        
        # Generic fallback for any other patient ID
        return {
            "patient_id": patient_id,
            "name": f"Patient {patient_id}",
            "age": 45,
            "symptoms": [],
            "conditions": [],
            "medications": [],
            "allergies": [],
            "source": "default_unseeded_context"
        }

class GetRecentHealthEventsTool(AgentTool):
    name = "get_recent_health_events"
    description = "Retrieve chronological list of past health events, episodes, and check-ins."

    async def run(self, patient_id: str, limit: int = 5, **kwargs) -> List[Dict[str, Any]]:
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        if not demo_mode and neo4j_service.driver:
            try:
                timeline = neo4j_service.get_health_timeline(patient_id)
                if timeline:
                    return timeline[:limit]
            except Exception as e:
                print(f"[GetRecentHealthEventsTool] Error: {e}")

        if patient_id in DEMO_PATIENT_GRAPH:
            return DEMO_PATIENT_GRAPH[patient_id].get("events", [])
        return []

class UpdateHealthMemoryTool(AgentTool):
    name = "update_health_memory"
    description = "Update patient longitudinal health graph in Neo4j with newly observed symptoms, events, or facts."

    async def run(self, patient_id: str, event_type: str, data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        updated_items = []
        
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"

        # Try Live Neo4j Update
        if not demo_mode and neo4j_service.driver:
            try:
                if "symptom" in data or "symptoms" in data:
                    symptom_list = data.get("symptoms", [data.get("symptom")]) if isinstance(data.get("symptoms"), list) else [data.get("symptom")]
                    for sym in symptom_list:
                        if sym:
                            name = sym.get("name") if isinstance(sym, dict) else str(sym)
                            sev = sym.get("severity", 5) if isinstance(sym, dict) else 5
                            neo4j_service.save_symptom(patient_id, name, sev, today)
                            updated_items.append(f"symptom:{name}")
                if "condition" in data:
                    neo4j_service.save_condition(patient_id, data["condition"], "active", today)
                    updated_items.append(f"condition:{data['condition']}")
                if "fact" in data:
                    neo4j_service.save_fact(patient_id, data["fact"], "general", today)
                    updated_items.append("fact")
            except Exception as e:
                print(f"[UpdateHealthMemoryTool] Neo4j save error: {e}")

        # Update in-memory demo patient store
        if patient_id in DEMO_PATIENT_GRAPH:
            if "symptom" in data or "symptoms" in data:
                syms = data.get("symptoms") or [data.get("symptom")]
                for s in syms:
                    if s:
                        name = s.get("name") if isinstance(s, dict) else str(s)
                        DEMO_PATIENT_GRAPH[patient_id]["symptoms"].append({
                            "name": name,
                            "severity": s.get("severity", 6) if isinstance(s, dict) else 6,
                            "date": today,
                            "status": "active"
                        })
                        updated_items.append(f"memory_graph:Symptom({name})")
            
            DEMO_PATIENT_GRAPH[patient_id]["events"].append({
                "date": today,
                "event_type": event_type,
                "summary": str(data.get("summary") or data)
            })

        return {
            "success": True,
            "patient_id": patient_id,
            "updated_nodes": updated_items or ["health_event_node"],
            "timestamp": today
        }
