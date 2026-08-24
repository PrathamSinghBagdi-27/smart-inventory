from datetime import date

from pydantic import BaseModel


class SalesTrendPoint(BaseModel):
    date: date
    units_sold: int
    sales_count: int