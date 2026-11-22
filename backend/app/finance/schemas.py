import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

TransactionType = Literal["income", "expense"]
PaymentMethod = Literal["cash", "upi", "card", "bank_transfer", "cheque", "other"]


class TransactionCreate(BaseModel):
    business_id: uuid.UUID
    transaction_type: TransactionType
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    category: str = Field(min_length=1, max_length=60)
    description: str | None = Field(default=None, max_length=255)
    payment_method: PaymentMethod
    transaction_date: date

    @field_validator("category")
    @classmethod
    def strip_category(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Category is required")
        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class TransactionUpdate(BaseModel):
    transaction_type: TransactionType | None = None
    amount: Decimal | None = Field(default=None, gt=0, max_digits=14, decimal_places=2)
    category: str | None = Field(default=None, min_length=1, max_length=60)
    description: str | None = Field(default=None, max_length=255)
    payment_method: PaymentMethod | None = None
    transaction_date: date | None = None

    @field_validator("transaction_type", "amount", "category", "payment_method", "transaction_date")
    @classmethod
    def reject_null(cls, value):
        if value is None:
            raise ValueError("Field cannot be null")
        return value

    @field_validator("category")
    @classmethod
    def strip_category(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Category is required")
        return value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_id: uuid.UUID
    transaction_type: str
    amount: Decimal
    category: str
    description: str | None
    payment_method: str
    transaction_date: date
    created_at: datetime
    updated_at: datetime
