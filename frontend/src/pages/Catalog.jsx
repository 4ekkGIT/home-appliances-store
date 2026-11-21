import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts } from '../api/client'
import ProductItem from '../components/ProductItem'
import { ShopContext } from '../context/ShopContext'

const PAGE_SIZE = 12

const Catalog = () => {
  const { highestPrice, categories, brands, catalogLoading, catalogError, currency } =
    useContext(ShopContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [pageInfo, setPageInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [retry, setRetry] = useState(0)
  const query = searchParams.get('query') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const brandId = searchParams.get('brandId') || ''

  const sort = useMemo(() => {
    if (sortBy === 'price-low') return { sortBy: 'price', sortDirection: 'ASC' }
    if (sortBy === 'price-high') return { sortBy: 'price', sortDirection: 'DESC' }
    if (sortBy === 'name') return { sortBy: 'name', sortDirection: 'ASC' }
    return { sortBy: 'createdAt', sortDirection: 'DESC' }
  }, [sortBy])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const pageResult = await getProducts({
          q: query.trim(),
          categoryId,
          brandId,
          maxPrice: maxPrice === '' ? undefined : maxPrice,
          active: true,
          page,
          size: PAGE_SIZE,
          ...sort,
        })
        if (active) {
          setResults(pageResult.content)
          setPageInfo(pageResult)
        }
      } catch (requestError) {
        if (active) setError(requestError.message)
      } finally {
        if (active) setLoading(false)
      }
    }, query ? 250 : 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query, categoryId, brandId, maxPrice, page, sort, retry])

  const updateFilter = (key, value) => {
    setPage(0)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  const clearFilters = (includeQuery = false) => {
    setMaxPrice('')
    setPage(0)
    const next = new URLSearchParams()
    if (query && !includeQuery) next.set('query', query)
    setSearchParams(next, { replace: true })
  }

  const activeFilters = Boolean(categoryId || brandId || maxPrice !== '')
  const selectedCategory = categories.find((category) => String(category.id) === categoryId)

  return (
    <main className="mx-auto max-w-[1440px] pb-16 pt-6 sm:pt-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="transition-colors hover:text-gray-900">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900">Catalog</span>
      </nav>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-950">
              {loading ? '…' : pageInfo?.totalElements ?? 0}
            </span>{' '}
            products{query && <span> for “{query}”</span>}
          </div>
          <label className="relative w-full sm:max-w-xs">
            <span className="sr-only">Search catalog</span>
            <input
              type="search"
              value={query}
              onChange={(event) => updateFilter('query', event.target.value)}
              aria-label="Search catalog"
              placeholder="Search this catalog"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500"
            />
          </label>
        </div>
        <span className="text-sm text-gray-500">
          {selectedCategory?.name || 'All categories'}
        </span>
      </div>

      {catalogError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Category and brand filters could not be loaded: {catalogError}
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-2" aria-label="Shop by category">
        <button
          type="button"
          onClick={() => updateFilter('categoryId', '')}
          aria-pressed={!categoryId}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            !categoryId ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
          }`}
        >
          All products
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => updateFilter('categoryId', String(category.id))}
            aria-pressed={categoryId === String(category.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              categoryId === String(category.id) ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 border-y border-gray-200 py-4">
        <label className="flex items-center gap-2 text-sm text-gray-500">
          <span>Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => {
              setPage(0)
              setSortBy(event.target.value)
            }}
            aria-label="Sort products"
            className="max-w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-gray-500"
          >
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-950">Filters</h2>
            {activeFilters && (
              <button type="button" onClick={clearFilters} className="text-xs font-medium text-gray-500 underline">
                Clear all
              </button>
            )}
          </div>

          <label className="block text-sm font-semibold text-gray-800" htmlFor="brand-filter">
            Brand
          </label>
          <select
            id="brand-filter"
            value={brandId}
            onChange={(event) => updateFilter('brandId', event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>

          <fieldset className="mt-6 border-t border-gray-100 pt-5">
            <legend className="mb-3 text-sm font-semibold text-gray-800">Maximum price</legend>
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>{currency}0</span>
              <span className="font-semibold text-gray-900">{currency}{maxPrice || highestPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max={highestPrice || 1}
              value={maxPrice === '' ? highestPrice : Math.min(Number(maxPrice), highestPrice || 1)}
              onChange={(event) => {
                setPage(0)
                setMaxPrice(event.target.value)
              }}
              aria-label="Maximum price"
              className="h-1.5 w-full cursor-pointer accent-gray-950"
            />
            {maxPrice !== '' && (
              <button type="button" onClick={() => setMaxPrice('')} className="mt-2 text-xs text-gray-500 underline">
                Reset price
              </button>
            )}
          </fieldset>
        </aside>

        <section aria-label="Products" className="min-w-0">
          {loading || catalogLoading ? (
            <p role="status" className="flex min-h-72 items-center justify-center text-sm text-gray-500">
              Loading products…
            </p>
          ) : error ? (
            <div role="alert" className="flex min-h-72 flex-col items-center justify-center text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 underline">
                Try again
              </button>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {results.map((product) => (
                  <ProductItem
                    key={product._id}
                    id={product._id}
                    image={product.image}
                    name={product.name}
                    price={product.price}
                    category={product.category}
                  />
                ))}
              </div>
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={pageInfo?.first}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {(pageInfo?.page ?? page) + 1} of {Math.max(pageInfo?.totalPages ?? 1, 1)}
                </span>
                <button
                  type="button"
                  disabled={pageInfo?.last}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">No products found</h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Try another search or clear your filters to see the full collection.
              </p>
              <button
                type="button"
                onClick={() => clearFilters(true)}
                className="mt-5 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Catalog
