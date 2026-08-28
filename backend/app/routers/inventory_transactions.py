from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.inventory_transaction import (
    InventoryTransactionCreate,
    InventoryTransactionResponse,
)
from backend.app.services.inventory_transaction import (
    create_inventory_transaction,
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



@router.post(
    "",
    response_model=InventoryTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_inventory_transaction(
    transaction_data: InventoryTransactionCreate,
    db: Session = Depends(get_db),
):
    transaction, error = (
        create_inventory_transaction(
            db,
            transaction_data,
        )
    )

    if error is not None:

        status_code_value = (
            status.HTTP_404_NOT_FOUND
            if error == "Product not found"
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=status_code_value,
            detail=error,
        )

    return transaction

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