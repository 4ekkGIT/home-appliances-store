import { Link } from 'react-router-dom'
import { assets } from '../assets/assets.js'

const categories = [
  { name: 'Special offers', image: assets.cheapDealsCategory, filter: { bestSeller: true } },
  { name: 'Smartphones', image: assets.smartphoneCategory, filter: { subCategory: 'Smartphones' } },
  { name: 'Headphones', image: assets.headphonesCategory, filter: { subCategory: 'Headphones' } },
  { name: 'Laptops', image: assets.laptopsCategory, filter: { subCategory: 'Laptops' } },
  { name: 'Televisions', image: assets.tvsCategory, filter: { subCategory: 'TVs' } },
  { name: 'Refrigerators', image: assets.fridgesCategory, filter: { subCategory: 'Refrigerators' } },
  { name: 'Washing machines', image: assets.washingMachineCategory, filter: { subCategory: 'Washing Machines' } },
  { name: 'Vacuum cleaners', image: assets.vacuumCleanerCategory, filter: { subCategory: 'Vacuum Cleaners' } },
  { name: 'Heaters', image: assets.heaterCategory, filter: { subCategory: 'Heaters' } },
  { name: 'Water heaters', image: assets.waterHeatersCategory, filter: { subCategory: 'Water Heaters' } },
]

const PopularCategories = () => {
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

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((category) => (
          <li key={category.name}>
            <Link
              to={`/catalog?${new URLSearchParams(category.filter)}`}
              aria-label={`Browse ${category.name}`}
              className="group flex h-full min-h-36 items-center justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 sm:min-h-44 sm:px-5"
            >
              <span className="max-w-24 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-black sm:text-base">
                {category.name}
              </span>
              <img
                src={category.image}
                alt=""
                loading="lazy"
                className="h-24 w-24 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PopularCategories
