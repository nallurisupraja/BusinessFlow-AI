import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _normalize_email(value: str) -> str:
    return value.strip().lower()


class UserRegister(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Full name must not be blank")
        return value

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        value = _normalize_email(value)
        if not EMAIL_RE.match(value):
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("password")
    @classmethod
    def check_password(cls, value: str) -> str:
        has_letter = any(c.isalpha() for c in value)
        has_digit = any(c.isdigit() for c in value)
        if not (has_letter and has_digit):
            raise ValueError("Password must contain at least one letter and one number")
        return value


class UserLogin(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return _normalize_email(value)


class UserRead(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
