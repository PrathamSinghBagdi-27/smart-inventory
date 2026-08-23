from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.sale import SaleCreate, SaleResponse
from backend.app.services.sale import (
    create_sale,
    get_sale,
    get_sales,
)


router = APIRouter(
    prefix="/api/v1/sales",
    tags=["Sales"],
)


@router.get(
    "",
    response_model=list[SaleResponse],
)
def list_sales(
    db: Session = Depends(get_db),
):
    return get_sales(db)


@router.get(
    "/{sale_id}",
    response_model=SaleResponse,
)
def read_sale(
    sale_id: int,
    db: Session = Depends(get_db),
):
    sale = get_sale(db, sale_id)

    if sale is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found",
        )

    return sale


@router.post(
    "",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_sale(
    sale_data: SaleCreate,
    db: Session = Depends(get_db),
):
    sale, error = create_sale(db, sale_data)

    if error is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    return sale