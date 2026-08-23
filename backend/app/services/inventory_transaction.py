from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.inventory_transaction import InventoryTransaction


def get_inventory_transactions(
    db: Session,
) -> list[InventoryTransaction]:

    statement = (
        select(InventoryTransaction)
        .order_by(InventoryTransaction.created_at.desc())
    )

    return list(db.scalars(statement).all())


def get_inventory_transaction(
    db: Session,
    transaction_id: int,
) -> InventoryTransaction | None:

    return db.get(InventoryTransaction, transaction_id)


def get_product_transactions(
    db: Session,
    product_id: int,
) -> list[InventoryTransaction]:

    statement = (
        select(InventoryTransaction)
        .where(InventoryTransaction.product_id == product_id)
        .order_by(InventoryTransaction.created_at.desc())
    )

    return list(db.scalars(statement).all())