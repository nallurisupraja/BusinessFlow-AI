
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    business_id: UUID
    message: str = Field(
        min_length=1,
        max_length=2000,
        description="User's question about their business",
    )


class ChatResponse(BaseModel):
    business_id: UUID
    answer: str
