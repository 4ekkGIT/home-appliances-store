import { Link } from 'react-router-dom'

const Contact = () => {
  return (
    <main className="py-10 sm:py-16">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Get in touch
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            We're here to help.
          </h1>
          <p className="mt-4 leading-7 text-gray-600">
            Have a question about Nexora or need help finding the right product?
            Reach out by phone or email and we’ll be happy to help.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:contact@nexora.com"
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm sm:p-8"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-800" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <h2 className="mt-5 text-lg font-semibold text-gray-900">Email us</h2>
            <p className="mt-1 text-sm text-gray-600">Send us a message anytime.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:underline">
              contact@nexora.com <span aria-hidden="true">→</span>
            </span>
          </a>

          <a
            href="tel:+77777777777"
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm sm:p-8"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-800" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.6 3.8h3l1.5 4-2 1.7a15.3 15.3 0 0 0 5.4 5.4l1.7-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 6a2 2 0 0 1 2-2.2Z" />
              </svg>
            </span>
            <h2 className="mt-5 text-lg font-semibold text-gray-900">Call us</h2>
            <p className="mt-1 text-sm text-gray-600">We’re just a phone call away.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:underline">
              +7-777-777-7777 <span aria-hidden="true">→</span>
            </span>
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-600">
          Looking for something specific?{' '}
          <Link to="/catalog" className="font-medium text-gray-900 underline underline-offset-4">
            Browse the catalog
          </Link>
          .
        </p>
      </section>
    </main>
  )
}

export default Contact
