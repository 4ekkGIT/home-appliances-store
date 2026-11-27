import { request } from './request'

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

export function getAvailableStock(productId) {
  return request(`/inventory/available?productId=${encodeURIComponent(productId)}`)
}

export function createOrder(order) {
  return request('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
}
