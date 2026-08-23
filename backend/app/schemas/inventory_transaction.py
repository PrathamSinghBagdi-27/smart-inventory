from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    transaction_type: str
    quantity: int
    reason: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)