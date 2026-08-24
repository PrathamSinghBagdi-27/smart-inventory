# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session

# from backend.app.core.database import get_db
# from backend.app.schemas.forecast import ProductForecast
# from backend.app.ml.forecast import forecast_product_demand


# router = APIRouter(
#     prefix="/api/v1/forecast",
#     tags=["Forecasting"],
# )


# @router.get(
#     "/product/{product_id}",
#     response_model=ProductForecast,
# )
# def product_forecast(
#     product_id: int,
#     days: int = Query(default=7, ge=1, le=30),
#     db: Session = Depends(get_db),
# ):
#     try:
#         return forecast_product_demand(
#             db,
#             product_id,
#             days,
#         )

#     except ValueError as error:
#         raise HTTPException(
#             status_code=404,
#             detail=str(error),
#         )



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.services.forecasting import (
    forecast_product_demand,
    forecast_entire_inventory,
    get_inventory_intelligence,
)


router = APIRouter(
    prefix="/api/v1/forecast",
    tags=["Forecasting"],
)


@router.get("/inventory")
def get_inventory_forecast(
    db: Session = Depends(get_db),
):
    return forecast_entire_inventory(db)



@router.get("/intelligence")
def get_intelligence(
    db: Session = Depends(get_db),
):
    return get_inventory_intelligence(db)




@router.get("/{product_id}")
def get_product_forecast(
    product_id: int,
    db: Session = Depends(get_db),
):
    try:
        return forecast_product_demand(
            db,
            product_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


