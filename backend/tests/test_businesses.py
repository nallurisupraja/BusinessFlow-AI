import uuid

import pytest

from .helpers import register_and_login, unique_email


@pytest.fixture
def client(db_session):
    from fastapi.testclient import TestClient
    from app.main import app

    c = TestClient(app)
    register_and_login(c, unique_email("biz"))
    return c


BASE_PAYLOAD = {
    "name": "Spice Garden",
    "business_type": "restaurant",
    "owner_name": "Asha Rao",
    "email": "asha@example.com",
    "phone": "+91 98765 43210",
    "state": "Karnataka",
    "city": "Bengaluru",
}


def create(client, **overrides):
    return client.post("/api/v1/businesses", json={**BASE_PAYLOAD, **overrides})


def test_create_returns_201_with_defaults(client, db_session):
    response = create(client)
    assert response.status_code == 201
    body = response.json()
    assert body["country"] == "India"
    assert body["currency_code"] == "INR"
    assert body["phone"] == "+919876543210"


def test_invalid_email_returns_422(client, db_session):
    assert create(client, email="not-an-email").status_code == 422


def test_invalid_phone_returns_422(client, db_session):
    assert create(client, phone="12345").status_code == 422


def test_missing_name_returns_422(client, db_session):
    payload = {k: v for k, v in BASE_PAYLOAD.items() if k != "name"}
    response = client.post("/api/v1/businesses", json=payload)
    assert response.status_code == 422


def test_invalid_business_type_returns_422(client, db_session):
    assert create(client, business_type="bakery").status_code == 422


def test_invalid_pin_code_returns_422(client, db_session):
    assert create(client, pin_code="12345").status_code == 422


def test_invalid_gstin_returns_422(client, db_session):
    assert create(client, gstin="BAD").status_code == 422


def test_list_contains_created_business(client, db_session):
    business_id = create(client).json()["id"]
    response = client.get("/api/v1/businesses")
    assert response.status_code == 200
    assert business_id in [item["id"] for item in response.json()]


def test_get_returns_business(client, db_session):
    business_id = create(client).json()["id"]
    response = client.get(f"/api/v1/businesses/{business_id}")
    assert response.status_code == 200
    assert response.json()["id"] == business_id


def test_get_unknown_returns_404(client, db_session):
    response = client.get(f"/api/v1/businesses/{uuid.uuid4()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Business not found"


def test_patch_changes_only_city(client, db_session):
    created = create(client).json()
    response = client.patch(
        f"/api/v1/businesses/{created['id']}", json={"city": "Mysuru"}
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["city"] == "Mysuru"
    assert updated["name"] == created["name"]
    assert updated["email"] == created["email"]
    assert updated["phone"] == created["phone"]
    assert updated["state"] == created["state"]


def test_patch_null_name_returns_422(client, db_session):
    business_id = create(client).json()["id"]
    response = client.patch(f"/api/v1/businesses/{business_id}", json={"name": None})
    assert response.status_code == 422


def test_patch_unknown_returns_404(client, db_session):
    response = client.patch(
        f"/api/v1/businesses/{uuid.uuid4()}", json={"city": "Mysuru"}
    )
    assert response.status_code == 404


def test_delete_soft_deletes_business(client, db_session):
    business_id = create(client).json()["id"]
    response = client.delete(f"/api/v1/businesses/{business_id}")
    assert response.status_code == 204

    assert client.get(f"/api/v1/businesses/{business_id}").status_code == 404
    listed = [item["id"] for item in client.get("/api/v1/businesses").json()]
    assert business_id not in listed


def test_delete_unknown_returns_404(client, db_session):
    response = client.delete(f"/api/v1/businesses/{uuid.uuid4()}")
    assert response.status_code == 404

