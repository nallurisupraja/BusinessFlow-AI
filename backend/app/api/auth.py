from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.identity.dependencies import COOKIE_NAME, get_current_user, require_safe_origin
from app.identity.models import User
from app.identity.schemas import UserLogin, UserRead, UserRegister
from app.identity.service import (
    EmailAlreadyRegistered,
    InactiveUser,
    InvalidCredentials,
    authenticate_user,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    status_code=201,
    response_model=UserRead,
    dependencies=[Depends(require_safe_origin)],
)
def register(data: UserRegister, db: Session = Depends(get_db)) -> User:
    try:
        return register_user(db, data)
    except EmailAlreadyRegistered:
        raise HTTPException(409, "Email already registered.")


@router.post(
    "/login",
    response_model=UserRead,
    dependencies=[Depends(require_safe_origin)],
)
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)) -> User:
    try:
        user = authenticate_user(db, data.email, data.password)
    except InvalidCredentials:
        raise HTTPException(401, "Invalid email or password.")
    except InactiveUser:
        raise HTTPException(403, "This account is inactive.")

    token = create_access_token(str(user.id))
    # The token goes only in the HttpOnly cookie, never in the JSON body.
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )
    return user


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post(
    "/logout",
    status_code=204,
    dependencies=[Depends(require_safe_origin)],
)
def logout(response: Response) -> None:
    response.delete_cookie(
        COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
    )
    return None
