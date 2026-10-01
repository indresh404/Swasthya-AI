from typing import Dict, Any, List
from safety.rules import SafetyRuleEngine, SafetyEvaluationResult
from tools.notification_tools import CreateClinicianNotificationTool

class EscalationAgent:
    name = "escalation-agent"

    @classmethod
    async def process(
        cls,
        patient_id: str,
        perception: Dict[str, Any],
        context: Dict[str, Any],
        safety_eval: SafetyEvaluationResult
    ) -> Dict[str, Any]:
        actions = []
        notification_created = False
        notification_id = None

        if safety_eval.requires_clinician_review:
            notif_tool = CreateClinicianNotificationTool()
            summary = f"Escalation Flag: {safety_eval.escalation_level} triggered for patient {patient_id}. Symptoms: {', '.join([s.get('name', '') for s in perception.get('symptoms', []) if isinstance(s, dict)])}"
            res = await notif_tool.execute(
                patient_id=patient_id,
                urgency=safety_eval.escalation_level,
                summary=summary,
                reasons=safety_eval.reasons
            )
            if res.get("status") == "success":
                notification_created = True
                notification_id = res["result"].get("notification_id")
                actions.append("clinician_notification_created")
                actions.append("priority_review_queued")

        return {
            "agent": cls.name,
            "requires_clinician_review": safety_eval.requires_clinician_review,
            "escalation_level": safety_eval.escalation_level,
            "reasons": safety_eval.reasons,
            "triggered_rules": safety_eval.triggered_rules,
            "notification_created": notification_created,
            "notification_id": notification_id,
            "actions": actions
        }
