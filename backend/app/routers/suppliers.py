from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.supplier import SupplierCreate, SupplierResponse
from backend.app.services.supplier import (
    create_supplier,
    get_supplier,
    get_suppliers,
)


router = APIRouter(
    prefix="/api/v1/suppliers",
    tags=["Suppliers"],
)


@router.get(
    "",
    response_model=list[SupplierResponse],
)
def list_suppliers(
    db: Session = Depends(get_db),
):
    return get_suppliers(db)


@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def read_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = get_supplier(db, supplier_id)

    if supplier is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    return supplier


@router.post(
    "",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
):
    return create_supplier(db, supplier_data)