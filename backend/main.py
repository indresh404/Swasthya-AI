import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("swasthya")

app = FastAPI(
    title="Swasthya AI — Health Continuity Agent",
    description="Multilingual agentic healthcare continuity system orchestrating specialized sub-agents with longitudinal Neo4j memory and deterministic safety triage.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS Configuration
allowed_origins = [
    "http://localhost:8081",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:19006",
    "http://localhost:8000",
]
custom_origins = os.getenv("CORS_ORIGINS")
if custom_origins:
    allowed_origins.extend([origin.strip() for origin in custom_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*(\.onrender\.com|\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Route — Strict contract
@app.get("/health", tags=["Health & Status"])
async def health_check():
    return {
        "status": "healthy",
        "agent": "swasthya-health-continuity-agent",
        "version": "1.0.0"
    }

# Mount Primary Swasthya Agent Router
from routes import agent_api
app.include_router(agent_api.router)

# Mount Existing Modular Routers with Graceful Fallback
from routes import auth, profiles, chat, health_graph, health_chat, meds

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(chat.router)
app.include_router(health_graph.router)
app.include_router(health_chat.router)
app.include_router(meds.router)

# Optional existing routers
try:
    from routes import agents, safety, risk, checkins, family, schemes
    app.include_router(agents.router)
    app.include_router(safety.router)
    app.include_router(risk.router)
    app.include_router(checkins.router)
    app.include_router(family.router)
    app.include_router(schemes.router)
except Exception as e:
    logger.warning(f"Could not load auxiliary routes: {e}")

@app.get("/", tags=["Health & Status"])
async def root():
    return {
        "app": "Swasthya AI",
        "agent": "swasthya-health-continuity-agent",
        "status": "online",
        "version": "1.0.0",
        "endpoint": "/api/v1/agent",
        "health": "/health",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting Swasthya AI Agent backend on 0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
