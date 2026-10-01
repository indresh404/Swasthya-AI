"""
Seed Synthetic Demo Patient (DEMO-P001)

Creates a realistic, strictly synthetic longitudinal patient profile in Neo4j and Supabase.
Never uses real patient data.
Safe to run repeatedly.
"""

import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from dotenv import load_dotenv
load_dotenv()

from services.neo4j_health_service import neo4j_service
from services.supabase_service import SupabaseService, supabase

DEMO_PATIENT_ID = "DEMO-P001"
DEMO_PATIENT_NAME = "Ramesh Patel"
DEMO_PATIENT_AGE = 58

def seed_demo_patient():
    print("=" * 60)
    print(f"SEEDING SYNTHETIC DEMO PATIENT: {DEMO_PATIENT_ID}")
    print("=" * 60)

    # 1. Neo4j Graph Seeding
    try:
        if neo4j_service.driver:
            print("-> Creating User Node in Neo4j...")
            neo4j_service.create_user(DEMO_PATIENT_ID, DEMO_PATIENT_NAME, DEMO_PATIENT_AGE)

            print("-> Saving Chronic Conditions...")
            neo4j_service.save_condition(DEMO_PATIENT_ID, "Hypertension", "active", "2024-02-10")

            print("-> Saving Previous Dyspnea / Breathing Episode...")
            neo4j_service.save_symptom(DEMO_PATIENT_ID, "breathing difficulty", 7, "2026-09-18")
            neo4j_service.save_symptom(DEMO_PATIENT_ID, "mild chest tightness", 5, "2026-09-18")

            print("-> Saving Medications...")
            neo4j_service.save_medication(DEMO_PATIENT_ID, "Amlodipine", "5mg", "once daily", "2024-02-12")
            neo4j_service.save_medication(DEMO_PATIENT_ID, "Telmisartan", "40mg", "once daily", "2024-05-10")

            print("-> Saving Allergies...")
            neo4j_service.save_allergy(DEMO_PATIENT_ID, "Penicillin", "high", "2020-01-15")

            print("-> Saving Doctor Visit & Appointment...")
            neo4j_service.save_doctor_visit(DEMO_PATIENT_ID, "Dr. Sharma", "Cardiology Review", "2026-09-20")

            print("[SUCCESS]: Neo4j Health Graph successfully populated.")
    except Exception as e:
        print(f"[INFO]: Neo4j live seeding skipped (falling back to memory graph): {e}")

    # 2. Supabase Seeding
    try:
        print("-> Seeding Active Medications in Supabase...")
        SupabaseService.add_medicine(DEMO_PATIENT_ID, {
            "medicine_name": "Amlodipine 5mg",
            "dosage": "5mg",
            "frequency": "Once daily (Morning)",
            "is_critical": True
        })
        SupabaseService.add_medicine(DEMO_PATIENT_ID, {
            "medicine_name": "Telmisartan 40mg",
            "dosage": "40mg",
            "frequency": "Once daily (Evening)",
            "is_critical": True
        })
        print("[SUCCESS]: Supabase data initialized.")
    except Exception as e:
        print(f"[INFO]: Supabase live seeding skipped: {e}")

    print("\n" + "=" * 60)
    print(f"DEMO PATIENT {DEMO_PATIENT_ID} IS READY FOR AGENT DEMO WORKFLOW.")
    print("=" * 60)

if __name__ == "__main__":
    seed_demo_patient()
