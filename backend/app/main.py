# from fastapi import FastAPI

# app = FastAPI(title="Smart Inventory Intelligence System")


# @app.get("/health")
# def health_check():
#     return {"status": "healthy"}




from fastapi import FastAPI

from backend.app.routers.categories import router as categories_router
from backend.app.routers.suppliers import router as suppliers_router
from backend.app.routers.products import router as products_router


app = FastAPI(
    title="Smart Inventory Intelligence System",
)


app.include_router(categories_router)
app.include_router(suppliers_router)
app.include_router(products_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}