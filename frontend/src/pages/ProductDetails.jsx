
import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const ProductDetails = () => {
  const { productId } = useParams()

  const {
    products,
    currency,
    toggleWishlist,
    isWishlisted,
  } = useContext(ShopContext)

  const product = products.find((item) => item._id === productId)

  if (!product) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Product not found
        </h1>
        <Link
          to="/catalog"
          className="mt-4 inline-block text-gray-700 underline underline-offset-4"
        >
          Back to catalog
        </Link>
      </section>
    )
  }

  const wishlisted = isWishlisted(product._id)

  return (
    <main className="mx-auto grid max-w-5xl gap-8 py-10 md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-6">
        <img
          src={product.image[0]}
          alt={product.name}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="self-center">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          {product.name}
        </h1>

        <p className="mt-4 text-xl font-medium text-gray-900">
          {new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
          }).format(product.price)}{' '}
          {currency}
        </p>

        <p className="mt-6 text-gray-600">
          {product.description}
        </p>

        <button
          type="button"
          onClick={() => toggleWishlist(product._id)}
          aria-pressed={wishlisted}
          className={`mt-8 flex w-full items-center justify-center gap-3 rounded-lg border px-6 py-3 text-sm font-medium transition sm:w-auto ${
            wishlisted
              ? 'border-black bg-black text-white hover:bg-gray-800'
              : 'border-gray-300 bg-white text-gray-800 hover:border-black'
          }`}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
            />
          </svg>

          {wishlisted
            ? 'Remove from wishlist'
            : 'Add to wishlist'}
        </button>
      </div>
    </main>
  )
}

export default ProductDetails
