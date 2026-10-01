from tools.base import AgentTool
import uuid
from typing import Dict, Any
from datetime import datetime

CLINICIAN_NOTIFICATIONS: list[Dict[str, Any]] = []

class CreateClinicianNotificationTool(AgentTool):
    name = "create_clinician_notification"
    description = "Create a high-priority clinical review notification in the doctor's action queue."

    async def run(self, patient_id: str, urgency: str, summary: str, reasons: list[str], **kwargs) -> Dict[str, Any]:
        notification_id = f"notif_{uuid.uuid4().hex[:8]}"
        record = {
            "notification_id": notification_id,
            "patient_id": patient_id,
            "urgency": urgency,
            "summary": summary,
            "reasons": reasons,
            "status": "unread",
            "created_at": datetime.utcnow().isoformat()
        }
        CLINICIAN_NOTIFICATIONS.append(record)
        return {
            "success": True,
            "notification_id": notification_id,
            "urgency": urgency,
            "summary": summary
        }
