from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SaleCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class SaleResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    sold_at: datetime

    model_config = ConfigDict(from_attributes=True)
    