from pydantic import BaseModel, ConfigDict


class SupplierBase(BaseModel):
    name: str
    contact_email: str | None = None
    phone: str | None = None


class SupplierCreate(SupplierBase):
    pass


class SupplierResponse(SupplierBase):
    id: int

    model_config = ConfigDict(from_attributes=True)