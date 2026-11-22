
import uuid
from decimal import Decimal

from sqlalchemy.orm import Session

from app.analytics.service import (
    BusinessNotFound,
    get_analytics_summary,
)
from app.tenancy.repository import get_business


def _format_amount(amount: Decimal, currency_code: str) -> str:
    return f"{currency_code} {amount:,.2f}"


def build_business_context(
    db: Session,
    owner_id: uuid.UUID,
    business_id: uuid.UUID,
) -> str:
    # Verify that this business belongs to the logged-in user.
    business = get_business(db, business_id, owner_id)

    if business is None:
        raise BusinessNotFound

    # Get actual financial analytics from the existing service.
    analytics = get_analytics_summary(
        db=db,
        owner_id=owner_id,
        business_id=business_id,
    )

    currency = business.currency_code or "INR"

    monthly_details = []
    for item in analytics["monthly_trend"]:
        monthly_details.append(
            f"- {item['month']}: "
            f"Income: {_format_amount(item['income'], currency)}, "
            f"Expenses: {_format_amount(item['expenses'], currency)}"
        )

    category_details = []
    for item in analytics["expense_categories"]:
        category_details.append(
            f"- {item['category']}: "
            f"{_format_amount(item['amount'], currency)} "
            f"({item['percentage']}%)"
        )

    monthly_text = (
        "\n".join(monthly_details)
        if monthly_details
        else "No monthly transaction data available."
    )

    category_text = (
        "\n".join(category_details)
        if category_details
        else "No expense category data available."
    )

    return f"""
BUSINESS INFORMATION

Business Name: {business.name}
Business Type: {business.business_type}
Location: {business.city}, {business.state}
Currency: {currency}

FINANCIAL SUMMARY

Total Income: {_format_amount(analytics['total_income'], currency)}
Total Expenses: {_format_amount(analytics['total_expenses'], currency)}
Net Balance: {_format_amount(analytics['net_balance'], currency)}
Transaction Count: {analytics['transaction_count']}

MONTHLY FINANCIAL TREND

{monthly_text}

EXPENSE CATEGORY BREAKDOWN

{category_text}

IMPORTANT:
- These figures are calculated from recorded transactions.
- The data represents all available recorded transactions
  for this business.
- Do not assume that missing data is zero.
- Explain the figures accurately.
"""
