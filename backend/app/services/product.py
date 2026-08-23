from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.category import Category
from backend.app.models.product import Product
from backend.app.models.supplier import Supplier
from backend.app.schemas.product import ProductCreate


def get_products(db: Session) -> list[Product]:
    statement = select(Product).order_by(Product.name)
    return list(db.scalars(statement).all())


def get_product(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def create_product(
    db: Session,
    product_data: ProductCreate,
) -> tuple[Product | None, str | None]:

    category = db.get(Category, product_data.category_id)

    if category is None:
        return None, "Category not found"

    if product_data.supplier_id is not None:
        supplier = db.get(Supplier, product_data.supplier_id)

        if supplier is None:
            return None, "Supplier not found"

    existing_product = db.scalar(
        select(Product).where(Product.sku == product_data.sku)
    )

    if existing_product is not None:
        return None, "A product with this SKU already exists"

    product = Product(
        sku=product_data.sku,
        name=product_data.name,
        category_id=product_data.category_id,
        supplier_id=product_data.supplier_id,
        price=product_data.price,
        current_stock=product_data.current_stock,
        reorder_level=product_data.reorder_level,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product, None
