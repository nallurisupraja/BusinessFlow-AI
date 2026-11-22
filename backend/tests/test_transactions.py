from fastapi.testclient import TestClient

from app.main import app

from .helpers import BUSINESS_PAYLOAD, register_and_login, unique_email

BASE = "/api/v1/transactions"


def _create_business(client):
    response = client.post("/api/v1/businesses", json=BUSINESS_PAYLOAD)
    assert response.status_code == 201
    return response.json()["id"]


def _tx(business_id, **overrides):
    payload = {
        "business_id": business_id,
        "transaction_type": "income",
        "amount": "1500.50",
        "category": "sales",
        "description": "Lunch service",
        "payment_method": "upi",
        "transaction_date": "2024-03-10",
        **overrides,
    }
    return payload


def _create(client, business_id, **overrides):
    response = client.post(BASE, json=_tx(business_id, **overrides))
    assert response.status_code == 201
    return response.json()


def test_create_income_returns_201(client, db_session):
    register_and_login(client, unique_email("txin"))
    business_id = _create_business(client)
    response = client.post(BASE, json=_tx(business_id))
    assert response.status_code == 201
    body = response.json()
    assert body["amount"] == "1500.50"
    assert body["transaction_type"] == "income"


def test_create_expense_returns_201(client, db_session):
    register_and_login(client, unique_email("txex"))
    business_id = _create_business(client)
    response = client.post(BASE, json=_tx(business_id, transaction_type="expense"))
    assert response.status_code == 201
    assert response.json()["transaction_type"] == "expense"


def test_create_non_positive_amount_rejected(client, db_session):
    register_and_login(client, unique_email("txamt"))
    business_id = _create_business(client)
    assert client.post(BASE, json=_tx(business_id, amount="0")).status_code == 422
    assert client.post(BASE, json=_tx(business_id, amount="-5")).status_code == 422


def test_create_invalid_fields_rejected(client, db_session):
    register_and_login(client, unique_email("txbad"))
    business_id = _create_business(client)
    assert client.post(BASE, json=_tx(business_id, transaction_type="bonus")).status_code == 422
    assert client.post(BASE, json=_tx(business_id, payment_method="bitcoin")).status_code == 422
    assert client.post(BASE, json=_tx(business_id, transaction_date="not-a-date")).status_code == 422


def test_list_and_filters(client, db_session):
    register_and_login(client, unique_email("txlist"))
    business_id = _create_business(client)
    income = _create(client, business_id, transaction_date="2024-03-10")
    expense = _create(
        client,
        business_id,
        transaction_type="expense",
        category="rent",
        transaction_date="2024-02-01",
    )

    listed = [item["id"] for item in client.get(BASE).json()]
    assert income["id"] in listed and expense["id"] in listed

    expenses = client.get(BASE, params={"transaction_type": "expense"}).json()
    assert expenses and all(item["transaction_type"] == "expense" for item in expenses)

    by_category = client.get(BASE, params={"category": "rent"}).json()
    assert by_category and all(item["category"] == "rent" for item in by_category)

    in_range = client.get(
        BASE, params={"start_date": "2024-03-01", "end_date": "2024-03-31"}
    ).json()
    ids = [item["id"] for item in in_range]
    assert income["id"] in ids
    assert expense["id"] not in ids


def test_get_and_patch_transaction(client, db_session):
    register_and_login(client, unique_email("txpatch"))
    business_id = _create_business(client)
    created = _create(client, business_id)
    url = f"{BASE}/{created['id']}"

    assert client.get(url).status_code == 200

    response = client.patch(url, json={"amount": "250.00"})
    assert response.status_code == 200
    assert response.json()["amount"] == "250.00"

    assert client.patch(url, json={"amount": None}).status_code == 422


def test_delete_transaction(client, db_session):
    register_and_login(client, unique_email("txdel"))
    business_id = _create_business(client)
    created = _create(client, business_id)
    url = f"{BASE}/{created['id']}"

    assert client.delete(url).status_code == 204
    response = client.get(url)
    assert response.status_code == 404
    assert response.json()["detail"] == "Transaction not found"

    listed = [item["id"] for item in client.get(BASE).json()]
    assert created["id"] not in listed


def test_create_for_unowned_business_rejected(client, db_session):
    register_and_login(client, unique_email("txowna"))
    other = TestClient(app)
    register_and_login(other, unique_email("txownb"))
    other_business_id = _create_business(other)

    response = client.post(BASE, json=_tx(other_business_id))
    assert response.status_code == 404
    assert response.json()["detail"] == "Business not found"


def test_other_user_cannot_access_transactions(client, db_session):
    register_and_login(client, unique_email("txisoa"))
    business_id = _create_business(client)
    created = _create(client, business_id)
    url = f"{BASE}/{created['id']}"

    other = TestClient(app)
    register_and_login(other, unique_email("txisob"))
    assert other.get(url).status_code == 404
    assert other.patch(url, json={"amount": "10.00"}).status_code == 404
    assert other.delete(url).status_code == 404

    listed = [item["id"] for item in other.get(BASE, params={"business_id": business_id}).json()]
    assert created["id"] not in listed


def test_unauthenticated_list_rejected(client, db_session):
    fresh = TestClient(app)
    assert fresh.get(BASE).status_code == 401
