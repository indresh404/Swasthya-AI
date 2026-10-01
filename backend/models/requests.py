from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AgentRequest(BaseModel):
    user_id: str = Field(..., min_length=1, description="Patient identifier, e.g. DEMO-P001")
    message: str = Field(..., min_length=1, description="Patient message, voice transcript, or clinical event")
    language: Optional[str] = Field(default="en", description="ISO language code (e.g. en, hi)")

class DoctorAnswerInput(BaseModel):
    question: str
    patient_id: Optional[str] = None
    full_context: Optional[Dict[str, Any]] = None

class OnboardInput(BaseModel):
    turn_number: int = 1
    message: str
    session_state: Optional[Dict[str, Any]] = Field(default_factory=dict)
    patient_id: Optional[str] = None
