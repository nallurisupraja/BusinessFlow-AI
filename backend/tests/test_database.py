import pytest
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app.core.database import engine


def test_database_select_one():
    try:
        with engine.connect() as conn:
            value = conn.execute(text("SELECT 1")).scalar()
    except OperationalError:
        pytest.skip("Database not reachable: make sure local PostgreSQL is running on localhost:5432 (Docker is optional)")
    assert value == 1
