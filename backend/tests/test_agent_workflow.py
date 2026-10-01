import asyncio
import os
import sys
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.requests import AgentRequest, DoctorAnswerInput
from agents.orchestrator import SwasthyaHealthContinuityAgent, run_health_continuity_agent
from agents.doctor_qa import DoctorQAAgent
from safety.rules import SafetyRuleEngine
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    print("\n--- TEST 1: GET /health ---")
    response = client.get("/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "healthy"
    assert data["agent"] == "swasthya-health-continuity-agent"
    assert data["version"] == "1.0.0"
    print("[PASS]: Health endpoint returned healthy status with correct agent metadata.")

def test_symptom_perception_variations():
    print("\n--- TEST 2: SYMPTOM PERCEPTION VARIATIONS ---")
    variations = [
        ("I have breathing difficulty again", "breathing difficulty", "recurrent"),
        ("I am experiencing difficulty breathing", "breathing difficulty", "acute"),
        ("I feel shortness of breath since yesterday", "breathing difficulty", "acute"),
        ("I had severe breathlessness again today", "breathing difficulty", "recurrent"),
        ("I am having trouble breathing again", "breathing difficulty", "recurrent"),
    ]
    for msg, expected_symptom, expected_temporal in variations:
        perception = asyncio.run(SwasthyaHealthContinuityAgent._understand_input(msg, "en"))
        symptom_names = [s["name"] for s in perception.get("symptoms", [])]
        assert expected_symptom in symptom_names, f"Failed to extract '{expected_symptom}' from: '{msg}'. Got: {symptom_names}"
        assert perception["temporal_context"] == expected_temporal, f"Expected temporal_context '{expected_temporal}' for '{msg}', got: '{perception['temporal_context']}'"
        assert perception["intent"] == "symptom_report"
        print(f"  [PASS] Parsed '{msg}' -> symptom: '{expected_symptom}', temporal: '{perception['temporal_context']}', intent: '{perception['intent']}'")
    print("[PASS]: All breathing difficulty symptom variations correctly normalized.")

def test_flagship_demo_patient_workflow():
    print("\n--- TEST 3: FLAGSHIP PATIENT AGENT LOOP (EXACT USER REQUEST) ---")
    payload = {
        "user_id": "DEMO-P001",
        "message": "I've been having breathing difficulty again",
        "language": "en"
    }
    response = client.post("/api/v1/agent", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    print("\n=== EXACT JSON RESPONSE FROM POST /api/v1/agent ===")
    print(json.dumps(data, indent=2))
    print("==================================================\n")
    
    assert data["agent"] == "swasthya-health-continuity-agent"
    assert data["status"] == "completed"
    assert data["requires_clinician_review"] is True, "Expected escalation flag for recurrent breathlessness in cardiac patient"
    assert data["memory_updated"] is True, "Expected Neo4j memory update for symptom report"
    
    # Verify rich retrieved context
    assert len(data["context_used"]) > 0, "context_used must not be empty"
    assert any("breathing difficulty" in c.lower() or "breath" in c.lower() for c in data["context_used"]), "Expected previous breathlessness in context_used"
    assert any("amlodipine" in c.lower() or "telmisartan" in c.lower() for c in data["context_used"]), "Expected active medications in context_used"
    assert any("hypertension" in c.lower() for c in data["context_used"]), "Expected hypertension in context_used"
    
    # Verify tools used
    assert "get_patient_context" in data["tools_used"]
    assert "get_active_medications" in data["tools_used"]
    assert "check_escalation_rules" in data["tools_used"]
    assert "create_clinician_notification" in data["tools_used"]
    assert "update_health_memory" in data["tools_used"]
    assert "create_health_event" in data["tools_used"]
    
    # Verify actions
    assert "clinician_notification_created" in data["actions"]
    assert "follow_up_required" in data["actions"]
    assert "health_event_recorded" in data["actions"]
    
    # Verify trace steps
    trace_steps = [t["step"] for t in data.get("trace", [])]
    assert "Perceive & Understand" in trace_steps
    assert "Retrieve Memory" in trace_steps
    assert "Specialized Agent Routing" in trace_steps
    assert "Deterministic Safety Check" in trace_steps
    assert "Escalation Workflow" in trace_steps
    assert "Memory Update" in trace_steps
    
    # Check trace step details
    step1 = next(t for t in data["trace"] if t["step"] == "Perceive & Understand")
    assert "symptom_report" in step1["explanation"]
    assert "breathing difficulty" in step1["explanation"]
    assert "recurrent" in step1["explanation"]
    
    step2 = next(t for t in data["trace"] if t["step"] == "Retrieve Memory")
    assert "Ramesh Patel" in step2["explanation"]
    assert "58" in step2["explanation"]
    
    step4 = next(t for t in data["trace"] if t["step"] == "Deterministic Safety Check")
    assert "URGENT_EVALUATION" in step4["explanation"]
    assert "RULE_01_RECURRENT_DYSPNEA_CARDIO_RISK" in step4["explanation"]

    print("[PASS]: Flagship patient agent loop executed end-to-end with real perception, retrieved context, deterministic safety, and graph memory update.")

def test_doctor_qa_grounded_workflow():
    print("\n--- TEST 4: DOCTOR Q&A (GROUNDED SUMMARY) ---")
    payload = {
        "question": "What happened during the patient's recent breathing episodes?",
        "patient_id": "DEMO-P001"
    }
    response = client.post("/api/v1/agent/doctor-qa", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    print(f"Grounded: {data['grounded']}")
    print(f"Answer: {data['answer']}")
    print(f"Sources: {data['sources_used']}")
    
    assert data["grounded"] is True
    assert data["answer"] is not None
    assert "2026-09-18" in data["answer"] or "Amlodipine" in data["answer"] or "dyspnea" in data["answer"].lower() or "breathing" in data["answer"].lower()
    print("[PASS]: Doctor question answered strictly grounded in patient graph memory.")

def test_doctor_qa_missing_context_closed_loop():
    print("\n--- TEST 5: DOCTOR Q&A (MISSING CONTEXT & CLOSED-LOOP QUEUE) ---")
    payload = {
        "question": "What are the patient's recent fasting glucose and HbA1c sugar levels?",
        "patient_id": "DEMO-P001"
    }
    response = client.post("/api/v1/agent/doctor-qa", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    print(f"Grounded: {data['grounded']}")
    print(f"Missing Info: {data['missing_information']}")
    print(f"Follow-up Required: {data['follow_up_required']}")
    print(f"Suggested Question for Patient: {data['suggested_patient_question']}")
    
    assert data["grounded"] is False, "Expected ungrounded response when chart lacks lab results"
    assert data["follow_up_required"] is True
    assert data["suggested_patient_question"] is not None
    print("[PASS]: Closed-loop follow-up question generated and queued for next patient check-in.")

def test_deterministic_medication_safety():
    print("\n--- TEST 6: DETERMINISTIC MEDICATION CONTRAINDICATION ---")
    active_meds = [{"medicine_name": "Amlodipine", "dosage": "5mg"}]
    allergies = [{"name": "Penicillin", "severity": "high"}]
    
    res = SafetyRuleEngine.evaluate_medication_interaction(
        new_medicine="Amoxicillin 500mg",
        active_medications=active_meds,
        patient_allergies=allergies
    )
    print(f"Allergy Collision Found: {res['conflict_found']}")
    print(f"Conflicts: {res['conflicts']}")
    assert res["conflict_found"] is True
    assert any("allergy" in c.lower() for c in res["conflicts"])
    print("[PASS]: Deterministic medication collision accurately detected.")

def run_all_tests():
    print("=" * 60)
    print("RUNNING SWASTHYA AI ACCEPTANCE TEST SUITE")
    print("=" * 60)
    test_health_endpoint()
    test_symptom_perception_variations()
    test_flagship_demo_patient_workflow()
    test_doctor_qa_grounded_workflow()
    test_doctor_qa_missing_context_closed_loop()
    test_deterministic_medication_safety()
    print("\n" + "=" * 60)
    print("ALL ACCEPTANCE TESTS PASSED (6/6)")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
