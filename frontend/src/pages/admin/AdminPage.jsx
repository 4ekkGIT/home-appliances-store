import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Boxes, PackagePlus, Pencil, Tags, Trash2, X } from 'lucide-react'
import { ShopContext } from '../../context/ShopContext'
import {
  createCategory,
  createBrand,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProductPermanently,
  getAvailableStock,
  getBrands,
  getCategories,
  getProducts,
  getWarehouses,
  registerInventoryUnit,
  updateCategory,
  updateProduct,
} from '../../api/client'

const fieldClass = 'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700'
const labelClass = 'block text-sm font-medium text-gray-800'

const makeSlug = (value) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const AdminPage = () => {
  const { loadCatalog } = useContext(ShopContext)
  const [activeTab, setActiveTab] = useState('products')
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [stock, setStock] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [categoryImageUrl, setCategoryImageUrl] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState('')
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productImageUrl, setProductImageUrl] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [productBrand, setProductBrand] = useState('')
  const [productActive, setProductActive] = useState(true)
  const [editingProductId, setEditingProductId] = useState('')
  const [initialStock, setInitialStock] = useState('1')
  const [productWarehouse, setProductWarehouse] = useState('')
  const [stockProduct, setStockProduct] = useState('')
  const [stockWarehouse, setStockWarehouse] = useState('')
  const [stockQuantity, setStockQuantity] = useState('1')

  useEffect(() => {
    let active = true
    Promise.all([
      getCategories(),
      getBrands(),
      getWarehouses(),
      getProducts({ page: 0, size: 100, sortBy: 'name', sortDirection: 'ASC' }),
    ])
      .then(async ([categoryList, brandList, warehouseList, productPage]) => {
        const stockEntries = await Promise.all(productPage.content.map(async (product) => {
          const availability = await getAvailableStock(product._id)
          return [product._id, availability.availableQuantity]
        }))
        if (!active) return
        setCategories(categoryList)
        setBrands(brandList)
        setWarehouses(warehouseList.filter((warehouse) => warehouse.active))
        setProducts(productPage.content)
        setStock(Object.fromEntries(stockEntries))
        setProductCategory((current) => current || String(categoryList[0]?.id || ''))
        setProductWarehouse((current) => current || String(warehouseList.find((warehouse) => warehouse.active)?.id || ''))
        setStockWarehouse((current) => current || String(warehouseList.find((warehouse) => warehouse.active)?.id || ''))
        setStockProduct((current) => current || String(productPage.content[0]?._id || ''))
        setError('')
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [refreshKey])

  const showError = (requestError) => {
    setNotice('')
    setError(requestError.message)
  }

  const handleCreateCategory = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const slug = makeSlug(categoryName)
    try {
      const request = {
        name: categoryName.trim(),
        slug,
        description: categoryDescription.trim(),
        imageUrl: categoryImageUrl.trim() || null,
      }
      const saved = editingCategoryId
        ? await updateCategory(editingCategoryId, request)
        : await createCategory(request)
      setCategoryName('')
      setCategoryDescription('')
      setCategoryImageUrl('')
      setEditingCategoryId('')
      if (!editingCategoryId) setProductCategory(String(saved.id))
      setNotice(`Category “${saved.name}” ${editingCategoryId ? 'updated' : 'created'}.`)
      setRefreshKey((value) => value + 1)
      await loadCatalog()
    } catch (requestError) {
      showError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const beginEditCategory = (category) => {
    setEditingCategoryId(String(category.id))
    setCategoryName(category.name)
    setCategoryDescription(category.description || '')
    setCategoryImageUrl(category.imageUrl || '')
    setError('')
    setNotice('')
  }

  const cancelEditCategory = () => {
    setEditingCategoryId('')
    setCategoryName('')
    setCategoryDescription('')
    setCategoryImageUrl('')
  }

  const handleDeleteCategory = async (category) => {
    const productCount = products.filter((product) => product.categoryId === category.id).length
    if (productCount > 0) return
    if (!window.confirm(`Delete category “${category.name}”?`)) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await deleteCategory(category.id)
      if (editingCategoryId === String(category.id)) cancelEditCategory()
      setNotice(`Category “${category.name}” deleted.`)
      setRefreshKey((value) => value + 1)
      await loadCatalog()
    } catch (requestError) {
      showError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const addUnits = async (productId, warehouseId, quantity) => {
    let added = 0
    let message = ''
    for (let index = 0; index < quantity; index += 1) {
      try {
        await registerInventoryUnit({ productId: Number(productId), warehouseId: Number(warehouseId) })
        added += 1
      } catch (requestError) {
        message = requestError.message
        break
      }
    }
    return { added, error: message }
  }

  const resetProductForm = () => {
    setProductName('')
    setProductDescription('')
    setProductImageUrl('')
    setProductPrice('')
    setInitialStock('1')
    setProductBrand('')
    setProductActive(true)
    setEditingProductId('')
  }

  const beginEditProduct = (product) => {
    setEditingProductId(product._id)
    setProductName(product.name)
    setProductDescription(product.description || '')
    setProductImageUrl(product.image?.[0] || '')
    setProductPrice(String(product.price))
    setProductCategory(String(product.categoryId))
    setProductBrand(product.brandName || '')
    setProductActive(Boolean(product.active))
    setError('')
    setNotice('')
  }

  const handleCreateProduct = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    let created
    try {
      const slug = makeSlug(productName)
      const brandName = productBrand.trim()
      let brand = brands.find((item) => item.name.trim().toLocaleLowerCase() === brandName.toLocaleLowerCase())
      if (brandName && !brand) {
        brand = await createBrand({ name: brandName, slug: makeSlug(brandName) })
        setBrands((current) => [...current, brand])
      }
      const productRequest = {
        categoryId: Number(productCategory),
        brandId: brand?.id ?? null,
        name: productName.trim(),
        slug,
        description: productDescription.trim(),
        price: Number(productPrice),
        active: productActive,
        images: productImageUrl.trim()
          ? [{ imageUrl: productImageUrl.trim(), altText: productName.trim(), displayOrder: 0, primary: true }]
          : [],
      }
      created = editingProductId
        ? await updateProduct(editingProductId, productRequest)
        : await createProduct(productRequest)
      if (editingProductId) {
        setNotice(`Product “${created.name}” updated.`)
        resetProductForm()
        setRefreshKey((value) => value + 1)
        return
      }
      let stockResult = { added: 0, error: '' }
      if (Number(initialStock) > 0) {
        stockResult = await addUnits(created.id, productWarehouse, Number(initialStock))
        if (stockResult.error) {
          setNotice(`Product created; ${stockResult.added} of ${initialStock} stock units were added. ${stockResult.error}`)
          resetProductForm()
          setRefreshKey((value) => value + 1)
          return
        }
      }
      setNotice(`Product “${created.name}” created with ${stockResult.added} available unit${stockResult.added === 1 ? '' : 's'}.`)
      resetProductForm()
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      showError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Archive “${product.name}”? It will be hidden from the storefront, while stock and order history are preserved.`)) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await deleteProduct(product._id)
      if (editingProductId === product._id) resetProductForm()
      setNotice(`Product “${product.name}” archived and hidden from the storefront.`)
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      showError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteProductPermanently = async (product) => {
    if (!window.confirm(`Permanently delete “${product.name}” and its stock units and movement history? This cannot be undone. Products with order history cannot be permanently deleted.`)) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await deleteProductPermanently(product._id)
      if (editingProductId === product._id) resetProductForm()
      setNotice(`Product “${product.name}” and its stock records were permanently deleted.`)
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      showError(requestError)
    } finally {
      setBusy(false)
    }
  }

  const handleAddStock = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await addUnits(stockProduct, stockWarehouse, Number(stockQuantity))
      const product = products.find((item) => item._id === stockProduct)
      setNotice(result.error
        ? `Added ${result.added} of ${stockQuantity} units to “${product?.name || 'product'}”. ${result.error}`
        : `Added ${result.added} unit${result.added === 1 ? '' : 's'} to “${product?.name || 'product'}”.`)
      setRefreshKey((value) => value + 1)
    } catch (requestError) {
      showError(requestError)
      setRefreshKey((value) => value + 1)
    } finally {
      setBusy(false)
    }
  }

  const tabs = [
    { id: 'products', label: 'Products', icon: PackagePlus },
    { id: 'stock', label: 'Inventory', icon: Boxes },
  ]

  return (
    <main className="mx-auto max-w-6xl py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Nexora / Store admin</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-950">Catalog management</h1>
        </div>
        <div role="tablist" aria-label="Admin sections" className="flex gap-1 border-b border-gray-200">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => { setActiveTab(id); setError(''); setNotice('') }}
              className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium ${activeTab === id ? 'border-gray-950 text-gray-950' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Icon size={16} aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="mt-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 border-l-2 border-green-700 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      {loading ? (
        <p role="status" className="py-16 text-center text-sm text-gray-500">Loading store data…</p>
      ) : activeTab === 'products' ? (
        <div className="grid gap-10 py-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <section aria-labelledby="category-heading">
            <div className="flex items-center gap-2">
              <Tags size={18} aria-hidden="true" />
              <h2 id="category-heading" className="text-lg font-semibold text-gray-950">Categories</h2>
            </div>
            <form onSubmit={handleCreateCategory} className="mt-5 grid gap-4">
              <label className={labelClass}>Category name<input required maxLength="100" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Category image URL <span className="font-normal text-gray-500">(optional)</span><input type="url" maxLength="500" value={categoryImageUrl} onChange={(event) => setCategoryImageUrl(event.target.value)} className={fieldClass} /></label>
              {categoryImageUrl && <img src={categoryImageUrl} alt="Category preview" className="h-28 w-28 border border-gray-200 bg-white object-contain p-2" />}
              <label className={labelClass}>Description <span className="font-normal text-gray-500">(optional)</span><textarea maxLength="1000" rows="3" value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} className={fieldClass} /></label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={busy} className="w-fit rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50">{busy ? 'Saving…' : editingCategoryId ? 'Save category' : 'Create category'}</button>
                {editingCategoryId && <button type="button" onClick={cancelEditCategory} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"><X size={15} />Cancel</button>}
              </div>
            </form>
            <ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {categories.map((category) => {
                const productCount = products.filter((product) => product.categoryId === category.id).length
                return (
                  <li key={category.id} className="flex items-center gap-3 py-3">
                    {category.imageUrl
                      ? <img src={category.imageUrl} alt="" className="h-12 w-12 shrink-0 border border-gray-200 bg-white object-contain p-1" />
                      : <div className="h-12 w-12 shrink-0 border border-gray-200 bg-gray-50" aria-hidden="true" />}
                    <div className="min-w-0 flex-1">
                      <Link to={`/catalog?categoryId=${category.id}`} className="block truncate text-sm font-medium text-gray-800 underline-offset-2 hover:underline">{category.name}</Link>
                      <p className="text-xs text-gray-500">{productCount} products</p>
                    </div>
                    <button type="button" onClick={() => beginEditCategory(category)} title={`Edit ${category.name}`} aria-label={`Edit ${category.name}`} className="p-2 text-gray-500 hover:text-gray-950"><Pencil size={16} /></button>
                    <button type="button" onClick={() => handleDeleteCategory(category)} disabled={busy || productCount > 0} title={productCount > 0 ? 'Move or delete products in this category first' : `Delete ${category.name}`} aria-label={`Delete ${category.name}`} className="p-2 text-gray-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={16} /></button>
                  </li>
                )
              })}
              {categories.length === 0 && <li className="py-4 text-sm text-gray-500">Create a category before adding products.</li>}
            </ul>
          </section>

          <section aria-labelledby="product-heading" className="border-t border-gray-200 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="flex items-center gap-2">
              <PackagePlus size={18} aria-hidden="true" />
              <h2 id="product-heading" className="text-lg font-semibold text-gray-950">{editingProductId ? 'Edit product' : 'New product'}</h2>
            </div>
            <form onSubmit={handleCreateProduct} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>Product name<input required maxLength="200" value={productName} onChange={(event) => setProductName(event.target.value)} className={fieldClass} /></label>
              <label className={labelClass}>Category<select required value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className={fieldClass}><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className={labelClass}>Brand <span className="font-normal text-gray-500">(optional)</span><input maxLength="100" value={productBrand} onChange={(event) => setProductBrand(event.target.value)} placeholder="Type a brand name" className={fieldClass} /></label>
              <label className={labelClass}>Price ($)<input required type="number" min="0" step="0.01" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} className={fieldClass} /></label>
              {!editingProductId && <label className={labelClass}>Initial stock<input required type="number" min="0" max="100" value={initialStock} onChange={(event) => setInitialStock(event.target.value)} className={fieldClass} /></label>}
              {!editingProductId && Number(initialStock) > 0 && <label className={`${labelClass} sm:col-span-2`}>Warehouse<select required value={productWarehouse} onChange={(event) => setProductWarehouse(event.target.value)} className={fieldClass}><option value="">Choose warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label>}
              <label className={`${labelClass} sm:col-span-2`}>Image URL <span className="font-normal text-gray-500">(optional)</span><input type="url" maxLength="500" value={productImageUrl} onChange={(event) => setProductImageUrl(event.target.value)} className={fieldClass} /></label>
              <label className={`${labelClass} sm:col-span-2`}>Description <span className="font-normal text-gray-500">(optional)</span><textarea maxLength="5000" rows="3" value={productDescription} onChange={(event) => setProductDescription(event.target.value)} className={fieldClass} /></label>
              <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2"><input type="checkbox" checked={productActive} onChange={(event) => setProductActive(event.target.checked)} className="h-4 w-4 accent-gray-950" />Available in storefront</label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button type="submit" disabled={busy || categories.length === 0 || (!editingProductId && Number(initialStock) > 0 && warehouses.length === 0)} className="w-fit rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Saving…' : editingProductId ? 'Save changes' : 'Create product'}</button>
                {editingProductId && <button type="button" onClick={resetProductForm} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"><X size={15} />Cancel</button>}
              </div>
            </form>
          </section>
          <section aria-labelledby="manage-products-heading" className="border-t border-gray-200 pt-7 lg:col-span-2">
            <h2 id="manage-products-heading" className="text-lg font-semibold text-gray-950">Manage products</h2>
            {products.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead><tr className="border-y border-gray-200 text-xs uppercase text-gray-500"><th className="py-3 pr-4 font-medium">Product</th><th className="py-3 pr-4 font-medium">Category</th><th className="py-3 pr-4 font-medium">Brand</th><th className="py-3 pr-4 text-right font-medium">Price</th><th className="py-3 pr-4 text-right font-medium">Stock</th><th className="py-3 pr-4 font-medium">Status</th><th className="py-3 text-right font-medium">Actions</th></tr></thead>
                  <tbody>{products.map((product) => <tr key={product._id} className="border-b border-gray-100"><td className="py-3 pr-4 font-medium text-gray-900">{product.name}</td><td className="py-3 pr-4 text-gray-600">{product.categoryName}</td><td className="py-3 pr-4 text-gray-600">{product.brandName || '—'}</td><td className="py-3 pr-4 text-right text-gray-900">{Number(product.price).toFixed(2)}</td><td className="py-3 pr-4 text-right text-gray-900">{stock[product._id] ?? '—'}</td><td className="py-3 pr-4"><span className={product.active ? 'text-green-700' : 'text-gray-500'}>{product.active ? 'Active' : 'Archived'}</span></td><td className="py-2 text-right"><button type="button" onClick={() => beginEditProduct(product)} title={`Edit ${product.name}`} aria-label={`Edit ${product.name}`} className="p-2 text-gray-500 hover:text-gray-950"><Pencil size={16} /></button>{product.active && <button type="button" onClick={() => handleDeleteProduct(product)} disabled={busy} title={`Archive ${product.name}`} aria-label={`Archive ${product.name}`} className="p-2 text-gray-500 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-30"><Archive size={16} /></button>}<button type="button" onClick={() => handleDeleteProductPermanently(product)} disabled={busy} title={`Permanently delete ${product.name}`} aria-label={`Permanently delete ${product.name}`} className="p-2 text-gray-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={16} /></button></td></tr>)}</tbody>
                </table>
              </div>
            ) : <p className="mt-3 text-sm text-gray-500">No products to manage yet.</p>}
          </section>
        </div>
      ) : (
        <div className="grid gap-10 py-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-labelledby="stock-heading">
            <h2 id="stock-heading" className="text-lg font-semibold text-gray-950">Available stock</h2>
            {products.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                  <thead><tr className="border-y border-gray-200 text-xs uppercase text-gray-500"><th className="py-3 pr-4 font-medium">Product</th><th className="py-3 pr-4 font-medium">Category</th><th className="py-3 text-right font-medium">Available</th></tr></thead>
                  <tbody>{products.map((product) => <tr key={product._id} className="border-b border-gray-100"><td className="py-3 pr-4 font-medium text-gray-900">{product.name}</td><td className="py-3 pr-4 text-gray-600">{product.categoryName}</td><td className="py-3 text-right text-gray-900">{stock[product._id] ?? '—'}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <p className="mt-4 text-sm text-gray-500">No products yet. Create one in the Products tab.</p>}
          </section>

          <section aria-labelledby="restock-heading" className="border-t border-gray-200 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <h2 id="restock-heading" className="text-lg font-semibold text-gray-950">Add stock</h2>
            <form onSubmit={handleAddStock} className="mt-5 grid gap-4">
              <label className={labelClass}>Product<select required value={stockProduct} onChange={(event) => setStockProduct(event.target.value)} className={fieldClass}><option value="">Choose product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}</select></label>
              <label className={labelClass}>Warehouse<select required value={stockWarehouse} onChange={(event) => setStockWarehouse(event.target.value)} className={fieldClass}><option value="">Choose warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label>
              <label className={labelClass}>Quantity<input required type="number" min="1" max="100" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} className={fieldClass} /></label>
              <button type="submit" disabled={busy || products.length === 0 || warehouses.length === 0} className="w-fit rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Adding…' : 'Add units'}</button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default AdminPage