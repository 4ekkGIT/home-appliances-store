import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../api/client'
import { ShopContext } from '../context/ShopContext'

const ProductDetails = () => {
  const { productId } = useParams()
  const { currency, toggleWishlist, isWishlisted, addToCart } = useContext(ShopContext)
  const [loadedProduct, setLoadedProduct] = useState({ id: null, product: null, error: '' })
  const [activeImage, setActiveImage] = useState(0)
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    let active = true
    getProductById(productId)
      .then((result) => {
        if (active) setLoadedProduct({ id: productId, product: result, error: '' })
      })
      .catch((requestError) => {
        if (active) {
          setLoadedProduct({
            id: productId,
            product: null,
            error: requestError.message,
            notFound: requestError.status === 404,
          })
        }
      })

    return () => {
      active = false
    }
  }, [productId])

  const loading = loadedProduct.id !== productId
  const product = loading ? null : loadedProduct.product
  const error = loading ? '' : loadedProduct.error

  if (loading) {
    return <p role="status" className="py-16 text-center text-sm text-gray-500">Loading product…</p>
  }

  if (error || !product) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {loadedProduct.notFound ? 'Product not found' : error ? 'Could not load product' : 'Product not found'}
        </h1>
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        <Link to="/catalog" className="mt-4 inline-block text-gray-700 underline underline-offset-4">
          Back to catalog
        </Link>
      </section>
    )
  }

  const wishlisted = isWishlisted(product._id)
  const images = product.image || []
  const visibleImageIndex = Math.min(activeImage, Math.max(images.length - 1, 0))
  const productAttributes = product.attributes || []

  return (
    <main className="mx-auto grid max-w-5xl gap-8 py-10 md:grid-cols-2">
      <div>
        <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-6">
          {images.length > 0 ? (
            <img src={images[visibleImageIndex]} alt={product.name} className="h-full w-full object-contain" />
          ) : (
            <span className="text-sm text-gray-400">Image unavailable</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={visibleImageIndex === index}
                className={`h-16 w-16 shrink-0 rounded-lg border p-1 ${visibleImageIndex === index ? 'border-gray-900' : 'border-gray-200'}`}
              >
                <img src={image} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="self-center">
        <p className="text-sm text-gray-500">
          {[product.category, product.brand].filter(Boolean).join(' · ')}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">{product.name}</h1>
        <p className="mt-4 text-xl font-medium text-gray-900">
          {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(product.price)} {currency}
        </p>
        <p className="mt-6 whitespace-pre-line text-gray-600">
          {product.description || 'No description is available for this product.'}
        </p>

        {productAttributes.length > 0 && (
          <dl className="mt-6 divide-y divide-gray-100 border-y border-gray-100">
            {productAttributes.map((attribute) => (
              <div key={attribute.attributeId} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-gray-500">{attribute.name}</dt>
                <dd className="text-right font-medium text-gray-900">
                  {attribute.valueText ?? attribute.valueNumber ?? String(attribute.valueBoolean)}
                  {attribute.unit ? ` ${attribute.unit}` : ''}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <button
          type="button"
          onClick={() => {
            addToCart(product)
            setCartMessage('Added to your cart')
          }}
          className="mt-8 flex w-full items-center justify-center rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
        >
          Add to cart
        </button>
        {cartMessage && <p role="status" className="mt-2 text-sm text-green-700">{cartMessage}</p>}

        <button
          type="button"
          onClick={() => toggleWishlist(product._id)}
          aria-pressed={wishlisted}
          className={`mt-8 flex w-full items-center justify-center gap-3 rounded-lg border px-6 py-3 text-sm font-medium transition sm:w-auto ${
            wishlisted ? 'border-black bg-black text-white hover:bg-gray-800' : 'border-gray-300 bg-white text-gray-800 hover:border-black'
          }`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
          {wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        </button>
      </div>
    </main>
  )
}

export default ProductDetails
