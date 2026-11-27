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

export function getAvailableStock(productId, warehouseId) {
  const query = new URLSearchParams({ productId: String(productId) })
  if (warehouseId !== undefined && warehouseId !== null && warehouseId !== '') {
    query.set('warehouseId', String(warehouseId))
  }
  return request(`/inventory/available?${query}`)
}

export function getWarehouses() {
  return request('/warehouses')
}

export function getInventoryUnits() {
  return request('/inventory/units')
}

export function getUnitMovements(unitId) {
  return request(`/inventory/units/${encodeURIComponent(unitId)}/movements`)
}

export function transferInventoryUnit(unitId, transfer) {
  return request(`/inventory/units/${encodeURIComponent(unitId)}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transfer),
  })
}

export function updateInventoryUnitStatus(unitId, status) {
  return request(`/inventory/units/${encodeURIComponent(unitId)}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  })
}

export function setAvailableStock(stock) {
  return request('/inventory/stock', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stock),
  })
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

export function deleteCategory(id, replacementCategoryId) {
  const query = replacementCategoryId
    ? `?replacementCategoryId=${encodeURIComponent(replacementCategoryId)}`
    : ''
  return request(`/categories/${encodeURIComponent(id)}${query}`, { method: 'DELETE' })
}

export function createBrand(brand) {
  return request('/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brand),
  })
}

export function updateBrand(id, brand) {
  return request(`/brands/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brand),
  })
}

export function deleteBrand(id) {
  return request(`/brands/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function getCategoryAttributes(categoryId) {
  return request(`/categories/${encodeURIComponent(categoryId)}/attributes`)
}

export function createCategoryAttribute(categoryId, attribute) {
  return request(`/categories/${encodeURIComponent(categoryId)}/attributes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attribute),
  })
}

export function updateCategoryAttribute(categoryId, attributeId, attribute) {
  return request(`/categories/${encodeURIComponent(categoryId)}/attributes/${encodeURIComponent(attributeId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attribute),
  })
}

export function deleteCategoryAttribute(categoryId, attributeId) {
  return request(`/categories/${encodeURIComponent(categoryId)}/attributes/${encodeURIComponent(attributeId)}`, {
    method: 'DELETE',
  })
}

export function getProductImages(productId) {
  return request(`/products/${encodeURIComponent(productId)}/images`)
}

export function uploadProductImage(productId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request(`/products/${encodeURIComponent(productId)}/images/upload`, {
    method: 'POST',
    body: formData,
  })
}

export function replaceProductImages(productId, images) {
  return request(`/products/${encodeURIComponent(productId)}/images`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
  })
}

export function createWarehouse(warehouse) {
  return request('/warehouses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(warehouse),
  })
}

export function updateWarehouse(id, warehouse) {
  return request(`/warehouses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(warehouse),
  })
}

export function deleteWarehouse(id) {
  return request(`/warehouses/${encodeURIComponent(id)}`, { method: 'DELETE' })
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

export function getAdminOrders() {
  return request('/orders')
}

export function updateOrderStatus(id, status) {
  return request(`/orders/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
