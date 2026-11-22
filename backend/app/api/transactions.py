import uuid
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.finance import service
from app.finance.schemas import TransactionCreate, TransactionRead, TransactionUpdate
from app.identity.dependencies import get_current_user, require_safe_origin
from app.identity.models import User

router = APIRouter(prefix="/transactions", tags=["transactions"])

NOT_FOUND = "Transaction not found"


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=TransactionRead,
    dependencies=[Depends(require_safe_origin)],
)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return service.create_transaction(db, payload, current_user.id)
    except service.BusinessNotFound:
        raise HTTPException(status_code=404, detail="Business not found")


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    business_id: uuid.UUID | None = None,
    transaction_type: Literal["income", "expense"] | None = None,
    category: str | None = Query(default=None, max_length=60),
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=422, detail="start_date must be on or before end_date")
    return service.list_transactions(
        db, current_user.id, business_id, transaction_type, category, start_date, end_date
    )


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return service.get_transaction(db, transaction_id, current_user.id)
    except service.TransactionNotFound:
        raise HTTPException(status_code=404, detail=NOT_FOUND)


@router.patch(
    "/{transaction_id}",
    response_model=TransactionRead,
    dependencies=[Depends(require_safe_origin)],
)
def update_transaction(
    transaction_id: uuid.UUID,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return service.update_transaction(db, transaction_id, payload, current_user.id)
    except service.TransactionNotFound:
        raise HTTPException(status_code=404, detail=NOT_FOUND)


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_safe_origin)],
)
def delete_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service.delete_transaction(db, transaction_id, current_user.id)
    except service.TransactionNotFound:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
