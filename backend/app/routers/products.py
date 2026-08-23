from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.product import ProductCreate, ProductResponse
from backend.app.services.product import (
    create_product,
    get_product,
    get_products,
)


router = APIRouter(
    prefix="/api/v1/products",
    tags=["Products"],
)


@router.get(
    "",
    response_model=list[ProductResponse],
)
def list_products(
    db: Session = Depends(get_db),
):
    return get_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = get_product(db, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
):
    product, error = create_product(db, product_data)

    if error is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    return product