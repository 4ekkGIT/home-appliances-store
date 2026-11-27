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

export function getWarehouses() {
  return request('/warehouses')
}

export function createCategory(category) {
  return request('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  })
}

export function updateCategory(id, category) {
  return request(`/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  })
}

export function deleteCategory(id) {
  return request(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function createBrand(brand) {
  return request('/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brand),
  })
}

export function createProduct(product) {
  return request('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
}

export function updateProduct(id, product) {
  return request(`/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
}

export function deleteProduct(id) {
  return request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function deleteProductPermanently(id) {
  return request(`/products/${encodeURIComponent(id)}/permanent`, { method: 'DELETE' })
}

export function registerInventoryUnit(unit) {
  return request('/inventory/units', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unit),
  })
}

export function createOrder(order) {
  return request('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
}
