from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai_assistant.gemini import (
    GeminiAPIError,
    GeminiConfigurationError,
    GeminiRateLimitError,
    generate_business_answer,
)
from app.ai_assistant.schemas import ChatRequest, ChatResponse
from app.ai_assistant.service import (
    BusinessNotFound,
    build_business_context,
)
from app.core.database import get_db
from app.identity.dependencies import get_current_user, require_safe_origin
from app.identity.models import User


router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    dependencies=[Depends(require_safe_origin)],
)
def chat_with_assistant(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        context = build_business_context(
            db=db,
            owner_id=current_user.id,
            business_id=payload.business_id,
        )

    except BusinessNotFound:
        raise HTTPException(
            status_code=404,
            detail="Business not found",
        )

    try:
        answer = generate_business_answer(
            context=context,
            question=payload.message.strip(),
        )

    except GeminiConfigurationError:
        raise HTTPException(
            status_code=503,
            detail="AI Assistant is not configured.",
        )

    except GeminiRateLimitError:
        raise HTTPException(
            status_code=429,
            detail="AI request limit reached. Please try again later.",
        )

    except GeminiAPIError:
        raise HTTPException(
            status_code=502,
            detail="AI Assistant is temporarily unavailable.",
        )

    return ChatResponse(
        business_id=payload.business_id,
        answer=answer,
    )