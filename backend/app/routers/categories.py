from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.category import CategoryCreate, CategoryResponse
from backend.app.services.category import (
    create_category,
    get_categories,
    get_category,
)


router = APIRouter(
    prefix="/api/v1/categories",
    tags=["Categories"],
)


@router.get(
    "",
    response_model=list[CategoryResponse],
)
def list_categories(
    db: Session = Depends(get_db),
):
    return get_categories(db)


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
def read_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    category = get_category(db, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
):
    return create_category(db, category_data)