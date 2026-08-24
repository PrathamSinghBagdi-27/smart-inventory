from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.analytics import DashboardResponse
from backend.app.schemas.sales_trend import SalesTrendPoint
from backend.app.schemas.top_products import TopProduct
from backend.app.schemas.low_stock import LowStockProduct
# from backend.app.schemas.low_stock import LowStockProduct
from backend.app.services.analytics import (
    get_dashboard_stats,
    get_sales_trend,
    get_low_stock_products,
    get_top_products,
)



router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def dashboard(
    db: Session = Depends(get_db),
):
    return get_dashboard_stats(db)


@router.get(
    "/sales-trend",
    response_model=list[SalesTrendPoint],
)
def sales_trend(
    days: int = Query(default=30, ge=1, le=90),
    db: Session = Depends(get_db),
):
    return get_sales_trend(db, days)

@router.get(
    "/low-stock",
    response_model=list[LowStockProduct],
)
def low_stock(
    db: Session = Depends(get_db),
):
    return get_low_stock_products(db)


@router.get(
    "/top-products",
    response_model=list[TopProduct],
)
def top_products(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return get_top_products(db, limit)