from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.supplier import Supplier
from backend.app.schemas.supplier import SupplierCreate


def get_suppliers(db: Session) -> list[Supplier]:
    statement = select(Supplier).order_by(Supplier.name)
    return list(db.scalars(statement).all())


def get_supplier(db: Session, supplier_id: int) -> Supplier | None:
    return db.get(Supplier, supplier_id)


def create_supplier(
    db: Session,
    supplier_data: SupplierCreate,
) -> Supplier:
    supplier = Supplier(
        name=supplier_data.name,
        contact_email=supplier_data.contact_email,
        phone=supplier_data.phone,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier