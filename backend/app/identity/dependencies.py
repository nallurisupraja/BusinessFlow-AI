import uuid

import jwt
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import ALLOWED_ORIGINS
from app.core.database import get_db
from app.core.security import decode_access_token
from app.identity.models import User
from app.identity.service import get_user_by_id

COOKIE_NAME = "bf_session"
SAFE_METHODS = ("GET", "HEAD", "OPTIONS")


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(401, "Not authenticated")

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Session expired. Please log in again.")
    except Exception:
        raise HTTPException(401, "Invalid session")

    try:
        user_id = uuid.UUID(payload["sub"])
    except ValueError:
        raise HTTPException(401, "Invalid session")

    user = get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise HTTPException(401, "Invalid session")
    return user


def check_origin(request: Request) -> None:
    # Simple CSRF defence: if the browser sent an Origin header, it must be allowed.
    origin = request.headers.get("origin")
    if origin is not None and origin not in ALLOWED_ORIGINS:
        raise HTTPException(403, "Origin not allowed")


def require_safe_origin(request: Request) -> None:
    if request.method in SAFE_METHODS:
        return
    check_origin(request)
