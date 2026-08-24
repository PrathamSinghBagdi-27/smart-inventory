from pydantic import BaseModel


class TopProduct(BaseModel):
    product_id: int
    product_name: str
    units_sold: int