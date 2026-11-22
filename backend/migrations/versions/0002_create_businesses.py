"""create businesses table"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0002_create_businesses"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "businesses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("business_type", sa.String(30), nullable=False),
        sa.Column("owner_name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("country", sa.String(60), nullable=False, server_default=sa.text("'India'")),
        sa.Column("state", sa.String(60), nullable=False),
        sa.Column("city", sa.String(60), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("pin_code", sa.String(6), nullable=True),
        sa.Column("gstin", sa.String(15), nullable=True),
        sa.Column("website", sa.String(255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("currency_code", sa.String(3), nullable=False, server_default=sa.text("'INR'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("businesses")

