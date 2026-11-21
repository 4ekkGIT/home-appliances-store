import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets.js'
import { ShopContext } from '../context/ShopContext'

const categoryImages = [
  ['smartphone', assets.smartphoneCategory],
  ['headphone', assets.headphonesCategory],
  ['laptop', assets.laptopsCategory],
  ['television', assets.tvsCategory],
  ['tv', assets.tvsCategory],
  ['refrigerator', assets.fridgesCategory],
  ['fridge', assets.fridgesCategory],
  ['washing', assets.washingMachineCategory],
  ['vacuum', assets.vacuumCleanerCategory],
  ['heater', assets.heaterCategory],
]

const PopularCategories = () => {
  const { categories, catalogLoading, catalogError } = useContext(ShopContext)
  const getCategoryImage = (category) =>
    categoryImages.find(([keyword]) => `${category.name} ${category.slug}`.toLowerCase().includes(keyword))?.[1]
      || assets.cheapDealsCategory

  return (
    <section aria-labelledby="popular-categories-heading" className="my-10 sm:my-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Find what you need
          </p>
          <h2
            id="popular-categories-heading"
            className="mt-1 text-2xl font-semibold text-gray-900 sm:text-3xl"
          >
            Popular categories
          </h2>
        </div>
        <Link
          to="/catalog"
          className="shrink-0 text-sm font-medium text-gray-600 transition-colors hover:text-gray-950"
        >
          View all
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </Link>
      </div>

      {catalogLoading ? (
        <p role="status" className="py-8 text-center text-sm text-gray-500">Loading categories…</p>
      ) : catalogError ? (
        <p role="alert" className="py-8 text-center text-sm text-red-700">{catalogError}</p>
      ) : categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No categories are available yet.</p>
      ) : (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/catalog?categoryId=${category.id}`}
              aria-label={`Browse ${category.name}`}
              className="group flex h-full min-h-36 items-center justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 sm:min-h-44 sm:px-5"
            >
              <span className="max-w-24 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-black sm:text-base">
                {category.name}
              </span>
              <img
                src={getCategoryImage(category)}
                alt=""
                loading="lazy"
                className="h-24 w-24 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32"
              />
            </Link>
          </li>
        ))}
      </ul>
      )}
    </section>
  )
}

export default PopularCategories
