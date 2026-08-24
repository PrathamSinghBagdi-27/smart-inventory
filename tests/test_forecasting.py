from backend.app.core.database import SessionLocal
from backend.app.services.forecasting import (
    forecast_product_demand,
)


def main():
    db = SessionLocal()

    try:
        product_id = 1

        result = forecast_product_demand(
            db,
            product_id,
        )

        print("\n=== DEMAND FORECAST ===")

        for key, value in result.items():
            print(f"{key}: {value}")

    finally:
        db.close()


if __name__ == "__main__":
    main()