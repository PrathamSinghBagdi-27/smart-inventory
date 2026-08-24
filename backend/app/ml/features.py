from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.models.sale import Sale


def get_daily_sales(
    db: Session,
    product_id: int,
) -> list[dict]:

    statement = (
        select(
            func.date(Sale.sold_at).label("sale_date"),
            func.sum(Sale.quantity).label("units_sold"),
        )
        .where(Sale.product_id == product_id)
        .group_by(func.date(Sale.sold_at))
        .order_by(func.date(Sale.sold_at))
    )

    rows = db.execute(statement).all()

    return [
        {
            "date": row.sale_date,
            "units_sold": int(row.units_sold),
        }
        for row in rows
    ]


def build_sales_features(
    daily_sales: list[dict],
) -> list[dict]:

    features = []

    for index, current in enumerate(daily_sales):

        previous_7 = daily_sales[
            max(0, index - 7):index
        ]

        previous_14 = daily_sales[
            max(0, index - 14):index
        ]

        previous_30 = daily_sales[
            max(0, index - 30):index
        ]

        avg_7 = (
            sum(row["units_sold"] for row in previous_7)
            / len(previous_7)
            if previous_7
            else 0
        )

        avg_14 = (
            sum(row["units_sold"] for row in previous_14)
            / len(previous_14)
            if previous_14
            else 0
        )

        avg_30 = (
            sum(row["units_sold"] for row in previous_30)
            / len(previous_30)
            if previous_30
            else 0
        )

        features.append(
            {
                "date": current["date"],
                "units_sold": current["units_sold"],
                "avg_7": round(avg_7, 2),
                "avg_14": round(avg_14, 2),
                "avg_30": round(avg_30, 2),
            }
        )

    return features



def add_trend_feature(
    features: list[dict],
) -> list[dict]:

    for row in features:

        if row["avg_30"] > 0:
            row["trend"] = round(
                (row["avg_7"] - row["avg_30"])
                / row["avg_30"],
                4,
            )
        else:
            row["trend"] = 0.0

    return features