
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProductById } from '../api/client'
import { ShopContext } from '../context/ShopContext'

const Wishlist = () => {
  const {
    currency,
    wishlist,
    removeFromWishlist,
  } = useContext(ShopContext)
  const wishlistKey = wishlist.join(',')
  const [loadedWishlist, setLoadedWishlist] = useState({ key: null, products: [], error: '' })

  useEffect(() => {
    let active = true
    if (wishlist.length === 0) {
      return () => { active = false }
    }

    Promise.all(wishlist.map((id) => getProductById(id)))
      .then((products) => {
        if (active) setLoadedWishlist({ key: wishlistKey, products, error: '' })
      })
      .catch((requestError) => {
        if (active) setLoadedWishlist({ key: wishlistKey, products: [], error: requestError.message })
      })

    return () => { active = false }
  }, [wishlist, wishlistKey])

  const loading = wishlist.length > 0 && loadedWishlist.key !== wishlistKey
  const wishlistProducts = wishlist.length === 0 || loading ? [] : loadedWishlist.products
  const error = loading ? '' : loadedWishlist.error

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(price)

  return (
    <main className="mx-auto max-w-[1440px] py-8 sm:py-12">

      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
            Your collection
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
            My Wishlist
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Keep track of the products you love.
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {wishlistProducts.length}{' '}
              {wishlistProducts.length === 1 ? 'item' : 'items'}
            </span>

            <button
              type="button"
              onClick={() => {
                wishlistProducts.forEach((product) =>
                  removeFromWishlist(product._id)
                )
              }}
              className="text-sm font-medium text-gray-500 underline underline-offset-4 transition hover:text-black"
            >
              Clear wishlist
            </button>
          </div>
        )}
      </div>

      {/* Empty wishlist */}
      {loading ? (
        <p role="status" className="py-16 text-center text-sm text-gray-500">Loading wishlist…</p>
      ) : error ? (
        <p role="alert" className="py-16 text-center text-sm text-red-700">{error}</p>
      ) : wishlistProducts.length === 0 ? (
        <section className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
            <svg
              className="h-9 w-9 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            Your wishlist is empty
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
            You haven't saved any products yet.
            Explore our catalog and add your favourites here.
          </p>

          <Link
            to="/catalog"
            className="mt-7 rounded-lg bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Explore products
          </Link>
        </section>
      ) : (

        /* Wishlist products */
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">

          {wishlistProducts.map((product) => (
            <article
              key={product._id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
            >

              {/* Product image */}
              <div className="relative aspect-square overflow-hidden bg-gray-50 p-5 sm:p-7">

                <Link
                  to={`/product/${product._id}`}
                  className="flex h-full w-full items-center justify-center"
                >
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product._id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  title="Remove from wishlist"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-black hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 6 6 18M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Product information */}
              <div className="flex flex-1 flex-col p-3.5 sm:p-4">

                <span className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
                  {product.category}
                </span>

                <Link
                  to={`/product/${product._id}`}
                  className="min-h-10 text-sm font-medium leading-5 text-gray-800 transition hover:text-black sm:text-[15px]"
                >
                  {product.name}
                </Link>

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <p className="text-base font-bold text-gray-950">
                    {formatPrice(product.price)} {currency}
                  </p>

                  <Link
                    to={`/product/${product._id}`}
                    aria-label={`View ${product.name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-black hover:bg-black hover:text-white"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M4.5 10h11m-4.5-4.5L15.5 10 11 14.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}

        </section>
      )}
    </main>
  )
}

export default Wishlist
