from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InventoryTransactionCreate(BaseModel):
    product_id: int
    transaction_type: str
    quantity: int = Field(gt=0)
    reason: str | None = None


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    transaction_type: str
    quantity: int
    reason: str | None = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )