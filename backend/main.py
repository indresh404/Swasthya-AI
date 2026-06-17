from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, profiles, chat, health_graph, health_chat
import os

app = FastAPI(
    title="Swasthya AI Backend",
    description="Python FastAPI backend for authentication and profile management.",
    version="1.0.0"
)

# CORS Configuration
# Allow local Expo development, React Vite development, and production Render sites
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:3000",
        "http://localhost:19006",
        "http://localhost:8000",
    ],
    allow_origin_regex="https://.*\\.onrender\\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Route
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Mount MVP Routers
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(chat.router)
app.include_router(health_graph.router)
app.include_router(health_chat.router)

@app.get("/")
async def root():
    return {
        "app": "Swasthya AI",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
