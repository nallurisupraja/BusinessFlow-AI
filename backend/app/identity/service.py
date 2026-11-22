import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_dummy, verify_password
from app.identity.models import User
from app.identity.schemas import UserRegister


class EmailAlreadyRegistered(Exception):
    pass


class InvalidCredentials(Exception):
    pass


class InactiveUser(Exception):
    pass


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def register_user(db: Session, data: UserRegister) -> User:
    if _get_user_by_email(db, data.email) is not None:
        raise EmailAlreadyRegistered()

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        # Another request registered the same email at the same time.
        db.rollback()
        raise EmailAlreadyRegistered()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = _get_user_by_email(db, email.strip().lower())
    if user is None:
        verify_dummy()
        raise InvalidCredentials()
    if not verify_password(password, user.password_hash):
        raise InvalidCredentials()
    if not user.is_active:
        raise InactiveUser()
    return user


def get_user_by_id(db: Session, user_id: uuid.UUID) -> User | None:
    return db.scalar(select(User).where(User.id == user_id))
