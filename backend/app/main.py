from backend.app.routes.prompt_optimizer import router as prompt_optimizer_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import Base, engine
from backend.app.routes.test_cases import router as test_case_router
from backend.app.routes.prompts import router as prompt_router
from backend.app.routes.prompt_versions import router as prompt_version_router
from backend.app.routes.prompt_debugger import router as prompt_debugger_router



Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="PromptForge",
    description="AI Prompt Engineering and Evaluation Platform",
    version="0.1.0"
)


import os

frontend_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

deployed_frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

if deployed_frontend_url:
    frontend_origins.append(deployed_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(test_case_router)
app.include_router(prompt_router)
app.include_router(prompt_version_router)
app.include_router(prompt_debugger_router)
app.include_router(prompt_optimizer_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to PromptForge!",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }