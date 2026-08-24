import math
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.models.product import Product
from backend.app.ml.features import get_daily_sales
from backend.app.ml.forecast_model import train_demand_model


def forecast_product_demand(
    db: Session,
    product_id: int,
) -> dict:

    # Find the product
    product = db.scalar(
        select(Product).where(
            Product.id == product_id
        )
    )

    if product is None:
        raise ValueError(
            f"Product {product_id} not found."
        )

    # Get historical sales
    daily_sales = get_daily_sales(
        db,
        product_id,
    )

    if len(daily_sales) < 12:
        raise ValueError(
            "Not enough sales history to forecast this product."
        )

    # Train the model
    model = train_demand_model(
        daily_sales
    )

    # Use the most recent engineered features
    from backend.app.ml.features import (
        add_trend_feature,
        build_sales_features,
    )

    features = build_sales_features(
        daily_sales
    )

    features = add_trend_feature(
        features
    )

    latest = features[-1]

    from datetime import date

    latest_date = date.fromisoformat(
        str(latest["date"])
    )

    # Predict the next day's demand
    prediction = model.predict(
        [[
            latest["avg_7"],
            latest["avg_14"],
            latest["avg_30"],
            latest["trend"],
            (latest_date.weekday() + 1) % 7,
        ]]
    )[0]

    predicted_demand = max(
        0,
        round(float(prediction), 2),
    )

    # Calculate how many days the current stock may last
    if predicted_demand > 0:
        days_of_stock = (
            product.current_stock / predicted_demand
        )
    else:
        days_of_stock = float("inf")

    # Determine stockout risk
    if days_of_stock < 7:
        stockout_risk = "HIGH"
    elif days_of_stock < 14:
        stockout_risk = "MEDIUM"
    else:
        stockout_risk = "LOW"

    # We want approximately 14 days of projected stock
    target_stock = (
        predicted_demand * 14
    )

    recommended_reorder = max(
        0,
        math.ceil(
            target_stock - product.current_stock
        ),
    )

    return {
        "product_id": product.id,
        "product_name": product.name,
        "current_stock": product.current_stock,
        "predicted_daily_demand": predicted_demand,
        "days_of_stock": round(days_of_stock, 2)
        if days_of_stock != float("inf")
        else None,
        "stockout_risk": stockout_risk,
        "recommended_reorder": recommended_reorder,
    }


def forecast_entire_inventory(
    db: Session,
) -> list[dict]:

    products = db.scalars(
        select(Product)
    ).all()

    results = []

    for product in products:

        try:
            forecast = forecast_product_demand(
                db,
                product.id,
            )

            results.append(forecast)

        except ValueError:
            # Skip products that do not have
            # enough sales history.
            continue

    # Highest-risk products first
    risk_order = {
        "HIGH": 0,
        "MEDIUM": 1,
        "LOW": 2,
    }

    results.sort(
        key=lambda item: (
            risk_order.get(
                item["stockout_risk"],
                3,
            ),
            item["days_of_stock"]
            if item["days_of_stock"] is not None
            else float("inf"),
        )
    )

    return results




def get_inventory_intelligence(
    db: Session,
) -> dict:

    forecasts = forecast_entire_inventory(db)

    high_risk = [
        item
        for item in forecasts
        if item["stockout_risk"] == "HIGH"
    ]

    medium_risk = [
        item
        for item in forecasts
        if item["stockout_risk"] == "MEDIUM"
    ]

    low_risk = [
        item
        for item in forecasts
        if item["stockout_risk"] == "LOW"
    ]

    total_recommended_reorder = sum(
        item["recommended_reorder"]
        for item in forecasts
    )

    return {
        "total_products_analyzed": len(forecasts),
        "high_risk_products": len(high_risk),
        "medium_risk_products": len(medium_risk),
        "low_risk_products": len(low_risk),
        "total_recommended_reorder": (
            total_recommended_reorder
        ),
        "urgent_products": high_risk,
        "watch_list": medium_risk,
    }