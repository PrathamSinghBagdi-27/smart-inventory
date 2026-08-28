from sqlalchemy import select
from sqlalchemy.orm import Session
from backend.app.models.product import Product
from backend.app.schemas.inventory_transaction import (
    InventoryTransactionCreate,
)

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



def create_inventory_transaction(
    db: Session,
    transaction_data: InventoryTransactionCreate,
) -> tuple[
    InventoryTransaction | None,
    str | None,
]:

    product = db.get(
        Product,
        transaction_data.product_id,
    )

    if product is None:
        return None, "Product not found"

    transaction_type = (
        transaction_data.transaction_type
        .strip()
        .upper()
    )

    if transaction_type not in {
        "RECEIVE",
        "ISSUE",
        "ADJUST",
    }:
        return (
            None,
            "Invalid transaction type",
        )

    quantity = transaction_data.quantity

    if transaction_type == "RECEIVE":

        product.current_stock += quantity

    elif transaction_type == "ISSUE":

        if quantity > product.current_stock:
            return (
                None,
                "Insufficient stock",
            )

        product.current_stock -= quantity

    elif transaction_type == "ADJUST":

        product.current_stock += quantity

    transaction = InventoryTransaction(
        product_id=product.id,
        transaction_type=transaction_type,
        quantity=quantity,
        reason=transaction_data.reason,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction, None