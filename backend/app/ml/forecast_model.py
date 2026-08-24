from datetime import date

from sklearn.ensemble import RandomForestRegressor

from backend.app.ml.features import (
    add_trend_feature,
    build_sales_features,
)


FEATURE_COLUMNS = [
    "avg_7",
    "avg_14",
    "avg_30",
    "trend",
    "day_of_week",
]


def prepare_training_data(
    daily_sales: list[dict],
):
    features = build_sales_features(daily_sales)
    features = add_trend_feature(features)

    X = []
    y = []

    for index, row in enumerate(features):

        # We need some history before training.
        if index < 7:
            continue

        row_date = date.fromisoformat(str(row["date"]))

        X.append(
            [
                row["avg_7"],
                row["avg_14"],
                row["avg_30"],
                row["trend"],
                row_date.weekday(),
            ]
        )

        y.append(row["units_sold"])

    return X, y


def train_demand_model(
    daily_sales: list[dict],
) -> RandomForestRegressor:

    X, y = prepare_training_data(daily_sales)

    if len(X) < 5:
        raise ValueError(
            "Not enough sales history to train the model."
        )

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=6,
        random_state=42,
    )

    model.fit(X, y)

    return model