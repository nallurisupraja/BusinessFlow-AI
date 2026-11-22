from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import engine

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    # Never raise: report degraded state instead
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "ok"}
    except Exception:
        return {"status": "degraded", "database": "unavailable"}
