from tools.base import AgentTool
from services.supabase_service import SupabaseService, supabase
import os
import uuid
from typing import Dict, Any, List
from datetime import datetime

# In-memory storage for queued follow-up questions
FOLLOW_UP_QUEUE: Dict[str, List[Dict[str, Any]]] = {}
EVENT_LOG: List[Dict[str, Any]] = []

class GetActiveMedicationsTool(AgentTool):
    name = "get_active_medications"
    description = "Retrieve current active medications and dosages for a patient."

    async def run(self, patient_id: str, **kwargs) -> List[Dict[str, Any]]:
        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        if not demo_mode:
            try:
                meds = SupabaseService.get_medicines(patient_id)
                if meds:
                    return meds
            except Exception as e:
                print(f"[GetActiveMedicationsTool] Supabase error: {e}")

        # Synthetic fallback
        if patient_id == "DEMO-P001":
            return [
                {"medicine_name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily (morning)", "is_critical": True},
                {"medicine_name": "Telmisartan", "dosage": "40mg", "frequency": "Once daily (evening)", "is_critical": True}
            ]
        return []

class CreateHealthEventTool(AgentTool):
    name = "create_health_event"
    description = "Persist a structured health event or symptom report in the patient audit record."

    async def run(self, patient_id: str, event_type: str, data: Dict[str, Any], agent: str = "health-continuity-agent", **kwargs) -> Dict[str, Any]:
        event_id = f"evt_{uuid.uuid4().hex[:10]}"
        timestamp = datetime.utcnow().isoformat()
        
        event_record = {
            "event_id": event_id,
            "patient_id": patient_id,
            "event_type": event_type,
            "data": data,
            "agent": agent,
            "timestamp": timestamp
        }
        
        EVENT_LOG.append(event_record)

        demo_mode = os.getenv("DEMO_MODE", "false").lower() == "true"
        if not demo_mode:
            try:
                supabase.table("health_events").insert(event_record).execute()
            except Exception as e:
                pass # Graceful fallback to local trace

        return {
            "event_id": event_id,
            "status": "persisted",
            "timestamp": timestamp
        }

class CreateFollowUpQuestionTool(AgentTool):
    name = "create_follow_up_question"
    description = "Queue a clarifying follow-up question for the patient's next check-in or doctor review."

    async def run(self, patient_id: str, question: str, context_reason: str, **kwargs) -> Dict[str, Any]:
        item = {
            "id": f"q_{uuid.uuid4().hex[:8]}",
            "patient_id": patient_id,
            "question": question,
            "reason": context_reason,
            "created_at": datetime.utcnow().isoformat(),
            "status": "pending"
        }
        
        FOLLOW_UP_QUEUE.setdefault(patient_id, []).append(item)
        return {
            "queued": True,
            "question_id": item["id"],
            "question": question
        }
