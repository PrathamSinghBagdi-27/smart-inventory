from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.category import Category
from backend.app.schemas.category import CategoryCreate


def get_categories(db: Session) -> list[Category]:
    statement = select(Category).order_by(Category.name)
    return list(db.scalars(statement).all())


def get_category(db: Session, category_id: int) -> Category | None:
    return db.get(Category, category_id)


def create_category(
    db: Session,
    category_data: CategoryCreate,
) -> Category:
    category = Category(name=category_data.name)

    db.add(category)
    db.commit()
    db.refresh(category)

    return category
