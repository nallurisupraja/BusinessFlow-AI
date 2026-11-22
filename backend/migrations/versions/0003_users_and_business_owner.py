"""Add users table and owner column on businesses.

Existing businesses keep owner_user_id = NULL (unassigned legacy).
"""

import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as postgresql

from alembic import op

revision = "0003_users_and_business_owner"
down_revision = "0002_create_businesses"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("full_name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(254), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.add_column(
        "businesses",
        sa.Column(
            "owner_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="RESTRICT"),
            nullable=True,
        ),
    )
    op.create_index("ix_businesses_owner_user_id", "businesses", ["owner_user_id"])


def downgrade() -> None:
    op.drop_index("ix_businesses_owner_user_id", table_name="businesses")
    op.drop_column("businesses", "owner_user_id")
    op.drop_table("users")
