import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price, category, bestSeller }) => {
  const { currency } = useContext(ShopContext)

  return (
    <Link
      to={`/product/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-800"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50 p-5 sm:p-6">
        <img
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          src={image[0]}
          alt={name}
          loading="lazy"
        />
        {bestSeller && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-700 shadow-sm">
            Bestseller
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-gray-700 opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M4.5 10h11m-4.5-4.5L15.5 10 11 14.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {category && (
          <span className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
            {category}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-gray-800 transition-colors group-hover:text-black sm:text-[15px]">
          {name}
        </h3>
        <p className="mt-auto pt-4 text-base font-bold text-gray-950">
          {new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
          }).format(price)}{' '}
          {currency}
        </p>
      </div>
    </Link>
  )
}

export default ProductItem
