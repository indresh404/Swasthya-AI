from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from models.events import AgentTraceStep

class AgentResponse(BaseModel):
    agent: str = Field(default="swasthya-health-continuity-agent")
    status: str = Field(default="completed")
    response: str = Field(..., description="Clinically grounded patient-facing response")
    context_used: List[str] = Field(default_factory=list, description="Longitudinal patient context retrieved")
    tools_used: List[str] = Field(default_factory=list, description="List of tools invoked in this agent loop")
    actions: List[str] = Field(default_factory=list, description="System and workflow actions executed")
    memory_updated: bool = Field(default=False, description="Whether longitudinal graph memory was modified")
    requires_clinician_review: bool = Field(default=False, description="Deterministic safety escalation flag")
    trace: Optional[List[AgentTraceStep]] = Field(default=None, description="Observable step-by-step agent execution trace")
    demo_mode: Optional[bool] = Field(default=None, description="Indicates if synthetic demo fallback was used")

class HealthStatusResponse(BaseModel):
    status: str = "healthy"
    agent: str = "swasthya-health-continuity-agent"
    version: str = "1.0.0"
    mode: str = "production"
    services: Dict[str, str] = Field(default_factory=dict)

class DoctorAnswerResponse(BaseModel):
    grounded: bool = True
    answer_found: bool = True
    answer: Optional[str] = None
    source_date: Optional[str] = None
    source_type: Optional[str] = None
    confidence: Optional[float] = None
    sources_used: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    follow_up_required: bool = False
    suggested_patient_question: Optional[str] = None
