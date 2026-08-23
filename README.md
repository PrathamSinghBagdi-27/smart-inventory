# Smart Inventory Intelligence System

A predictive inventory management system for small and medium-sized retailers.

## Current Status

Phase 1 - Project Setup

## Tech Stack

- Python
- FastAPI
- Uvicorn
- SQLite
- SQLAlchemy
- Scikit-learn
- HTML
- CSS
- JavaScript
- Chart.js

## Project Goal

The system helps retailers understand:

- What is selling
- What is about to run out
- How much to reorder
- When to reorder
- Which products are at risk

## Current API

### Health Check

GET `/health`

Returns:

```json
{
  "status": "healthy"
}