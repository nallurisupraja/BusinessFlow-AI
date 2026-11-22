
from datetime import datetime
from decimal import Decimal

from fastapi.testclient import TestClient

from app.main import app
from app.finance.models import Transaction

from .helpers import BUSINESS_PAYLOAD, register_and_login, unique_email


BASE = "/api/v1/analytics"
TRANSACTIONS = "/api/v1/transactions"


def _create_business(client, **overrides):
    payload = {**BUSINESS_PAYLOAD, **overrides}
    response = client.post("/api/v1/businesses", json=payload)
    assert response.status_code == 201
    return response.json()["id"]


def _tx(business_id, **overrides):
    return {
        "business_id": business_id,
        "transaction_type": "income",
        "amount": "1500.50",
        "category": "sales",
        "description": "Test transaction",
        "payment_method": "upi",
        "transaction_date": "2024-03-10",
        **overrides,
    }


def _create_transaction(client, business_id, **overrides):
    response = client.post(
        TRANSACTIONS,
        json=_tx(business_id, **overrides),
    )
    assert response.status_code == 201
    return response.json()


def _setup(client, prefix="analytics"):
    register_and_login(client, unique_email(prefix))
    return _create_business(client)


def test_analytics_returns_correct_totals_and_categories(client, db_session):
    business_id = _setup(client, "analytics_totals")

    _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="5000.00",
        transaction_date="2024-03-10",
    )
    _create_transaction(
        client,
        business_id,
        transaction_type="expense",
        amount="1000.00",
        category="rent",
        transaction_date="2024-03-11",
    )
    _create_transaction(
        client,
        business_id,
        transaction_type="expense",
        amount="500.00",
        category="food",
        transaction_date="2024-03-12",
    )

    response = client.get(BASE)
    assert response.status_code == 200

    body = response.json()

    assert Decimal(body["total_income"]) == Decimal("5000.00")
    assert Decimal(body["total_expenses"]) == Decimal("1500.00")
    assert Decimal(body["net_balance"]) == Decimal("3500.00")
    assert body["transaction_count"] == 3

    categories = {
        item["category"]: item
        for item in body["expense_categories"]
    }

    assert Decimal(categories["rent"]["amount"]) == Decimal("1000.00")
    assert Decimal(categories["food"]["amount"]) == Decimal("500.00")
    assert Decimal(categories["rent"]["percentage"]) == Decimal("66.67")
    assert Decimal(categories["food"]["percentage"]) == Decimal("33.33")


def test_analytics_monthly_trend(client, db_session):
    business_id = _setup(client, "analytics_monthly")

    _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="3000.00",
        transaction_date="2024-03-10",
    )
    _create_transaction(
        client,
        business_id,
        transaction_type="expense",
        amount="1000.00",
        category="rent",
        transaction_date="2024-03-15",
    )
    _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="2000.00",
        transaction_date="2024-04-05",
    )

    response = client.get(BASE)
    assert response.status_code == 200

    trend = response.json()["monthly_trend"]

    assert len(trend) == 2
    assert trend[0]["month"] == "2024-03"
    assert Decimal(trend[0]["income"]) == Decimal("3000.00")
    assert Decimal(trend[0]["expenses"]) == Decimal("1000.00")

    assert trend[1]["month"] == "2024-04"
    assert Decimal(trend[1]["income"]) == Decimal("2000.00")


def test_analytics_filters_by_business(client, db_session):
    register_and_login(client, unique_email("analytics_business"))

    business_a = _create_business(client)
    business_b = _create_business(
        client,
        name="Second Business",
        email=unique_email("second_business"),
    )

    _create_transaction(
        client,
        business_a,
        transaction_type="income",
        amount="1000.00",
    )
    _create_transaction(
        client,
        business_b,
        transaction_type="income",
        amount="2000.00",
    )

    response = client.get(BASE, params={"business_id": business_a})
    assert response.status_code == 200

    body = response.json()

    assert Decimal(body["total_income"]) == Decimal("1000.00")
    assert body["transaction_count"] == 1


def test_analytics_filters_by_date_range(client, db_session):
    business_id = _setup(client, "analytics_dates")

    _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="1000.00",
        transaction_date="2024-03-05",
    )
    _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="2000.00",
        transaction_date="2024-03-15",
    )
    _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="3000.00",
        transaction_date="2024-04-05",
    )

    response = client.get(
        BASE,
        params={
            "start_date": "2024-03-10",
            "end_date": "2024-03-31",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert Decimal(body["total_income"]) == Decimal("2000.00")
    assert body["transaction_count"] == 1


def test_analytics_rejects_unowned_business(client, db_session):
    register_and_login(client, unique_email("analytics_owner_a"))

    other = TestClient(app)
    register_and_login(other, unique_email("analytics_owner_b"))

    other_business_id = _create_business(other)

    response = client.get(
        BASE,
        params={"business_id": other_business_id},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Business not found"


def test_analytics_excludes_deleted_transactions(client, db_session):
    business_id = _setup(client, "analytics_deleted")

    created = _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="5000.00",
    )

    _create_transaction(
        client,
        business_id,
        transaction_type="income",
        amount="1000.00",
    )

    transaction = db_session.get(Transaction, created["id"])
    assert transaction is not None

    transaction.deleted_at = datetime.utcnow()
    db_session.flush()

    response = client.get(BASE)
    assert response.status_code == 200

    body = response.json()

    assert Decimal(body["total_income"]) == Decimal("1000.00")
    assert body["transaction_count"] == 1


def test_analytics_empty_result(client, db_session):
    _setup(client, "analytics_empty")

    response = client.get(BASE)
    assert response.status_code == 200

    body = response.json()

    assert Decimal(body["total_income"]) == Decimal("0")
    assert Decimal(body["total_expenses"]) == Decimal("0")
    assert Decimal(body["net_balance"]) == Decimal("0")
    assert body["transaction_count"] == 0
    assert body["monthly_trend"] == []
    assert body["expense_categories"] == []


def test_analytics_rejects_invalid_date_range(client, db_session):
    _setup(client, "analytics_invalid_dates")

    response = client.get(
        BASE,
        params={
            "start_date": "2024-04-01",
            "end_date": "2024-03-01",
        },
    )

    assert response.status_code == 422


def test_analytics_requires_authentication(client, db_session):
    fresh = TestClient(app)

    response = fresh.get(BASE)

    assert response.status_code == 401
