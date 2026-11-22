
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.businesses import router as businesses_router
from app.api.health import router as health_router
from app.api.transactions import router as transactions_router
from app.api.analytics import router as analytics_router
from app.core.config import ALLOWED_ORIGINS
from app.api.ai_assistant import router as ai_assistant_router

app = FastAPI(title="BusinessFlow AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(businesses_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(ai_assistant_router, prefix="/api/v1")
