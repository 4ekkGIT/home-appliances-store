import { Link } from 'react-router-dom'
import { assets } from '../assets/assets.js'

const About = () => {
  const highlights = [
    {
      number: '01',
      title: 'Useful by design',
      description: 'We focus on the technology and appliances that make everyday routines a little easier.',
    },
    {
      number: '02',
      title: 'A considered selection',
      description: 'Explore essentials for your home, your work, and the moments in between.',
    },
    {
      number: '03',
      title: 'Shopping made simple',
      description: 'Clear product details and an easy-to-use store help you choose with confidence.',
    },
  ]

  return (
    <main className="py-8 sm:py-12">
      <section className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white lg:grid-cols-2">
        <div className="flex flex-col items-start justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            About Nexora
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-5xl lg:text-[3.5rem]">
            A better home starts with the right essentials.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
            Nexora brings together the technology and home appliances that help
            make everyday life work better. Find practical essentials, discover
            something new, and make your space your own.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Explore the catalog
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-800 transition hover:border-gray-500 hover:bg-gray-50"
            >
              Get in touch
            </Link>
          </div>
        </div>

        <div className="grid min-h-[360px] grid-cols-2 grid-rows-2 gap-3 bg-gray-100 p-4 sm:min-h-[460px] sm:gap-4 sm:p-6">
          <div className="row-span-2 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-4">
            <img
              src={assets.fridgesCategory}
              alt="Modern refrigerator"
              className="h-full max-h-80 w-full object-contain"
            />
            <span className="mt-2 text-xs font-medium text-gray-500 sm:text-sm">
              Made for home
            </span>
          </div>
          <div className="flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-3">
            <img
              src={assets.smartphoneCategory}
              alt="Smartphone"
              className="h-28 w-full object-contain sm:h-36"
            />
            <span className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              Made to connect
            </span>
          </div>
          <div className="flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-3">
            <img
              src={assets.airfryer}
              alt="Air fryer"
              className="h-28 w-full object-contain sm:h-36"
            />
            <span className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">
              Made for every day
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="why-nexora-heading">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            The Nexora difference
          </p>
          <h2
            id="why-nexora-heading"
            className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl"
          >
            Technology for real life.
          </h2>
          <p className="mt-4 leading-7 text-gray-600">
            The best products are the ones that fit naturally into your day.
            That idea guides how we bring together the things you need for a
            more comfortable, connected home.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map(({ number, title, description }) => (
            <article
              key={number}
              className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-7"
            >
              <span className="text-sm font-semibold text-gray-400">{number}</span>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gray-900 px-6 py-9 text-white sm:flex-row sm:items-center sm:px-10 sm:py-11">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Make yourself at home
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Find your next everyday essential.
          </h2>
        </div>
        <Link
          to="/catalog"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
        >
          Browse products
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  )
}

export default About
