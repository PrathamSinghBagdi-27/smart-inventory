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


export async function getProducts() {
  return fetchJSON(
    '/api/v1/products'
  )
}

export async function getProduct(productId) {
  return fetchJSON(
    `/api/v1/products/${productId}`
  )
}



export async function createProduct(productData) {
  const response = await fetch(
    `${API_BASE}/api/v1/products`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.detail ||
      `API request failed: ${response.status}`
    )
  }

  return response.json()
}



export async function getCategories() {
  return fetchJSON(
    '/api/v1/categories'
  )
}

export async function createCategory(name) {
  const response = await fetch(
    `${API_BASE}/api/v1/categories`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new Error(
      errorData?.detail ||
      `Category creation failed: ${response.status}`
    )
  }

  return response.json()
}




export async function getSuppliers() {
  return fetchJSON(
    '/api/v1/suppliers'
  )
}

export async function createSupplier(
  name,
  contact_email = null,
  phone = null
) {
  const response = await fetch(
    `${API_BASE}/api/v1/suppliers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        contact_email,
        phone,
      }),
    }
  )

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => null)

    throw new Error(
      errorData?.detail ||
      `Supplier creation failed: ${response.status}`
    )
  }

  return response.json()
}


export async function updateProduct(
  productId,
  productData
) {
  const response = await fetch(
    `${API_BASE}/api/v1/products/${productId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    }
  )

  if (!response.ok) {
    const errorData =
      await response.json().catch(() => null)

    throw new Error(
      errorData?.detail ||
      `Product update failed: ${response.status}`
    )
  }

  return response.json()
}