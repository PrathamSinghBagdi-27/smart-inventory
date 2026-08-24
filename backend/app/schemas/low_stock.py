from pydantic import BaseModel


class LowStockProduct(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    reorder_level: int
    recommended_reorder: int