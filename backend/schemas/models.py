from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class UpdateProfileRequest(BaseModel):
    full_name: str
    phone: str
    age: int
    gender: str

class UpdateMedicalRequest(BaseModel):
    weight: Optional[str] = ""
    height: Optional[str] = ""
    blood_type: Optional[str] = ""
    allergies: Optional[str] = ""
    blood_pressure: Optional[str] = ""
    heart_rate: Optional[str] = ""
    oxygen_level: Optional[str] = ""
    surgeries: Optional[str] = ""
    chronic_conditions: Optional[str] = ""
    vaccinations: Optional[str] = ""
    family_genetics: Optional[str] = ""

class SymptomObj(BaseModel):
    symptom_name: str
    severity: int = 5
    body_zone: Optional[str] = None
    duration_days: Optional[int] = None
    date: Optional[str] = None

class PatientProfile(BaseModel):
    patient_id: str
    full_name: str
    age: int
    gender: str
    conditions: List[str] = Field(default_factory=list)

class FamilySummaryInput(BaseModel):
    patient_id: str
    family_members: List[Dict[str, Any]] = Field(default_factory=list)

class OnboardInput(BaseModel):
    turn_number: int = 1
    message: str
    session_state: Optional[Dict[str, Any]] = Field(default_factory=dict)
    patient_id: Optional[str] = None

class DoctorAnswerInput(BaseModel):
    question: str
    patient_id: Optional[str] = None
    full_context: Optional[Dict[str, Any]] = None

class DoctorAnswerResponse(BaseModel):
    answer_found: bool = True
    answer: Optional[str] = None
    source_date: Optional[str] = None
    source_type: Optional[str] = None
    confidence: Optional[float] = 0.0
    suggested_patient_question: Optional[str] = None

class DrugInteractionInput(BaseModel):
    new_medicine: str
    active_medicines: List[str] = Field(default_factory=list)
    patient_id: Optional[str] = None

class DrugInteractionResponse(BaseModel):
    conflict_found: bool = False
    warning_text: Optional[str] = None
    severity_label: str = "informational"
    medicine_risk_score: int = 0
    recommendation: str = "Consult physician"
    source: str = "openfda"

class SmartwatchInput(BaseModel):
    patient_id: str
    metric: str
    current_values: List[float] = Field(default_factory=list)
    baseline_14day: List[float] = Field(default_factory=list)
    days_since_last_train: int = 0

class SmartwatchResponse(BaseModel):
    anomaly_detected: bool = False
    metric: str = "heart_rate"
    deviation_score: float = 0.0
    days_elevated: int = 0
    ml_confidence: float = 0.8
    detection_source: str = "statistical_baseline"
    flag_context: str = ""
    mean_baseline: float = 72.0
    std_baseline: float = 5.0

class RiskGenerateInput(BaseModel):
    patient_id: Optional[str] = None
    age: int = 45
    conditions: List[str] = Field(default_factory=list)
    symptoms: List[SymptomObj] = Field(default_factory=list)
    missed_meds_days: int = 0
    family_history: List[str] = Field(default_factory=list)
    wearable_flags: List[str] = Field(default_factory=list)
    summary: str = ""

class RiskScore(BaseModel):
    base_score: int
    rag_adjustment: int = 0
    final_score: int
    risk_level: str
    risk_reason: str
    guideline_reference: str = "Standard Protocol"
    confidence: int
    data_points_used: int = 0

class RiskPredictInput(BaseModel):
    patient_id: Optional[str] = None
    risk_scores_history: List[int] = Field(default_factory=list)
    symptoms_history: List[Dict[str, Any]] = Field(default_factory=list)
    wearable_trend: Optional[Dict[str, Any]] = Field(default_factory=dict)
    conditions: List[str] = Field(default_factory=list)
    daily_summaries: List[str] = Field(default_factory=list)

class HealthPrediction(BaseModel):
    trajectory: str
    score_slope: float = 0.0
    volatility: float = 0.0
    projected_scores: List[int] = Field(default_factory=list)
    predicted_risk_at_day_7: int = 0
    predicted_risk_level_day_7: str = "Low"
    early_warning: bool = False
    early_warning_symptom: Optional[str] = None
    prediction_summary: str = ""
    watch_for: List[str] = Field(default_factory=list)
    confidence: int = 70
    confidence_note: str = ""
    data_days_used: int = 7
