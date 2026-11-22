import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.finance.models import Transaction
from app.finance.schemas import TransactionCreate, TransactionUpdate
from app.tenancy.models import Business
from app.tenancy.repository import get_business


class TransactionNotFound(Exception):
    pass


class BusinessNotFound(Exception):
    pass


def create_transaction(db: Session, payload: TransactionCreate, owner_id: uuid.UUID) -> Transaction:
    if get_business(db, payload.business_id, owner_id) is None:
        raise BusinessNotFound
    transaction = Transaction(**payload.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def _owned_transactions(owner_id: uuid.UUID):
    return (
        select(Transaction)
        .join(Business, Transaction.business_id == Business.id)
        .where(
            Business.owner_user_id == owner_id,
            Business.deleted_at.is_(None),
            Transaction.deleted_at.is_(None),
        )
    )


def list_transactions(
    db: Session,
    owner_id: uuid.UUID,
    business_id: uuid.UUID | None = None,
    transaction_type: str | None = None,
    category: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[Transaction]:
    stmt = _owned_transactions(owner_id)
    if business_id is not None:
        stmt = stmt.where(Transaction.business_id == business_id)
    if transaction_type is not None:
        stmt = stmt.where(Transaction.transaction_type == transaction_type)
    if category is not None:
        stmt = stmt.where(Transaction.category == category)
    if start_date is not None:
        stmt = stmt.where(Transaction.transaction_date >= start_date)
    if end_date is not None:
        stmt = stmt.where(Transaction.transaction_date <= end_date)
    stmt = stmt.order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
    return list(db.scalars(stmt).all())


def get_transaction(db: Session, transaction_id: uuid.UUID, owner_id: uuid.UUID) -> Transaction:
    stmt = _owned_transactions(owner_id).where(Transaction.id == transaction_id)
    transaction = db.scalars(stmt).first()
    if transaction is None:
        raise TransactionNotFound
    return transaction


def update_transaction(
    db: Session, transaction_id: uuid.UUID, payload: TransactionUpdate, owner_id: uuid.UUID
) -> Transaction:
    transaction = get_transaction(db, transaction_id, owner_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(transaction, field, value)
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction_id: uuid.UUID, owner_id: uuid.UUID) -> None:
    transaction = get_transaction(db, transaction_id, owner_id)
    transaction.deleted_at = datetime.now(timezone.utc)
    db.commit()
