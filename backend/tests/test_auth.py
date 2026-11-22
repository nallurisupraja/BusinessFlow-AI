import time
import uuid

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.identity.models import User
from app.main import app
from app.tenancy.models import Business

from .helpers import BUSINESS_PAYLOAD, PASSWORD, register_and_login, unique_email

TEST_JWT_SECRET = "test-secret-key-for-pytest-only-0123456789abcdef"


def _create_business(client):
    response = client.post("/api/v1/businesses", json=BUSINESS_PAYLOAD)
    assert response.status_code == 201
    return response.json()["id"]


# --- Registration -----------------------------------------------------------


def test_register_creates_user(client, db_session):
    email = unique_email("reg")
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Reg User", "email": email, "password": PASSWORD},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == email.lower()
    assert body["full_name"] == "Reg User"
    assert "password" not in body
    assert "password_hash" not in body


def test_register_duplicate_email_rejected(client, db_session):
    email = unique_email("dup")
    payload = {"full_name": "Dup User", "password": PASSWORD}
    first = client.post("/api/v1/auth/register", json={**payload, "email": email})
    assert first.status_code == 201
    second = client.post(
        "/api/v1/auth/register", json={**payload, "email": email.upper()}
    )
    assert second.status_code == 409
    assert second.json()["detail"] == "Email already registered."


def test_register_invalid_email_rejected(client, db_session):
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Bad Email", "email": "not-an-email", "password": PASSWORD},
    )
    assert response.status_code == 422


def test_register_weak_password_rejected(client, db_session):
    email = unique_email("weak")
    for password in ("short", "onlyletters"):
        response = client.post(
            "/api/v1/auth/register",
            json={"full_name": "Weak Pw", "email": email, "password": password},
        )
        assert response.status_code == 422


# --- Login ------------------------------------------------------------------


def test_login_success_sets_http_only_cookie(client, db_session):
    email = unique_email("login")
    register_and_login(client, email)
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": PASSWORD}
    )
    assert response.status_code == 200
    set_cookie = response.headers["set-cookie"].lower()
    assert "bf_session=" in set_cookie
    assert "httponly" in set_cookie
    assert "samesite=lax" in set_cookie
    body = response.json()
    assert "token" not in body
    assert "password" not in body


def test_login_wrong_password_rejected(client, db_session):
    email = unique_email("wrongpw")
    register_and_login(client, email)
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": "Wrong123pass"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


def test_login_unknown_email_rejected(client, db_session):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email("ghost"), "password": PASSWORD},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


# --- Session / JWT ----------------------------------------------------------


def test_invalid_jwt_rejected(client, db_session):
    client.cookies.set("bf_session", "not-a-jwt")
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid session"
    client.cookies.clear()


def test_expired_jwt_rejected(client, db_session):
    now = int(time.time())
    token = jwt.encode(
        {"sub": str(uuid.uuid4()), "iat": now - 7200, "exp": now - 3600, "type": "access"},
        TEST_JWT_SECRET,
        algorithm="HS256",
    )
    client.cookies.set("bf_session", token)
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Session expired. Please log in again."
    client.cookies.clear()


def test_unauthenticated_business_access_rejected(client, db_session):
    fresh = TestClient(app)
    response = fresh.get("/api/v1/businesses")
    assert response.status_code == 401


def test_me_returns_current_user(client, db_session):
    email = unique_email("me")
    register_and_login(client, email)
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == email.lower()
    assert "password_hash" not in body


def test_logout_clears_session(client, db_session):
    email = unique_email("logout")
    register_and_login(client, email)
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 204
    set_cookie = response.headers["set-cookie"].lower()
    assert "bf_session=" in set_cookie
    assert "max-age=0" in set_cookie or "expires=thu, 01 jan 1970" in set_cookie
    client.cookies.clear()
    assert client.get("/api/v1/auth/me").status_code == 401


# --- Business ownership -----------------------------------------------------


def test_business_created_for_authenticated_user(client, db_session):
    email = unique_email("owner")
    register_and_login(client, email)
    business_id = _create_business(client)
    user = db_session.execute(select(User).where(User.email == email)).scalar_one()
    business = db_session.get(Business, uuid.UUID(business_id))
    assert business.owner_user_id == user.id


def test_business_list_scoped_to_current_user(client, db_session):
    register_and_login(client, unique_email("scopeA"))
    business_id = _create_business(client)

    other = TestClient(app)
    register_and_login(other, unique_email("scopeB"))
    listed = [item["id"] for item in other.get("/api/v1/businesses").json()]
    assert business_id not in listed


def test_user_cannot_read_other_users_business(client, db_session):
    register_and_login(client, unique_email("readA"))
    business_id = _create_business(client)

    other = TestClient(app)
    register_and_login(other, unique_email("readB"))
    response = other.get(f"/api/v1/businesses/{business_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Business not found"


def test_user_cannot_edit_other_users_business(client, db_session):
    register_and_login(client, unique_email("editA"))
    business_id = _create_business(client)

    other = TestClient(app)
    register_and_login(other, unique_email("editB"))
    response = other.patch(
        f"/api/v1/businesses/{business_id}", json={"city": "Mysuru"}
    )
    assert response.status_code == 404

    assert client.get(f"/api/v1/businesses/{business_id}").json()["city"] == "Bengaluru"


def test_user_cannot_delete_other_users_business(client, db_session):
    register_and_login(client, unique_email("delA"))
    business_id = _create_business(client)

    other = TestClient(app)
    register_and_login(other, unique_email("delB"))
    assert other.delete(f"/api/v1/businesses/{business_id}").status_code == 404

    assert client.get(f"/api/v1/businesses/{business_id}").status_code == 200


def test_user_cannot_access_legacy_unassigned_business(client, db_session):
    legacy = db_session.execute(
        select(Business).where(Business.owner_user_id.is_(None)).limit(1)
    ).scalars().first()
    if legacy is None:
        pytest.skip("No legacy unassigned business exists in the database")

    register_and_login(client, unique_email("legacy"))
    response = client.get(f"/api/v1/businesses/{legacy.id}")
    assert response.status_code == 404


def test_existing_business_crud_still_works(client, db_session):
    register_and_login(client, unique_email("crud"))
    business_id = _create_business(client)
    response = client.get(f"/api/v1/businesses/{business_id}")
    assert response.status_code == 200
    assert response.json()["name"] == BUSINESS_PAYLOAD["name"]
