from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.models.category import Category
from backend.app.models.product import Product
from backend.app.models.sale import Sale
from backend.app.models.supplier import Supplier


def get_dashboard_stats(db: Session) -> dict:

    total_products = db.scalar(
        select(func.count(Product.id))
    ) or 0

    total_suppliers = db.scalar(
        select(func.count(Supplier.id))
    ) or 0

    total_categories = db.scalar(
        select(func.count(Category.id))
    ) or 0

    total_sales = db.scalar(
        select(func.count(Sale.id))
    ) or 0

    total_units_sold = db.scalar(
        select(func.coalesce(func.sum(Sale.quantity), 0))
    ) or 0

    current_inventory_units = db.scalar(
        select(func.coalesce(func.sum(Product.current_stock), 0))
    ) or 0

    low_stock_products = db.scalar(
        select(func.count(Product.id))
        .where(Product.current_stock <= Product.reorder_level)
    ) or 0

    inventory_value = db.scalar(
        select(
            func.coalesce(
                func.sum(Product.current_stock * Product.price),
                0,
            )
        )
    ) or 0

    top_selling_query = (
        select(
            Product.id,
            Product.name,
            func.sum(Sale.quantity).label("units_sold"),
        )
        .join(Sale, Sale.product_id == Product.id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(Sale.quantity).desc())
        .limit(5)
    )

    top_selling_rows = db.execute(top_selling_query).all()

    top_selling_products = [
        {
            "product_id": row.id,
            "product_name": row.name,
            "units_sold": int(row.units_sold),
        }
        for row in top_selling_rows
    ]

    return {
        "total_products": total_products,
        "total_suppliers": total_suppliers,
        "total_categories": total_categories,
        "total_sales": total_sales,
        "total_units_sold": int(total_units_sold),
        "current_inventory_units": int(current_inventory_units),
        "low_stock_products": low_stock_products,
        "inventory_value": float(inventory_value),
        "top_selling_products": top_selling_products,
    }


def get_sales_trend(
    db: Session,
    days: int = 30,
) -> list[dict]:

    sale_date = func.date(Sale.sold_at)

    statement = (
        select(
            sale_date.label("date"),
            func.sum(Sale.quantity).label("units_sold"),
            func.count(Sale.id).label("sales_count"),
        )
        .group_by(sale_date)
        .order_by(sale_date)
        .limit(days)
    )

    rows = db.execute(statement).all()

    return [
        {
            "date": row.date,
            "units_sold": int(row.units_sold),
            "sales_count": int(row.sales_count),
        }
        for row in rows
    ]

def get_low_stock_products(
    db: Session,
) -> list[dict]:

    products = db.scalars(
        select(Product)
        .where(Product.current_stock <= Product.reorder_level)
        .order_by(Product.current_stock.asc())
    ).all()

    return [
        {
            "product_id": product.id,
            "product_name": product.name,
            "current_stock": product.current_stock,
            "reorder_level": product.reorder_level,
            "recommended_reorder": max(
                product.reorder_level * 2 - product.current_stock,
                0,
            ),
        }
        for product in products
    ]

def get_top_products(
    db: Session,
    limit: int = 10,
) -> list[dict]:

    statement = (
        select(
            Product.id,
            Product.name,
            func.sum(Sale.quantity).label("units_sold"),
        )
        .join(Sale, Sale.product_id == Product.id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(Sale.quantity).desc())
        .limit(limit)
    )

    rows = db.execute(statement).all()

    return [
        {
            "product_id": row.id,
            "product_name": row.name,
            "units_sold": int(row.units_sold),
        }
        for row in rows
    ]