from fastapi import FastAPI

app = FastAPI(title="Smart Inventory Intelligence System")


@app.get("/health")
def health_check():
    return {"status": "healthy"}