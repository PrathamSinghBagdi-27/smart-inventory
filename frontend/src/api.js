const API_BASE = 'http://127.0.0.1:8000'

async function fetchJSON(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`)

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`
    )
  }

  return response.json()
}

export async function getDashboardStats() {
  return fetchJSON(
    '/api/v1/analytics/dashboard'
  )
}

export async function getSalesTrend(days = 30) {
  return fetchJSON(
    `/api/v1/analytics/sales-trend?days=${days}`
  )
}

export async function getLowStock() {
  return fetchJSON(
    '/api/v1/analytics/low-stock'
  )
}

export async function getInventoryIntelligence() {
  return fetchJSON(
    '/api/v1/forecast/intelligence'
  )
}

export async function getInventoryForecast() {
  return fetchJSON(
    '/api/v1/forecast/inventory'
  )
}