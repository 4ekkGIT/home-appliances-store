import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { assets } from '../assets/assets.js'

const links = [
  { to: '/', label: 'HOME', end: true },
  { to: '/catalog', label: 'CATALOG' },
  { to: '/about', label: 'ABOUT' },
  { to: '/contact', label: 'CONTACT' },
]

const navLinkClass = ({ isActive }) =>
  `flex flex-col items-center gap-1 transition-colors hover:text-black ${
    isActive ? 'text-black' : 'text-gray-600'
  }`

const mobileLinkClass = ({ isActive }) =>
  `border-b border-gray-200 py-5 pl-4 transition-colors hover:bg-gray-100 ${
    isActive ? 'font-semibold text-black' : 'text-gray-600'
  }`

const Navbar = () => {
  const [visible, setVisible] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    const query = e.currentTarget.elements.search.value.trim()
    if (query) window.location.href = `/searchbar?query=${encodeURIComponent(query)}`
  }

  return (
    <header className="relative z-20 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-y-4 px-4 py-4 sm:flex-nowrap sm:gap-y-0 sm:px-6 lg:px-8">
        <Link to="/" className="order-1 shrink-0">
          <img src={assets.nexoraLogo} alt="Nexora" className="w-32 cursor-pointer transition-transform duration-200 hover:scale-105 sm:w-36" />
        </Link>

        <form onSubmit={handleSearch} className="order-3 w-full sm:order-2 sm:mx-6 sm:max-w-xl sm:flex-1">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m16 16 4 4" />
            </svg>
            <input type="search" name="search" placeholder="Search products..." aria-label="Search products" className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-20 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:bg-white" />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-700 cursor-pointer">
              Search
            </button>
          </div>
        </form>

        <nav className="order-3 hidden shrink-0 sm:block">
          <ul className="flex items-center gap-5 text-sm font-medium">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={navLinkClass}>
                  {label}
                  <span className="h-0.5 w-full" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-4 sm:order-4 sm:ml-5 sm:gap-5">
          <Link to="/wishlist" aria-label="Wishlist">
            <img src={assets.favourite} alt="" className="w-5 transition-transform hover:scale-110" />
          </Link>

          <div className="group relative">
            <button type="button" aria-label="User account" className="flex items-center">
              <img src={assets.usericon} alt="" className="w-5 transition-transform hover:scale-110" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-40 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="flex flex-col gap-2 rounded-lg bg-white px-5 py-4 text-sm text-gray-600 shadow-lg ring-1 ring-gray-100">
                <Link to="/profile" className="hover:text-black">My Profile</Link>
                <Link to="/orders" className="hover:text-black">Orders</Link>
                <Link to="/wishlist" className="hover:text-black">Wishlist</Link>
              </div>
            </div>
          </div>

          <Link to="/cart" aria-label="Shopping cart" className="relative">
            <img src={assets.carticon} alt="" className="w-5 min-w-5 transition-transform hover:scale-110" />
            <span className="absolute -bottom-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] leading-none text-white">10</span>
          </Link>

          <button type="button" onClick={() => setVisible(true)} aria-label="Open menu" className="sm:hidden">
            <img src={assets.menuicon} alt="" className="w-5" />
          </button>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 bg-white transition-transform duration-300 sm:hidden ${visible ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`} aria-hidden={!visible}>
        <div className="flex items-center gap-3 border-b border-gray-200 p-4">
          <button type="button" onClick={() => setVisible(false)} aria-label="Close menu" className="flex items-center gap-2 text-gray-600 hover:text-black">
            <img src={assets.dropdownicon} alt="" className="h-4 rotate-180" />
            <span>Back</span>
          </button>
          <span className="ml-auto font-semibold text-black">NEXORA</span>
        </div>

        <nav className="flex flex-col text-sm font-medium">
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setVisible(false)} className={mobileLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar