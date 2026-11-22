
import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.finance.models import Transaction
from app.tenancy.models import Business
from app.tenancy.repository import get_business


class BusinessNotFound(Exception):
    pass


def get_analytics_summary(
    db: Session,
    owner_id: uuid.UUID,
    business_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> dict:
    if business_id is not None:
        if get_business(db, business_id, owner_id) is None:
            raise BusinessNotFound

    conditions = [
        Business.owner_user_id == owner_id,
        Business.deleted_at.is_(None),
        Transaction.deleted_at.is_(None),
    ]

    if business_id is not None:
        conditions.append(Transaction.business_id == business_id)

    if start_date is not None:
        conditions.append(Transaction.transaction_date >= start_date)

    if end_date is not None:
        conditions.append(Transaction.transaction_date <= end_date)

    base_query = (
        select(Transaction)
        .join(Business, Transaction.business_id == Business.id)
        .where(*conditions)
    )

    totals_query = select(
        func.coalesce(
            func.sum(
                case(
                    (Transaction.transaction_type == "income", Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("total_income"),
        func.coalesce(
            func.sum(
                case(
                    (Transaction.transaction_type == "expense", Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("total_expenses"),
        func.count(Transaction.id).label("transaction_count"),
    ).select_from(Transaction).join(
        Business, Transaction.business_id == Business.id
    ).where(*conditions)

    totals = db.execute(totals_query).one()

    income = Decimal(str(totals.total_income))
    expenses = Decimal(str(totals.total_expenses))

    monthly_query = (
        select(
            func.to_char(
                func.date_trunc("month", Transaction.transaction_date),
                "YYYY-MM",
            ).label("month"),
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.transaction_type == "income", Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("income"),
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.transaction_type == "expense", Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("expenses"),
        )
        .select_from(Transaction)
        .join(Business, Transaction.business_id == Business.id)
        .where(*conditions)
        .group_by("month")
        .order_by("month")
    )

    monthly_rows = db.execute(monthly_query).all()

    category_query = (
        select(
            Transaction.category,
            func.sum(Transaction.amount).label("amount"),
        )
        .select_from(Transaction)
        .join(Business, Transaction.business_id == Business.id)
        .where(
            *conditions,
            Transaction.transaction_type == "expense",
        )
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
    )

    category_rows = db.execute(category_query).all()

    category_total = sum(
        (Decimal(str(row.amount)) for row in category_rows),
        Decimal("0"),
    )

    categories = [
        {
            "category": row.category,
            "amount": Decimal(str(row.amount)),
            "percentage": (
                Decimal(str(row.amount)) * Decimal("100") / category_total
                if category_total > 0
                else Decimal("0")
            ).quantize(Decimal("0.01")),
        }
        for row in category_rows
    ]

    return {
        "total_income": income,
        "total_expenses": expenses,
        "net_balance": income - expenses,
        "transaction_count": totals.transaction_count,
        "monthly_trend": [
            {
                "month": row.month,
                "income": Decimal(str(row.income)),
                "expenses": Decimal(str(row.expenses)),
            }
            for row in monthly_rows
        ],
        "expense_categories": categories,
    }
