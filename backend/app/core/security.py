import datetime
from datetime import timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from app.core.config import settings

_hasher = PasswordHasher()
DUMMY_HASH = _hasher.hash("dummy-password-for-timing")


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def verify_dummy() -> None:
    # Runs a real hash check so unknown emails take about as long as known ones.
    verify_password("x", DUMMY_HASH)


def create_access_token(user_id: str) -> str:
    if not settings.jwt_secret_key:
        raise RuntimeError("JWT_SECRET_KEY is not configured")
    now = datetime.datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + datetime.timedelta(minutes=settings.jwt_expire_minutes),
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=["HS256"],
        options={"require": ["exp", "sub", "iat"]},
    )
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Wrong token type")
    return payload
