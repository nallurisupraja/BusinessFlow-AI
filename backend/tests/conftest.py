import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, get_db
from app.main import app

TEST_JWT_SECRET = "test-secret-key-for-pytest-only-0123456789abcdef"


@pytest.fixture(autouse=True)
def jwt_test_secret(monkeypatch):
    monkeypatch.setattr(settings, "jwt_secret_key", TEST_JWT_SECRET)


@pytest.fixture(scope="function")
def client():
    yield TestClient(app)


@pytest.fixture(scope="function")
def db_session():
    try:
        conn = engine.connect()
    except OperationalError:
        pytest.skip("Database not reachable: make sure local PostgreSQL is running on localhost:5432")
    transaction = conn.begin()
    session = Session(bind=conn, join_transaction_mode="create_savepoint")

    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    yield session
    session.close()
    transaction.rollback()
    conn.close()
    app.dependency_overrides.pop(get_db, None)
