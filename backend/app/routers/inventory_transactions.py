from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.inventory_transaction import (
    InventoryTransactionResponse,
)
from backend.app.services.inventory_transaction import (
    get_inventory_transaction,
    get_inventory_transactions,
    get_product_transactions,
)


router = APIRouter(
    prefix="/api/v1/inventory-transactions",
    tags=["Inventory Transactions"],
)


@router.get(
    "",
    response_model=list[InventoryTransactionResponse],
)
def list_inventory_transactions(
    db: Session = Depends(get_db),
):
    return get_inventory_transactions(db)


@router.get(
    "/{transaction_id}",
    response_model=InventoryTransactionResponse,
)
def read_inventory_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = get_inventory_transaction(
        db,
        transaction_id,
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory transaction not found",
        )

    return transaction


@router.get(
    "/product/{product_id}",
    response_model=list[InventoryTransactionResponse],
)
def list_product_transactions(
    product_id: int,
    db: Session = Depends(get_db),
):
    return get_product_transactions(
        db,
        product_id,
    )