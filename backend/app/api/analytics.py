import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.identity.dependencies import get_current_user
from app.analytics.schemas import AnalyticsSummary
from app.analytics.service import (
    BusinessNotFound,
    get_analytics_summary,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsSummary)
def read_analytics(
    business_id: uuid.UUID | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="start_date cannot be after end_date",
        )

    try:
        return get_analytics_summary(
            db=db,
            owner_id=current_user.id,
            business_id=business_id,
            start_date=start_date,
            end_date=end_date,
        )
    except BusinessNotFound:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )