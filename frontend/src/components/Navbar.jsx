import { useContext, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets.js'
import { useAuth } from '../context/AuthContext'
import { ShopContext } from '../context/ShopContext'

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
  const [logoutError, setLogoutError] = useState('')
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const logoutDialogRef = useRef(null)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { cartCount } = useContext(ShopContext)

  useEffect(() => {
    const dialog = logoutDialogRef.current
    if (logoutConfirmationOpen && dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [logoutConfirmationOpen])

  const openLogoutConfirmation = () => {
    setLogoutError('')
    setLogoutConfirmationOpen(true)
  }

  const handleLogout = async () => {
    setLogoutError('')
    setIsLoggingOut(true)
    try {
      await logout()
      setLogoutConfirmationOpen(false)
      setVisible(false)
      navigate('/', { replace: true })
    } catch (error) {
      setLogoutError(error.message)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = e.currentTarget.elements.search.value.trim()
    navigate(query ? `/catalog?query=${encodeURIComponent(query)}` : '/catalog')
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
                {user ? (
                  <>
                    <span className="max-w-48 truncate text-gray-900">{user.email}</span>
                    {user.roles?.includes('ROLE_ADMIN') && <Link to="/admin" className="hover:text-black">Store admin</Link>}
                    <button type="button" onClick={openLogoutConfirmation} className="text-left hover:text-black">Sign Out</button>
                  </>
                ) : (
                  <Link to="/login" className="hover:text-black">Sign In</Link>
                )}
                <Link to="/orders" className="hover:text-black">Orders</Link>
                <Link to="/wishlist" className="hover:text-black">Wishlist</Link>
              </div>
            </div>
          </div>

          <Link to="/cart" aria-label="Shopping cart" className="relative">
            <img src={assets.carticon} alt="" className="w-5 min-w-5 transition-transform hover:scale-110" />
            <span className="absolute -bottom-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] leading-none text-white">{cartCount}</span>
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
        <div className="flex flex-col gap-4 border-t border-gray-200 p-4 text-sm">
          {user ? (
            <>
              <span className="truncate text-gray-500">{user.email}</span>
              {user.roles?.includes('ROLE_ADMIN') && <Link to="/admin" onClick={() => setVisible(false)}>Store admin</Link>}
              <button type="button" onClick={openLogoutConfirmation} className="text-left">Sign Out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setVisible(false)}>Sign In</Link>
          )}
        </div>
      </div>

      {logoutConfirmationOpen && (
        <dialog
          ref={logoutDialogRef}
          aria-labelledby="logout-dialog-title"
          onCancel={() => setLogoutConfirmationOpen(false)}
          onClose={() => setLogoutConfirmationOpen(false)}
          className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border-0 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/50"
        >
          <h2 id="logout-dialog-title" className="text-lg font-semibold">Sign out?</h2>
          <p className="mt-2 text-sm text-gray-600">Are you sure you want to sign out of your account?</p>
          {logoutError && <p role="alert" className="mt-3 text-sm text-red-600">{logoutError}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setLogoutConfirmationOpen(false)}
              disabled={isLoggingOut}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoggingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </dialog>
      )}
    </header>
  )
}

export default Navbar