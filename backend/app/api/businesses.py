import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.identity.dependencies import get_current_user, require_safe_origin
from app.identity.models import User
from app.tenancy import service
from app.tenancy.schemas import BusinessCreate, BusinessRead, BusinessUpdate
from app.tenancy.service import BusinessNotFound

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.post(
    "",
    response_model=BusinessRead,
    status_code=201,
    dependencies=[Depends(require_safe_origin)],
)
def create_business(
    payload: BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.create_business(db, payload, current_user.id)


@router.get("", response_model=list[BusinessRead])
def list_businesses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_businesses(db, current_user.id)


@router.get("/{business_id}", response_model=BusinessRead)
def get_business(
    business_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return service.get_business(db, business_id, current_user.id)
    except BusinessNotFound:
        raise HTTPException(status_code=404, detail="Business not found")


@router.patch(
    "/{business_id}",
    response_model=BusinessRead,
    dependencies=[Depends(require_safe_origin)],
)
def update_business(
    business_id: uuid.UUID,
    payload: BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return service.update_business(db, business_id, payload, current_user.id)
    except BusinessNotFound:
        raise HTTPException(status_code=404, detail="Business not found")


@router.delete(
    "/{business_id}",
    status_code=204,
    dependencies=[Depends(require_safe_origin)],
)
def delete_business(
    business_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        service.delete_business(db, business_id, current_user.id)
    except BusinessNotFound:
        raise HTTPException(status_code=404, detail="Business not found")
