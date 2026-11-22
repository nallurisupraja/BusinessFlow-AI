import uuid


PASSWORD = "Strong123pass"

BUSINESS_PAYLOAD = {
    "name": "Spice Garden",
    "business_type": "restaurant",
    "owner_name": "Asha Rao",
    "email": "asha@example.com",
    "phone": "+91 98765 43210",
    "state": "Karnataka",
    "city": "Bengaluru",
}


def unique_email(prefix="user") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}@example.com"


def register_and_login(client, email: str, full_name: str = "Test User") -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": full_name, "email": email, "password": PASSWORD},
    )
    assert response.status_code == 201
    # The TestClient keeps the HttpOnly session cookie automatically.
    response = client.post(
        "/api/v1/auth/login", json={"email": email, "password": PASSWORD}
    )
    assert response.status_code == 200
