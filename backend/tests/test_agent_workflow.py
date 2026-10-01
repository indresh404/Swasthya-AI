import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.requests import AgentRequest, DoctorAnswerInput
from agents.orchestrator import run_health_continuity_agent
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

def test_flagship_demo_patient_workflow():
    print("\n--- TEST 2: FLAGSHIP PATIENT AGENT LOOP ---")
    payload = {
        "user_id": "DEMO-P001",
        "message": "I've been having breathing difficulty again",
        "language": "en"
    }
    response = client.post("/api/v1/agent", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    
    print(f"Agent: {data['agent']}")
    print(f"Status: {data['status']}")
    print(f"Response: {data['response']}")
    print(f"Context Used: {data['context_used']}")
    print(f"Tools Used: {data['tools_used']}")
    print(f"Actions: {data['actions']}")
    print(f"Memory Updated: {data['memory_updated']}")
    print(f"Requires Clinician Review: {data['requires_clinician_review']}")
    
    assert data["agent"] == "swasthya-health-continuity-agent"
    assert data["status"] == "completed"
    assert data["requires_clinician_review"] is True, "Expected escalation flag for recurrent breathlessness in cardiac patient"
    assert data["memory_updated"] is True, "Expected Neo4j memory update for symptom report"
    assert "get_patient_context" in data["tools_used"]
    assert "check_escalation_rules" in data["tools_used"]
    assert "health_event_recorded" in data["actions"]
    assert len(data.get("trace", [])) > 0, "Expected observable execution trace"
    print("[PASS]: Flagship patient agent loop executed end-to-end with deterministic safety & memory update.")

def test_doctor_qa_grounded_workflow():
    print("\n--- TEST 3: DOCTOR Q&A (GROUNDED SUMMARY) ---")
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
    print("\n--- TEST 4: DOCTOR Q&A (MISSING CONTEXT & CLOSED-LOOP QUEUE) ---")
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
    print("\n--- TEST 5: DETERMINISTIC MEDICATION CONTRAINDICATION ---")
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
    test_flagship_demo_patient_workflow()
    test_doctor_qa_grounded_workflow()
    test_doctor_qa_missing_context_closed_loop()
    test_deterministic_medication_safety()
    print("\n" + "=" * 60)
    print("ALL ACCEPTANCE TESTS PASSED (5/5)")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
