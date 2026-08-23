from pydantic import BaseModel


class TopSellingProduct(BaseModel):
    product_id: int
    product_name: str
    units_sold: int


class DashboardResponse(BaseModel):
    total_products: int
    total_suppliers: int
    total_categories: int
    total_sales: int
    total_units_sold: int
    current_inventory_units: int
    low_stock_products: int
    inventory_value: float
    top_selling_products: list[TopSellingProduct]