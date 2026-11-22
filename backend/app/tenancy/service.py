import uuid

from sqlalchemy.orm import Session

from app.tenancy import repository
from app.tenancy.models import Business
from app.tenancy.schemas import BusinessCreate, BusinessUpdate


class BusinessNotFound(Exception):
    pass


def create_business(
    db: Session, payload: BusinessCreate, owner_id: uuid.UUID
) -> Business:
    return repository.create_business(db, payload.model_dump(), owner_id)


def list_businesses(db: Session, owner_id: uuid.UUID) -> list[Business]:
    return repository.list_businesses(db, owner_id)


def get_business(
    db: Session, business_id: uuid.UUID, owner_id: uuid.UUID
) -> Business:
    # Missing and not-owned businesses raise the same error on purpose.
    business = repository.get_business(db, business_id, owner_id)
    if business is None:
        raise BusinessNotFound()
    return business


def update_business(
    db: Session,
    business_id: uuid.UUID,
    payload: BusinessUpdate,
    owner_id: uuid.UUID,
) -> Business:
    business = get_business(db, business_id, owner_id)
    changes = payload.model_dump(exclude_unset=True)
    return repository.update_business(db, business, changes)


def delete_business(
    db: Session, business_id: uuid.UUID, owner_id: uuid.UUID
) -> None:
    business = get_business(db, business_id, owner_id)
    repository.soft_delete_business(db, business)

