
from decimal import Decimal

from pydantic import BaseModel


class MonthlyTrend(BaseModel):
    month: str
    income: Decimal
    expenses: Decimal


class ExpenseCategory(BaseModel):
    category: str
    amount: Decimal
    percentage: Decimal


class AnalyticsSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    transaction_count: int
    monthly_trend: list[MonthlyTrend]
    expense_categories: list[ExpenseCategory]
