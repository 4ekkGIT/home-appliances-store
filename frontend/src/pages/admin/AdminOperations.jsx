import { useEffect, useState } from 'react'
import { Archive, Check, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import {
  createBrand,
  createCategoryAttribute,
  createWarehouse,
  deleteBrand,
  deleteCategoryAttribute,
  deleteWarehouse,
  getAdminOrders,
  getBrands,
  getCategoryAttributes,
  getInventoryUnits,
  getProductImages,
  getUnitMovements,
  getWarehouses,
  replaceProductImages,
  setAvailableStock,
  transferInventoryUnit,
  updateBrand,
  updateCategoryAttribute,
  updateInventoryUnitStatus,
  updateOrderStatus,
  updateWarehouse,
  uploadProductImage,
} from '../../api/client'

const fieldClass = 'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700'
const labelClass = 'block text-sm font-medium text-gray-800'
const buttonClass = 'inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50'
const primaryClass = 'inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50'

const emptyAttribute = { name: '', dataType: 'TEXT', unit: '', options: '', required: false, filterable: false, displayOrder: '0' }
const nextOrderStatuses = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}
const unitTransitions = {
  AVAILABLE: ['RESERVED', 'DAMAGED', 'RETURNED', 'WRITTEN_OFF'],
  RESERVED: ['AVAILABLE', 'SOLD', 'DAMAGED', 'WRITTEN_OFF'],
  SOLD: [],
  DAMAGED: ['AVAILABLE', 'RETURNED', 'WRITTEN_OFF'],
  RETURNED: ['AVAILABLE', 'DAMAGED', 'WRITTEN_OFF'],
  WRITTEN_OFF: [],
}

const AdminOperations = ({ section, categories, products, onRefresh }) => {
  const [brands, setBrands] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [units, setUnits] = useState([])
  const [orders, setOrders] = useState([])
  const [attributes, setAttributes] = useState([])
  const [images, setImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [draggingImages, setDraggingImages] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [movements, setMovements] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [revision, setRevision] = useState(0)
  const [brandId, setBrandId] = useState('')
  const [brandName, setBrandName] = useState('')
  const [brandLogo, setBrandLogo] = useState('')
  const [attributeId, setAttributeId] = useState('')
  const [attributeForm, setAttributeForm] = useState(emptyAttribute)
  const [warehouseId, setWarehouseId] = useState('')
  const [warehouseName, setWarehouseName] = useState('')
  const [warehouseAddress, setWarehouseAddress] = useState('')
  const [warehouseActive, setWarehouseActive] = useState(true)
  const [stockProduct, setStockProduct] = useState('')
  const [stockWarehouse, setStockWarehouse] = useState('')
  const [stockTarget, setStockTarget] = useState('')
  const [transferWarehouse, setTransferWarehouse] = useState('')
  const [unitStatusDrafts, setUnitStatusDrafts] = useState({})

  useEffect(() => {
    let active = true
    Promise.all([getBrands(), getWarehouses(), getInventoryUnits()])
      .then(async ([brandList, warehouseList, unitList]) => {
        const orderList = section === 'orders' ? await getAdminOrders() : []
        if (!active) return
        setBrands(brandList)
        setWarehouses(warehouseList)
        setUnits(unitList)
        setOrders(orderList)
        setSelectedCategory((value) => value || String(categories[0]?.id || ''))
        setSelectedProduct((value) => value || String(products[0]?._id || ''))
        setSelectedUnit((value) => value || String(unitList[0]?.id || ''))
        setStockProduct((value) => value || String(products[0]?._id || ''))
        setStockWarehouse((value) => value || String(warehouseList.find((item) => item.active)?.id || ''))
        setTransferWarehouse((value) => value || String(warehouseList.find((item) => item.active)?.id || ''))
        const defaultProduct = Number(products[0]?._id)
        const defaultWarehouse = Number(warehouseList.find((item) => item.active)?.id)
        setStockTarget(String(unitList.filter((unit) => unit.productId === defaultProduct
          && unit.warehouseId === defaultWarehouse && unit.status === 'AVAILABLE').length))
        setError('')
      })
      .catch((requestError) => { if (active) setError(requestError.message) })
    return () => { active = false }
  }, [section, revision, categories, products])

  useEffect(() => {
    if (!selectedCategory || section !== 'attributes') return
    getCategoryAttributes(selectedCategory)
      .then(setAttributes)
      .catch((requestError) => setError(requestError.message))
  }, [section, selectedCategory, revision])

  useEffect(() => {
    if (!selectedProduct || section !== 'images') return
    getProductImages(selectedProduct)
      .then((items) => setImages(items.map((item) => ({ ...item }))))
      .catch((requestError) => setError(requestError.message))
  }, [section, selectedProduct, revision])

  useEffect(() => {
    if (!selectedUnit || section !== 'inventory') return
    getUnitMovements(selectedUnit)
      .then(setMovements)
      .catch((requestError) => setError(requestError.message))
  }, [section, selectedUnit, revision])

  const run = async (action, successMessage) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(successMessage)
      setRevision((value) => value + 1)
      onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const resetBrand = () => { setBrandId(''); setBrandName(''); setBrandLogo('') }
  const resetWarehouse = () => { setWarehouseId(''); setWarehouseName(''); setWarehouseAddress(''); setWarehouseActive(true) }
  const resetAttribute = () => { setAttributeId(''); setAttributeForm(emptyAttribute) }

  const saveBrand = (event) => {
    event.preventDefault()
    const body = { name: brandName.trim(), slug: brandName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), logoUrl: brandLogo.trim() || null }
    run(async () => {
      if (brandId) await updateBrand(brandId, body)
      else await createBrand(body)
      resetBrand()
    }, `Brand ${brandId ? 'updated' : 'created'}.`)
  }

  const saveAttribute = (event) => {
    event.preventDefault()
    const body = {
      ...attributeForm,
      slug: attributeForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      unit: attributeForm.unit.trim() || null,
      options: attributeForm.dataType === 'SELECT' ? attributeForm.options.split(',').map((item) => item.trim()).filter(Boolean) : [],
      displayOrder: Number(attributeForm.displayOrder),
    }
    run(async () => {
      if (attributeId) await updateCategoryAttribute(selectedCategory, attributeId, body)
      else await createCategoryAttribute(selectedCategory, body)
      resetAttribute()
    }, `Specification ${attributeId ? 'updated' : 'created'}.`)
  }

  const saveWarehouse = (event) => {
    event.preventDefault()
    const body = { name: warehouseName.trim(), address: warehouseAddress.trim(), active: warehouseActive }
    run(async () => {
      if (warehouseId) await updateWarehouse(warehouseId, body)
      else await createWarehouse(body)
      resetWarehouse()
    }, `Warehouse ${warehouseId ? 'updated' : 'created'}.`)
  }

  const saveImages = (event) => {
    event.preventDefault()
    const normalized = images.filter((image) => image.imageUrl.trim()).map((image, index) => ({
      imageUrl: image.imageUrl.trim(),
      altText: image.altText?.trim() || products.find((item) => item._id === selectedProduct)?.name || '',
      displayOrder: index,
      primary: Boolean(image.primary),
    }))
    if (normalized.length && !normalized.some((image) => image.primary)) normalized[0].primary = true
    run(() => replaceProductImages(selectedProduct, normalized), 'Product gallery saved.')
  }

  const uploadImages = async (fileList) => {
    const files = Array.from(fileList)
    if (!selectedProduct || files.length === 0) return
    setUploadingImages(true)
    setError('')
    setNotice('')
    const uploadErrors = []
    let uploadedCount = 0
    for (const [index, file] of files.entries()) {
      if (file.size > 10 * 1024 * 1024) {
        uploadErrors.push(`${file.name}: file exceeds 10 MB`)
        continue
      }
      setUploadProgress(`Uploading ${index + 1} of ${files.length}…`)
      try {
        const uploaded = await uploadProductImage(selectedProduct, file)
        setImages((current) => [...current, uploaded])
        uploadedCount += 1
      } catch (requestError) {
        uploadErrors.push(`${file.name}: ${requestError.message}`)
      }
    }
    setUploadProgress('')
    setUploadingImages(false)
    if (uploadedCount > 0) setNotice(`Uploaded ${uploadedCount} image${uploadedCount === 1 ? '' : 's'} to the product gallery.`)
    if (uploadErrors.length > 0) setError(uploadErrors.join(' '))
  }

  const submitStock = (event) => {
    event.preventDefault()
    run(() => setAvailableStock({ productId: Number(stockProduct), warehouseId: Number(stockWarehouse), availableQuantity: Number(stockTarget) }), 'Available stock adjusted.')
  }

  const sectionTitles = {
    brands: 'Brands',
    attributes: 'Category specifications',
    images: 'Product images',
    warehouses: 'Warehouses',
    inventory: 'Inventory units and movements',
    orders: 'Orders',
  }

  return (
    <section className="py-7" aria-labelledby="operations-heading">
      <h2 id="operations-heading" className="text-lg font-semibold text-gray-950">{sectionTitles[section]}</h2>
      {error && <p role="alert" className="mt-4 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-4 border-l-2 border-green-700 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}

      {section === 'brands' && <div className="mt-5 grid gap-8 lg:grid-cols-[320px_1fr]">
        <form onSubmit={saveBrand} className="grid content-start gap-4">
          <label className={labelClass}>Brand name<input required maxLength="100" value={brandName} onChange={(event) => setBrandName(event.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Logo URL <span className="font-normal text-gray-500">(optional)</span><input type="url" maxLength="500" value={brandLogo} onChange={(event) => setBrandLogo(event.target.value)} className={fieldClass} /></label>
          <div className="flex gap-2"><button className={primaryClass} disabled={busy}><Save size={16} />{brandId ? 'Save brand' : 'Create brand'}</button>{brandId && <button type="button" className={buttonClass} onClick={resetBrand}><X size={16} />Cancel</button>}</div>
        </form>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {brands.map((brand) => <div key={brand.id} className="flex items-center gap-3 py-3">
            {brand.logoUrl ? <img src={brand.logoUrl} alt="" className="h-10 w-10 object-contain" /> : <div className="h-10 w-10 bg-gray-100" />}
            <span className="min-w-0 flex-1 text-sm font-medium">{brand.name}</span>
            <button type="button" title={`Edit ${brand.name}`} aria-label={`Edit ${brand.name}`} className="p-2 text-gray-500 hover:text-gray-950" onClick={() => { setBrandId(String(brand.id)); setBrandName(brand.name); setBrandLogo(brand.logoUrl || '') }}><Pencil size={16} /></button>
            <button type="button" title={`Delete ${brand.name}`} aria-label={`Delete ${brand.name}`} className="p-2 text-gray-500 hover:text-red-700" onClick={() => window.confirm(`Delete brand “${brand.name}”?`) && run(() => deleteBrand(brand.id), 'Brand deleted.')}><Trash2 size={16} /></button>
          </div>)}
          {!brands.length && <p className="py-4 text-sm text-gray-500">No brands yet.</p>}
        </div>
      </div>}

      {section === 'attributes' && <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
        <div>
          <label className={labelClass}>Category<select value={selectedCategory} onChange={(event) => { setSelectedCategory(event.target.value); resetAttribute() }} className={fieldClass}><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <form onSubmit={saveAttribute} className="mt-4 grid gap-4">
            <label className={labelClass}>Specification name<input required maxLength="100" value={attributeForm.name} onChange={(event) => setAttributeForm({ ...attributeForm, name: event.target.value })} className={fieldClass} /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className={labelClass}>Type<select value={attributeForm.dataType} onChange={(event) => setAttributeForm({ ...attributeForm, dataType: event.target.value })} className={fieldClass}>{['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT'].map((type) => <option key={type}>{type}</option>)}</select></label><label className={labelClass}>Unit<input maxLength="30" value={attributeForm.unit} onChange={(event) => setAttributeForm({ ...attributeForm, unit: event.target.value })} placeholder="cm, kg, W" className={fieldClass} /></label></div>
            {attributeForm.dataType === 'SELECT' && <label className={labelClass}>Options, comma-separated<input required value={attributeForm.options} onChange={(event) => setAttributeForm({ ...attributeForm, options: event.target.value })} className={fieldClass} /></label>}
            <label className={labelClass}>Display order<input type="number" min="0" value={attributeForm.displayOrder} onChange={(event) => setAttributeForm({ ...attributeForm, displayOrder: event.target.value })} className={fieldClass} /></label>
            <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={attributeForm.required} onChange={(event) => setAttributeForm({ ...attributeForm, required: event.target.checked })} />Required</label><label className="flex items-center gap-2"><input type="checkbox" checked={attributeForm.filterable} onChange={(event) => setAttributeForm({ ...attributeForm, filterable: event.target.checked })} />Filterable</label></div>
            <div className="flex gap-2"><button disabled={busy || !selectedCategory} className={primaryClass}><Save size={16} />{attributeId ? 'Save specification' : 'Add specification'}</button>{attributeId && <button type="button" className={buttonClass} onClick={resetAttribute}><X size={16} />Cancel</button>}</div>
          </form>
        </div>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {attributes.map((attribute) => <div key={attribute.id} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{attribute.name}{attribute.unit ? ` (${attribute.unit})` : ''}</p><p className="text-xs text-gray-500">{attribute.dataType}{attribute.required ? ' · required' : ''}{attribute.filterable ? ' · filterable' : ''}</p></div><button type="button" title={`Edit ${attribute.name}`} aria-label={`Edit ${attribute.name}`} className="p-2 text-gray-500 hover:text-gray-950" onClick={() => { setAttributeId(String(attribute.id)); setAttributeForm({ name: attribute.name, dataType: attribute.dataType, unit: attribute.unit || '', options: (attribute.options || []).join(', '), required: attribute.required, filterable: attribute.filterable, displayOrder: String(attribute.displayOrder) }) }}><Pencil size={16} /></button><button type="button" title={`Delete ${attribute.name}`} aria-label={`Delete ${attribute.name}`} className="p-2 text-gray-500 hover:text-red-700" onClick={() => window.confirm(`Delete specification “${attribute.name}”?`) && run(() => deleteCategoryAttribute(selectedCategory, attribute.id), 'Specification deleted.')}><Trash2 size={16} /></button></div>)}
          {selectedCategory && !attributes.length && <p className="py-4 text-sm text-gray-500">No specifications for this category.</p>}
        </div>
      </div>}

      {section === 'images' && <div className="mt-5 max-w-3xl">
        <label className={labelClass}>Product<select disabled={uploadingImages} value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} className={fieldClass}><option value="">Choose product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}</select></label>
        <div
          onDragOver={(event) => { event.preventDefault(); setDraggingImages(true) }}
          onDragLeave={() => setDraggingImages(false)}
          onDrop={(event) => { event.preventDefault(); setDraggingImages(false); uploadImages(event.dataTransfer.files) }}
          className={`mt-5 flex min-h-36 flex-col items-center justify-center border border-dashed px-5 py-6 text-center transition-colors ${draggingImages ? 'border-gray-950 bg-gray-100' : 'border-gray-300 bg-gray-50'} ${!selectedProduct || uploadingImages ? 'opacity-60' : ''}`}
        >
          <Upload size={20} aria-hidden="true" className="text-gray-600" />
          <p className="mt-2 text-sm font-medium text-gray-800">{uploadProgress || 'Drop images here or choose files'}</p>
          <label htmlFor="admin-product-image-upload" className={`mt-3 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 ${!selectedProduct || uploadingImages ? 'pointer-events-none' : ''}`}>
            Choose images
          </label>
          <input
            id="admin-product-image-upload"
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            disabled={!selectedProduct || uploadingImages}
            onChange={(event) => { uploadImages(event.target.files); event.target.value = '' }}
            className="sr-only"
          />
          <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF, WebP · up to 10 MB each</p>
        </div>
        <form onSubmit={saveImages} className="mt-5">
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {images.map((image, index) => <div key={`${image.id || index}`} className="grid gap-3 py-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
              {image.imageUrl ? <img src={image.imageUrl} alt={image.altText || ''} className="h-[72px] w-[72px] border border-gray-200 object-contain" /> : <div className="h-[72px] w-[72px] bg-gray-100" />}
              <div className="grid gap-2"><input required type="url" aria-label="Image URL" value={image.imageUrl} onChange={(event) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, imageUrl: event.target.value } : item))} placeholder="https://..." className={fieldClass} /><input aria-label="Alt text" value={image.altText || ''} onChange={(event) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, altText: event.target.value } : item))} placeholder="Image description" className={fieldClass} /></div>
              <div className="flex items-center justify-between gap-3 sm:flex-col"><label className="flex items-center gap-2 text-xs text-gray-600"><input type="radio" name="primary-image" checked={Boolean(image.primary)} onChange={() => setImages((current) => current.map((item, itemIndex) => ({ ...item, primary: itemIndex === index })))} />Primary</label><button type="button" aria-label="Remove image" className="p-2 text-gray-500 hover:text-red-700" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button></div>
            </div>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" className={buttonClass} onClick={() => setImages((current) => [...current, { imageUrl: '', altText: '', displayOrder: current.length, primary: current.length === 0 }])}><Plus size={16} />Add image URL</button><button disabled={busy || uploadingImages || !selectedProduct} className={primaryClass}><Save size={16} />Save gallery</button></div>
        </form>
      </div>}

      {section === 'warehouses' && <div className="mt-5 grid gap-8 lg:grid-cols-[320px_1fr]">
        <form onSubmit={saveWarehouse} className="grid content-start gap-4">
          <label className={labelClass}>Warehouse name<input required maxLength="150" value={warehouseName} onChange={(event) => setWarehouseName(event.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Address<textarea maxLength="5000" rows="3" value={warehouseAddress} onChange={(event) => setWarehouseAddress(event.target.value)} className={fieldClass} /></label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={warehouseActive} onChange={(event) => setWarehouseActive(event.target.checked)} />Active</label>
          <div className="flex gap-2"><button className={primaryClass} disabled={busy}><Save size={16} />{warehouseId ? 'Save warehouse' : 'Create warehouse'}</button>{warehouseId && <button type="button" className={buttonClass} onClick={resetWarehouse}><X size={16} />Cancel</button>}</div>
        </form>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {warehouses.map((warehouse) => <div key={warehouse.id} className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{warehouse.name}</p><p className="text-xs text-gray-500">{warehouse.address || 'No address'} · {warehouse.active ? 'Active' : 'Inactive'}</p></div><button type="button" title={`Edit ${warehouse.name}`} aria-label={`Edit ${warehouse.name}`} className="p-2 text-gray-500 hover:text-gray-950" onClick={() => { setWarehouseId(String(warehouse.id)); setWarehouseName(warehouse.name); setWarehouseAddress(warehouse.address || ''); setWarehouseActive(warehouse.active) }}><Pencil size={16} /></button><button type="button" title={`Delete ${warehouse.name}`} aria-label={`Delete ${warehouse.name}`} className="p-2 text-gray-500 hover:text-red-700" onClick={() => window.confirm(`Delete warehouse “${warehouse.name}”?`) && run(() => deleteWarehouse(warehouse.id), 'Warehouse deleted.')}><Trash2 size={16} /></button></div>)}
          {!warehouses.length && <p className="py-4 text-sm text-gray-500">No warehouses yet.</p>}
        </div>
      </div>}

      {section === 'inventory' && <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <div>
          <form onSubmit={submitStock} className="grid gap-3 border-b border-gray-200 pb-5 sm:grid-cols-4 sm:items-end">
            <label className={labelClass}>Product<select required value={stockProduct} onChange={(event) => { setStockProduct(event.target.value); setStockTarget(String(units.filter((unit) => unit.productId === Number(event.target.value) && unit.warehouseId === Number(stockWarehouse) && unit.status === 'AVAILABLE').length)) }} className={fieldClass}><option value="">Choose</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}</select></label>
            <label className={labelClass}>Warehouse<select required value={stockWarehouse} onChange={(event) => { setStockWarehouse(event.target.value); setStockTarget(String(units.filter((unit) => unit.productId === Number(stockProduct) && unit.warehouseId === Number(event.target.value) && unit.status === 'AVAILABLE').length)) }} className={fieldClass}><option value="">Choose</option>{warehouses.filter((item) => item.active).map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label>
            <label className={labelClass}>Target available<input required type="number" min="0" max="10000" value={stockTarget} onChange={(event) => setStockTarget(event.target.value)} className={fieldClass} /></label>
            <button disabled={busy || !stockProduct || !stockWarehouse} className={primaryClass}><Check size={16} />Set quantity</button>
          </form>
          <div className="mt-5 max-h-[480px] overflow-auto">
            <table className="w-full min-w-[650px] border-collapse text-left text-sm"><thead className="sticky top-0 bg-white"><tr className="border-y border-gray-200 text-xs uppercase text-gray-500"><th className="py-3 pr-3">Code</th><th className="py-3 pr-3">Product</th><th className="py-3 pr-3">Warehouse</th><th className="py-3 pr-3">Status</th><th className="py-3 text-right">History</th></tr></thead><tbody>{units.map((unit) => <tr key={unit.id} className={`border-b border-gray-100 ${String(unit.id) === selectedUnit ? 'bg-gray-50' : ''}`}><td className="py-2.5 pr-3 font-mono text-xs">{unit.inventoryCode}</td><td className="py-2.5 pr-3">{products.find((item) => Number(item._id) === unit.productId)?.name || `#${unit.productId}`}</td><td className="py-2.5 pr-3">{warehouses.find((item) => item.id === unit.warehouseId)?.name || '—'}</td><td className="py-2.5 pr-3">{unit.status}</td><td className="py-2 text-right"><button type="button" className="p-2 text-gray-600 hover:text-gray-950" title="View movement history" aria-label={`View history for ${unit.inventoryCode}`} onClick={() => setSelectedUnit(String(unit.id))}><Archive size={16} /></button></td></tr>)}</tbody></table>
            {!units.length && <p className="py-5 text-sm text-gray-500">No inventory units registered.</p>}
          </div>
        </div>
        <aside className="border-t border-gray-200 pt-5 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
          {(() => {
            const unit = units.find((item) => String(item.id) === selectedUnit)
            if (!unit) return <p className="text-sm text-gray-500">Select an inventory unit to inspect its history.</p>
            return <>
              <h3 className="text-sm font-semibold text-gray-950">{unit.inventoryCode}</h3>
              <p className="mt-1 text-xs text-gray-500">{products.find((item) => Number(item._id) === unit.productId)?.name || `Product #${unit.productId}`} · {unit.status}</p>
              <div className="mt-4 grid gap-3"><label className={labelClass}>Transfer to<select value={transferWarehouse} onChange={(event) => setTransferWarehouse(event.target.value)} className={fieldClass}><option value="">Choose warehouse</option>{warehouses.filter((item) => item.active && item.id !== unit.warehouseId).map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label><button type="button" disabled={busy || !transferWarehouse} className={buttonClass} onClick={() => run(() => transferInventoryUnit(unit.id, { toWarehouseId: Number(transferWarehouse), comment: 'Admin warehouse transfer' }), 'Unit transferred.')}><Archive size={15} />Transfer unit</button>
                <label className={labelClass}>Change status<select value={unitStatusDrafts[unit.id] || unit.status} onChange={(event) => setUnitStatusDrafts((current) => ({ ...current, [unit.id]: event.target.value }))} className={fieldClass}><option value={unit.status}>{unit.status}</option>{unitTransitions[unit.status]?.map((status) => <option key={status}>{status}</option>)}</select></label><button type="button" disabled={busy || !unitStatusDrafts[unit.id] || unitStatusDrafts[unit.id] === unit.status} className={buttonClass} onClick={() => run(async () => { await updateInventoryUnitStatus(unit.id, { status: unitStatusDrafts[unit.id], comment: 'Admin status update' }); setUnitStatusDrafts((current) => { const next = { ...current }; delete next[unit.id]; return next }) }, 'Unit status updated.')}><Check size={15} />Update status</button></div>
              <h4 className="mt-7 border-b border-gray-200 pb-2 text-sm font-semibold">Movement history</h4>
              <ol className="mt-3 max-h-[320px] space-y-3 overflow-auto">{movements.map((movement) => <li key={movement.id} className="border-l-2 border-gray-300 pl-3"><p className="text-xs font-medium text-gray-800">{movement.movementType}: {movement.previousStatus || 'NEW'} → {movement.newStatus || '—'}</p><p className="mt-0.5 text-xs text-gray-500">{movement.comment || '—'} · {new Date(movement.createdAt).toLocaleString()}</p></li>)}{!movements.length && <li className="text-xs text-gray-500">No movements recorded.</li>}</ol>
            </>
          })()}
        </aside>
      </div>}

      {section === 'orders' && <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm"><thead><tr className="border-y border-gray-200 text-xs uppercase text-gray-500"><th className="py-3 pr-4">Order</th><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Items</th><th className="py-3 pr-4 text-right">Total</th><th className="py-3 pr-4">Shipping</th><th className="py-3 pr-4">Date</th><th className="py-3">Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-gray-100 align-top"><td className="py-3 pr-4 font-medium">#{order.id}</td><td className="py-3 pr-4">{order.customerEmail}</td><td className="py-3 pr-4">{order.items.map((item, index) => <div key={`${item.productId ?? 'deleted'}-${item.productName}-${index}`}>{item.productName} × {item.quantity}</div>)}</td><td className="py-3 pr-4 text-right">${Number(order.totalAmount).toFixed(2)}</td><td className="py-3 pr-4">{order.shippingAddress?.contactName}<br />{order.shippingAddress?.street} {order.shippingAddress?.building}<br />{order.shippingAddress?.city}, {order.shippingAddress?.country}</td><td className="py-3 pr-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td><td className="py-3"><select aria-label={`Status for order ${order.id}`} value={order.status} disabled={busy || !nextOrderStatuses[order.status]?.length} onChange={(event) => run(() => updateOrderStatus(order.id, event.target.value), `Order #${order.id} updated.`)} className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs"><option>{order.status}</option>{nextOrderStatuses[order.status]?.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>
        {!orders.length && <p className="py-5 text-sm text-gray-500">No orders yet.</p>}
      </div>}
    </section>
  )
}

export default AdminOperations