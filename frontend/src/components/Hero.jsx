
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets.js'

const slides = [
  {
    image: assets.slide1,
    alt: 'Nexora - home appliances',
    link: '/catalog',
  },
  {
    image: assets.slide2,
    alt: 'Discover new electronics',
    link: '/catalog',
  },
  {
    image: assets.slide3,
    alt: 'Special offers at Nexora',
    link: '/catalog',
  },
]

const Hero = () => {
  const [current, setCurrent] = useState(0)

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrent((prev) =>
      (prev - 1 + slides.length) % slides.length
    )
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full overflow-hidden">
      {/* Slides */}
      <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <Link key={slide.image}
            to={slide.link}
            className="relative block aspect-[1280/546] w-full shrink-0"
            aria-label={slide.alt}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="h-full w-full object-cover"
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
          </Link>
        ))}
      </div>

      {/* Previous button */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 flex h-10 w-10
                   -translate-y-1/2 items-center justify-center
                   rounded-full bg-white/80 shadow-md
                   transition hover:bg-white sm:left-6"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M15 19L8 12L15 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Next button */}
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 flex h-10 w-10
                   -translate-y-1/2 items-center justify-center
                   rounded-full bg-white/80 shadow-md
                   transition hover:bg-white sm:right-6 hover:cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M9 5L16 12L9 19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Navigation dots */}
      <div className="absolute bottom-3 left-1/2 flex
                      -translate-x-1/2 gap-2 sm:bottom-5">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={current === index ? 'true' : undefined}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? 'w-6 bg-white'
                : 'w-2 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero
