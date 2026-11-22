import re
import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

BusinessType = Literal[
    "restaurant", "salon_beauty", "retail_shop", "shopping_mall", "freelancer", "other"
]

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^(\+91)?[6-9]\d{9}$")
PIN_RE = re.compile(r"^\d{6}$")
GSTIN_RE = re.compile(r"^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$")

# Fields that must never be cleared (sent as null) on update.
REQUIRED_FIELDS = (
    "name", "business_type", "owner_name", "email", "phone", "state", "city", "country",
)
TEXT_FIELDS = (
    "name", "owner_name", "country", "state", "city", "address", "description",
)


# ----- shared validation helpers (used by both Create and Update) -----

def blank_to_none(value):
    """Turn '' or whitespace-only strings into None."""
    if isinstance(value, str) and value.strip() == "":
        return None
    return value


def strip_text(value):
    return value.strip() if isinstance(value, str) else value


def check_email(value):
    if value is None:
        return None
    value = value.strip().lower()
    if not EMAIL_RE.match(value):
        raise ValueError("Invalid email address")
    return value


def check_phone(value):
    if value is None:
        return None
    cleaned = value.replace(" ", "").replace("-", "")
    if not PHONE_RE.match(cleaned):
        raise ValueError("Invalid Indian phone number")
    return cleaned


def check_pin(value):
    if value is None:
        return None
    value = value.strip()
    if not PIN_RE.match(value):
        raise ValueError("PIN code must be 6 digits")
    return value


def check_gstin(value):
    if value is None:
        return None
    value = value.strip().upper()
    if not GSTIN_RE.match(value):
        raise ValueError("Invalid GSTIN")
    return value


def check_website(value):
    if value is None:
        return None
    value = value.strip()
    if not (value.startswith("http://") or value.startswith("https://")):
        raise ValueError("Website must start with http:// or https://")
    return value


def check_required_not_null(value):
    if value is None:
        raise ValueError("This field cannot be null")
    return value


# ----- schemas -----

class BusinessCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    business_type: BusinessType
    owner_name: str = Field(min_length=1, max_length=120)
    email: str = Field(max_length=254)
    phone: str
    country: str = Field(default="India", min_length=1, max_length=60)
    state: str = Field(min_length=1, max_length=60)
    city: str = Field(min_length=1, max_length=60)
    address: str | None = Field(default=None, max_length=500)
    pin_code: str | None = None
    gstin: str | None = None
    website: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    currency_code: Literal["INR"] = "INR"

    @field_validator("*", mode="before")
    @classmethod
    def _blank(cls, value):
        return blank_to_none(value)

    @field_validator(*TEXT_FIELDS, mode="after")
    @classmethod
    def _strip(cls, value):
        return strip_text(value)

    @field_validator("email", mode="after")
    @classmethod
    def _email(cls, value):
        return check_email(value)

    @field_validator("phone", mode="after")
    @classmethod
    def _phone(cls, value):
        return check_phone(value)

    @field_validator("pin_code", mode="after")
    @classmethod
    def _pin(cls, value):
        return check_pin(value)

    @field_validator("gstin", mode="after")
    @classmethod
    def _gstin(cls, value):
        return check_gstin(value)

    @field_validator("website", mode="after")
    @classmethod
    def _website(cls, value):
        return check_website(value)


class BusinessUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    business_type: BusinessType | None = None
    owner_name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = Field(default=None, max_length=254)
    phone: str | None = None
    country: str | None = Field(default=None, min_length=1, max_length=60)
    state: str | None = Field(default=None, min_length=1, max_length=60)
    city: str | None = Field(default=None, min_length=1, max_length=60)
    address: str | None = Field(default=None, max_length=500)
    pin_code: str | None = None
    gstin: str | None = None
    website: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    currency_code: Literal["INR"] | None = None

    @field_validator("*", mode="before")
    @classmethod
    def _blank(cls, value):
        return blank_to_none(value)

    @field_validator(*TEXT_FIELDS, mode="after")
    @classmethod
    def _strip(cls, value):
        return strip_text(value)

    @field_validator(*REQUIRED_FIELDS, mode="after")
    @classmethod
    def _required(cls, value):
        return check_required_not_null(value)

    @field_validator("email", mode="after")
    @classmethod
    def _email(cls, value):
        return check_email(value)

    @field_validator("phone", mode="after")
    @classmethod
    def _phone(cls, value):
        return check_phone(value)

    @field_validator("pin_code", mode="after")
    @classmethod
    def _pin(cls, value):
        return check_pin(value)

    @field_validator("gstin", mode="after")
    @classmethod
    def _gstin(cls, value):
        return check_gstin(value)

    @field_validator("website", mode="after")
    @classmethod
    def _website(cls, value):
        return check_website(value)


class BusinessRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    business_type: str
    owner_name: str
    email: str
    phone: str
    country: str
    state: str
    city: str
    address: str | None
    pin_code: str | None
    gstin: str | None
    website: str | None
    description: str | None
    currency_code: str
    created_at: datetime
    updated_at: datetime

