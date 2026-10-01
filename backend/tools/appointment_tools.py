from tools.base import AgentTool
from typing import Dict, Any, List
from datetime import datetime

APPOINTMENTS_STORE: Dict[str, List[Dict[str, Any]]] = {
    "DEMO-P001": [
        {
            "id": "apt-101",
            "doctor": "Dr. Sharma",
            "specialty": "Cardiology",
            "date": "2026-10-10",
            "time": "10:30 AM",
            "type": "In-Person",
            "status": "confirmed"
        }
    ]
}

class GetAppointmentsTool(AgentTool):
    name = "get_appointments"
    description = "Retrieve upcoming and past appointments for a patient."

    async def run(self, patient_id: str, **kwargs) -> List[Dict[str, Any]]:
        return APPOINTMENTS_STORE.get(patient_id, [])

class CreateAppointmentEventTool(AgentTool):
    name = "create_appointment_event"
    description = "Schedule or record an appointment follow-up event."

    async def run(self, patient_id: str, doctor: str, specialty: str, date: str, time: str, **kwargs) -> Dict[str, Any]:
        apt = {
            "id": f"apt-{datetime.utcnow().strftime('%f')[:4]}",
            "doctor": doctor,
            "specialty": specialty,
            "date": date,
            "time": time,
            "type": "In-Person",
            "status": "scheduled"
        }
        APPOINTMENTS_STORE.setdefault(patient_id, []).append(apt)
        return {
            "success": True,
            "appointment": apt
        }
