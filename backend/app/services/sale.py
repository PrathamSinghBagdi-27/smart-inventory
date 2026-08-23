from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.inventory_transaction import InventoryTransaction
from backend.app.models.product import Product
from backend.app.models.sale import Sale
from backend.app.schemas.sale import SaleCreate


def get_sales(db: Session) -> list[Sale]:
    statement = select(Sale).order_by(Sale.sold_at.desc())
    return list(db.scalars(statement).all())


def get_sale(db: Session, sale_id: int) -> Sale | None:
    return db.get(Sale, sale_id)


def create_sale(
    db: Session,
    sale_data: SaleCreate,
) -> tuple[Sale | None, str | None]:

    product = db.get(Product, sale_data.product_id)

    if product is None:
        return None, "Product not found"

    if product.current_stock < sale_data.quantity:
        return None, (
            f"Insufficient stock. Available: {product.current_stock}, "
            f"requested: {sale_data.quantity}"
        )

    # Reduce inventory
    product.current_stock -= sale_data.quantity

    # Create sale record
    sale = Sale(
        product_id=sale_data.product_id,
        quantity=sale_data.quantity,
    )

    db.add(sale)
    db.flush()

    # Record inventory movement
    transaction = InventoryTransaction(
        product_id=sale_data.product_id,
        transaction_type="SALE",
        quantity=-sale_data.quantity,
        reason=f"Sale #{sale.id}",
    )

    db.add(transaction)

    db.commit()
    db.refresh(sale)

    return sale, None