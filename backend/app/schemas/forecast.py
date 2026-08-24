from datetime import date

from pydantic import BaseModel


class ForecastPoint(BaseModel):
    date: date
    predicted_units: float


class ProductForecast(BaseModel):
    product_id: int
    product_name: str
    forecast_days: int
    predictions: list[ForecastPoint]