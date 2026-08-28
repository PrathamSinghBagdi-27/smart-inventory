from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    sku: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    category_id: int
    supplier_id: int | None = None
    price: Decimal = Field(ge=0)
    current_stock: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ProductUpdate(BaseModel):
    sku: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    category_id: int
    supplier_id: int | None = None
    price: Decimal = Field(ge=0)
    reorder_level: int = Field(default=0, ge=0)