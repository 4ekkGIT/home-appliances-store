const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
  .replace(/\/$/, '')

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    })
  } catch {
    throw new Error('Could not connect to the store. Check that the backend is running.')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      message = body.detail || body.message || body.error || message
    } catch {
      // The response may not contain a JSON error body.
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

export function getProducts(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  return request(`/products${query.size ? `?${query}` : ''}`).then((page) => ({
    ...page,
    content: page.content.map((product) => ({
      ...product,
      _id: String(product.id),
      image: (product.images || [])
        .slice()
        .sort((a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder)
        .map((image) => image.imageUrl),
      category: product.categoryName,
      brand: product.brandName,
      date: product.createdAt,
      bestSeller: false,
    })),
  }))
}

export async function getProductById(id) {
  const product = await request(`/products/${encodeURIComponent(id)}`)
  return {
    ...product,
    _id: String(product.id),
    image: (product.images || [])
      .slice()
      .sort((a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder)
      .map((image) => image.imageUrl),
    category: product.categoryName,
    brand: product.brandName,
    date: product.createdAt,
    bestSeller: false,
  }
}

export function getCategories() {
  return request('/categories')
}

export function getBrands() {
  return request('/brands')
}
