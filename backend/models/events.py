from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ToolExecutionTrace(BaseModel):
    tool: str
    status: str = "success"
    duration_ms: float = 0.0
    details: Optional[Dict[str, Any]] = None

class AgentTraceStep(BaseModel):
    step: str
    agent: Optional[str] = None
    tool: Optional[str] = None
    status: str = "completed"
    explanation: str
    duration_ms: Optional[float] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class HealthEvent(BaseModel):
    event_id: str
    patient_id: str
    event_type: str
    source: str = "patient"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    data: Dict[str, Any] = Field(default_factory=dict)
    agent: str = "swasthya-health-continuity-agent"
    confidence: Optional[float] = None
    action_taken: Optional[str] = None
    memory_updated: bool = False
