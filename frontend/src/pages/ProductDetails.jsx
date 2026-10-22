import { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const ProductDetails = () => {
  const { productId } = useParams()
  const { products, currency } = useContext(ShopContext)
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
          {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
            product.price,
          )}{' '}
          {currency}
        </p>
        <p className="mt-6 text-gray-600">{product.description}</p>
      </div>
    </main>
  )
}

export default ProductDetails
