import { useContext, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductItem from '../components/ProductItem'
import { ShopContext } from '../context/ShopContext'
import Fuse from 'fuse.js'



const Catalog = () => {
  const { products, currency } = useContext(ShopContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') ?? '')
  const [selectedSubCategory, setSelectedSubCategory] = useState(() => searchParams.get('subCategory') ?? '')
  const [bestSellerOnly, setBestSellerOnly] = useState(() => searchParams.get('bestSeller') === 'true')
  const [sortBy, setSortBy] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(() =>
    Math.ceil(Math.max(...products.map((product) => product.price))),
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const searchQuery = searchParams.get('query') ?? ''

  // fuzzy search
  const fuse = useMemo(
  () =>
    new Fuse(products, {
      keys: ['name', 'category', 'subCategory'],
      threshold: 0.4,
      ignoreLocation: true,
    }),
  [products],
)

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [products],
  )
  const subCategories = useMemo(
    () =>
      [...new Set(
        products
          .filter((product) => !selectedCategory || product.category === selectedCategory)
          .map((product) => product.subCategory),
      )],
    [products, selectedCategory],
  )
  const highestPrice = Math.ceil(Math.max(...products.map((product) => product.price)))

  
const visibleProducts = useMemo(() => {
  const query = searchQuery.trim()

  const matchingProducts = query
    ? fuse.search(query).map((result) => result.item)
    : products

  const filteredProducts = matchingProducts.filter((product) => {
    return (
      (!selectedCategory || product.category === selectedCategory) &&
      (!selectedSubCategory || product.subCategory === selectedSubCategory) &&
      (!bestSellerOnly || product.bestSeller) &&
      product.price <= maxPrice
    )
  })

  if (sortBy === 'price-low') {
    return filteredProducts.sort((a, b) => a.price - b.price)
  }

  if (sortBy === 'price-high') {
    return filteredProducts.sort((a, b) => b.price - a.price)
  }

  if (sortBy === 'newest') {
    return filteredProducts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }

  return filteredProducts
}, [
  products,
  fuse,
  searchQuery,
  selectedCategory,
  selectedSubCategory,
  bestSellerOnly,
  maxPrice,
  sortBy,
])


  const activeFilters = Boolean(selectedCategory || selectedSubCategory || bestSellerOnly || maxPrice < highestPrice)

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedSubCategory('')
    setBestSellerOnly(false)
    setMaxPrice(highestPrice)
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.delete('category')
      nextParams.delete('subCategory')
      nextParams.delete('bestSeller')
      return nextParams
    }, { replace: true })
  }

  const chooseCategory = (category) => {
    setSelectedCategory(category)
    setSelectedSubCategory('')
  }

  const changeSearch = (event) => {
    const value = event.target.value
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      if (value) {
        nextParams.set('query', value)
      } else {
        nextParams.delete('query')
      }
      return nextParams
    }, { replace: true })
  }

  return (
    <main className="mx-auto max-w-[1440px] pb-16 pt-6 sm:pt-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="transition-colors hover:text-gray-900">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900">Catalog</span>
      </nav>

      {/* <section className="relative mb-7 overflow-hidden rounded-2xl bg-gray-950 px-6 py-8 text-white sm:mb-9 sm:px-10 sm:py-10">
        <div aria-hidden="true" className="absolute -right-8 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 right-1/4 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-300">The Nexora collection</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find your next favorite</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
            Smart tech and everyday essentials, all in one place. Browse the collection and find just what you need.
          </p>
        </div>
      </section> */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-950">{visibleProducts.length}</span>
            {' '}products
            {searchQuery && <span> for “{searchQuery}”</span>}
          </p>
          <label className="relative w-full sm:max-w-xs">
            <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="none">
              <circle cx="8.7" cy="8.7" r="5.7" stroke="currentColor" strokeWidth="1.4" />
              <path d="m13 13 3.8 3.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={changeSearch}
              aria-label="Search catalog"
              placeholder="Search this catalog"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500"
            />
          </label>
        </div>
        <span className="text-sm text-gray-500">{products.length} products to explore</span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2" aria-label="Shop by category">
        <button
          type="button"
          onClick={() => chooseCategory('')}
          aria-pressed={!selectedCategory}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            !selectedCategory
              ? 'border-gray-950 bg-gray-950 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-950'
          }`}
        >
          All products
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => chooseCategory(category)}
            aria-pressed={selectedCategory === category}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selectedCategory === category
                ? 'border-gray-950 bg-gray-950 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-950'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 border-y border-gray-200 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 lg:hidden"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M5.5 10h9m-6.5 5h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
            Filters{activeFilters ? ' •' : ''}
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hidden sm:inline">Sort by</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort products"
              className="max-w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-gray-500"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <aside
          id="catalog-filters"
          className={`${filtersOpen ? 'block' : 'hidden'} h-fit rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-6 lg:block`}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-950">Filters</h2>
            {activeFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-gray-500 underline underline-offset-2 transition hover:text-gray-950"
              >
                Clear all
              </button>
            )}
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-gray-800">Categories</legend>
            <div className="space-y-2.5">
              {categories.map((category) => {
                const count = products.filter((product) => product.category === category).length
                return (
                  <label key={category} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 hover:text-gray-950">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => chooseCategory(category)}
                      className="h-4 w-4 accent-gray-950"
                    />
                    <span className="flex-1">{category}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {subCategories.length > 0 && (
            <fieldset className="mt-6 border-t border-gray-100 pt-5">
              <legend className="mb-3 text-sm font-semibold text-gray-800">Product type</legend>
              <div className="space-y-2.5">
                {subCategories.map((subCategory) => (
                  <label key={subCategory} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 hover:text-gray-950">
                    <input
                      type="radio"
                      name="subCategory"
                      checked={selectedSubCategory === subCategory}
                      onChange={() => setSelectedSubCategory(subCategory)}
                      className="h-4 w-4 accent-gray-950"
                    />
                    <span>{subCategory}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="mt-6 border-t border-gray-100 pt-5">
            <legend className="mb-3 text-sm font-semibold text-gray-800">Maximum price</legend>
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>{currency}0</span>
              <span className="font-semibold text-gray-900">{currency}{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max={highestPrice}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              aria-label="Maximum price"
              className="h-1.5 w-full cursor-pointer accent-gray-950"
            />
          </fieldset>
        </aside>

        <section aria-label="Products" className="min-w-0">
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductItem
                  key={product._id}
                  id={product._id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  category={product.category}
                  bestSeller={product.bestSeller}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m16 16 4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-gray-900">No products found</h2>
              <p className="mt-1 max-w-sm text-sm text-gray-500">Try another search or clear your filters to see the full collection.</p>
              <button
                type="button"
                onClick={() => {
                  clearFilters()
                  setSearchParams({}, { replace: true })
                }}
                className="mt-5 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
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
