import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.tenancy.models import Business


def create_business(db: Session, data: dict, owner_id: uuid.UUID) -> Business:
    business = Business(**data, owner_user_id=owner_id)
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


def list_businesses(db: Session, owner_id: uuid.UUID) -> list[Business]:
    stmt = (
        select(Business)
        .where(
            Business.owner_user_id == owner_id,
            Business.deleted_at.is_(None),
        )
        .order_by(Business.created_at)
    )
    return list(db.scalars(stmt).all())


def get_business(
    db: Session, business_id: uuid.UUID, owner_id: uuid.UUID
) -> Business | None:
    stmt = select(Business).where(
        Business.id == business_id,
        Business.owner_user_id == owner_id,
        Business.deleted_at.is_(None),
    )
    return db.scalars(stmt).first()


def update_business(db: Session, business: Business, changes: dict) -> Business:
    for field, value in changes.items():
        setattr(business, field, value)
    db.commit()
    db.refresh(business)
    return business


def soft_delete_business(db: Session, business: Business) -> None:
    business.deleted_at = datetime.now(timezone.utc)
    db.commit()

