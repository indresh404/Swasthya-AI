"""
Cognitive-Risk Prioritization & Clinical-Support Signal Agent

DISCLAIMER:
This module is a clinical-support prioritization signal derived from statistical risk
features (e.g. OASIS-derived clinical indicators, age, longitudinal memory trends).
It is NOT a diagnostic AI and does NOT diagnose Alzheimer's or predict onset.
It assists clinicians in prioritizing patient charts for clinical review.
"""

from typing import Dict, Any, List
import math

class CognitiveRiskAgent:
    name = "cognitive-risk-agent"

    @classmethod
    def evaluate_priority(
        cls,
        patient_id: str,
        age: int,
        mmse_score: float = 28.0,
        cdr_level: float = 0.0,
        memory_complaint_frequency: int = 0,
        family_history_cognitive: bool = False
    ) -> Dict[str, Any]:
        """
        Calculate calibrated clinical review priority score (0 - 100)
        """
        # Baseline score from age
        base = max(0.0, (age - 50) * 0.8)
        
        # Clinical indicator weights
        mmse_weight = max(0.0, (30.0 - mmse_score) * 4.0)
        cdr_weight = cdr_level * 30.0
        complaint_weight = min(20.0, memory_complaint_frequency * 5.0)
        family_weight = 10.0 if family_history_cognitive else 0.0

        raw_sum = base + mmse_weight + cdr_weight + complaint_weight + family_weight
        # Logistic calibration between 0 and 100
        calibrated_probability = round(1.0 / (1.0 + math.exp(-0.06 * (raw_sum - 35))), 3)
        priority_score = int(calibrated_probability * 100)

        if priority_score >= 70:
            priority_tier = "High Priority Review"
        elif priority_score >= 40:
            priority_tier = "Moderate Priority Review"
        else:
            priority_tier = "Routine Monitoring"

        explanations = [
            {"feature": "Age Factor", "impact": round(base, 1), "description": f"Patient age ({age}) contributing to baseline review bracket."},
            {"feature": "Cognitive Screening Score", "impact": round(mmse_weight, 1), "description": f"MMSE score baseline of {mmse_score}/30."},
            {"feature": "Longitudinal Memory Mentions", "impact": round(complaint_weight, 1), "description": f"{memory_complaint_frequency} self-reported cognitive mentions in check-in history."}
        ]

        return {
            "agent": cls.name,
            "patient_id": patient_id,
            "clinical_support_signal": "Cognitive-Risk Prioritization",
            "priority_tier": priority_tier,
            "calibrated_score": priority_score,
            "calibrated_probability": calibrated_probability,
            "explanations": explanations,
            "clinician_action": "Recommended for periodic cognitive wellness follow-up." if priority_score >= 40 else "Standard routine wellness."
        }
