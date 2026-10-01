from fastapi import APIRouter, HTTPException, status
from models.requests import AgentRequest, DoctorAnswerInput, OnboardInput
from models.responses import AgentResponse, DoctorAnswerResponse
from agents.orchestrator import run_health_continuity_agent
from agents.doctor_qa import DoctorQAAgent
from agents.onboarding import OnboardingAgent
from agents.cognitive import CognitiveRiskAgent
import logging

logger = logging.getLogger("swasthya.agent")
router = APIRouter(prefix="/api/v1", tags=["Swasthya Health Continuity Agent"])

@router.post(
    "/agent",
    response_model=AgentResponse,
    status_code=status.HTTP_200_OK,
    summary="Invoke Swasthya Health Continuity Agent",
    description="Primary agent endpoint that receives patient/clinician inputs, retrieves longitudinal graph context, executes tools, evaluates deterministic safety rules, triggers actions, and updates health memory."
)
async def handle_agent_request(request: AgentRequest) -> AgentResponse:
    """
    POST /api/v1/agent
    
    Standardized public agent API endpoint compatible with aiKart API testing mode.
    
    - Accepts: user_id, message, optional language
    - Executes complete agentic cycle:
      Perceive -> Understand -> Retrieve -> Route -> Tools -> Safety -> Action -> Memory -> Response
    """
    try:
        logger.info(f"[AgentAPI] Request for patient={request.user_id} lang={request.language}")
        response = await run_health_continuity_agent(request)
        return response
    except Exception as e:
        logger.error(f"[AgentAPI] Error processing agent request: {e}", exc_info=True)
        # Return structured partial/error response without leaking internal crash details
        return AgentResponse(
            agent="swasthya-health-continuity-agent",
            status="error",
            response="I am currently experiencing a temporary processing issue. If you are having severe symptoms, please seek immediate in-person medical care.",
            context_used=[],
            tools_used=[],
            actions=[],
            memory_updated=False,
            requires_clinician_review=True,
            demo_mode=True
        )

@router.post(
    "/agent/doctor-qa",
    response_model=DoctorAnswerResponse,
    summary="Clinician Grounded Q&A",
    description="Answers clinician questions grounded strictly in patient Neo4j graph context. If ungrounded, queues a patient follow-up question for the next check-in."
)
async def handle_doctor_qa(data: DoctorAnswerInput) -> DoctorAnswerResponse:
    try:
        res = await DoctorQAAgent.process(
            patient_id=data.patient_id or "DEMO-P001",
            question=data.question,
            context=data.full_context
        )
        return DoctorAnswerResponse(**res)
    except Exception as e:
        logger.error(f"[DoctorQA] Error: {e}")
        return DoctorAnswerResponse(
            grounded=False,
            answer_found=False,
            answer=None,
            missing_information=["Unable to access graph memory."],
            follow_up_required=False
        )

@router.get(
    "/agent/cognitive-signal/{patient_id}",
    summary="Cognitive-Risk Clinical Support Signal",
    description="Returns calibrated cognitive-risk review prioritization scores and explainability weights for clinician review queue. Not a diagnostic AI."
)
async def get_cognitive_support_signal(patient_id: str, age: int = 58):
    return CognitiveRiskAgent.evaluate_priority(patient_id=patient_id, age=age)
