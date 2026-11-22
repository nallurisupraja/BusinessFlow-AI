"""Add transactions table for financial management.

Revision ID: 0004_transactions
Revises: 0003_users_and_business_owner
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0004_transactions"
down_revision = "0003_users_and_business_owner"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "business_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("businesses.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("transaction_type", sa.String(10), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("category", sa.String(60), nullable=False),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("payment_method", sa.String(20), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount > 0", name="ck_transactions_amount_positive"),
        sa.CheckConstraint("transaction_type IN ('income','expense')", name="ck_transactions_type"),
    )
    op.create_index("ix_transactions_business_id", "transactions", ["business_id"])
    op.create_index("ix_transactions_business_date", "transactions", ["business_id", "transaction_date"])


def downgrade() -> None:
    op.drop_index("ix_transactions_business_date", table_name="transactions")
    op.drop_index("ix_transactions_business_id", table_name="transactions")
    op.drop_table("transactions")
