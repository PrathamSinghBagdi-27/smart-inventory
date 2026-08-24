# from backend.app.core.database import SessionLocal
# from backend.app.ml.features import (
#     add_trend_feature,
#     build_sales_features,
#     get_daily_sales,
# )


# def main():
#     db = SessionLocal()

#     try:
#         product_id = 1

#         daily_sales = get_daily_sales(
#             db,
#             product_id,
#         )

#         print("\n=== DAILY SALES ===")

#         for row in daily_sales:
#             print(row)

#         features = build_sales_features(
#             daily_sales
#         )

#         features = add_trend_feature(
#             features
#         )

#         print("\n=== ENGINEERED FEATURES ===")

#         for row in features:
#             print(row)

#     finally:
#         db.close()


# if __name__ == "__main__":
#     main()






from backend.app.core.database import SessionLocal
from backend.app.ml.features import get_daily_sales
from backend.app.ml.forecast_model import (
    prepare_training_data,
    train_demand_model,
)


def main():
    db = SessionLocal()

    try:
        product_id = 1

        daily_sales = get_daily_sales(
            db,
            product_id,
        )

        print("\n=== DAILY SALES ===")
        print(f"Days available: {len(daily_sales)}")

        X, y = prepare_training_data(
            daily_sales
        )

        print("\n=== TRAINING DATA ===")
        print(f"Training samples: {len(X)}")
        print(f"Features per sample: {len(X[0]) if X else 0}")

        model = train_demand_model(
            daily_sales
        )

        print("\n=== MODEL ===")
        print("Random Forest trained successfully!")

        prediction = model.predict([X[-1]])

        print(
            f"Test prediction: "
            f"{prediction[0]:.2f} units"
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()