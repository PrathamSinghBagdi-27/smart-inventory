from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.models.product import Product
from backend.app.models.sale import Sale


def forecast_product_demand(
    db: Session,
    product_id: int,
    forecast_days: int = 7,
) -> dict:

    product = db.get(Product, product_id)

    if product is None:
        raise ValueError("Product not found")

    daily_sales = (
        select(
            func.date(Sale.sold_at).label("sale_date"),
            func.sum(Sale.quantity).label("units_sold"),
        )
        .where(Sale.product_id == product_id)
        .group_by(func.date(Sale.sold_at))
        .order_by(func.date(Sale.sold_at))
    )

    rows = db.execute(daily_sales).all()

    if not rows:
        average_daily_sales = 0.0
    else:
        total_units = sum(int(row.units_sold) for row in rows)
        average_daily_sales = total_units / len(rows)

    predictions = []

    start_date = date.today()

    for day in range(1, forecast_days + 1):
        prediction_date = start_date + timedelta(days=day)

        predictions.append(
            {
                "date": prediction_date,
                "predicted_units": round(average_daily_sales, 2),
            }
        )

    return {
        "product_id": product.id,
        "product_name": product.name,
        "forecast_days": forecast_days,
        "predictions": predictions,
    }