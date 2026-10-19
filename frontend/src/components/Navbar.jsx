import React from 'react'
import { assets } from '../assets/assets.js'
import { Link, NavLink } from 'react-router-dom'

const Navbar = () => {

    const [visible, setVisible] = React.useState(false);

  return (
    <div className='relative z-20 flex flex-wrap items-center justify-between gap-y-4 py-5 font-medium sm:flex-nowrap sm:gap-y-0'>
      
      <img src={assets.nexoraLogo} alt="logo" className='order-1 w-36'/>


      <form className='border border-gray-700 rounded order-3 w-full max-w-md sm:order-2 sm:mx-6 sm:flex-1'>
          <label htmlFor="search" className="block mb-2.5 text-sm font-medium text-heading sr-only ">Search</label>
          <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
              </div>
              <input type="search" id="search" className="block w-full p-3 ps-9 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" placeholder="Search" required />
              <button type="button" className="absolute end-1.5 bottom-1.5 text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded text-xs px-3 py-1.5 focus:outline-none">Search</button>
          </div>
      </form>


      <ul className='hidden sm:order-3 sm:flex gap-5 text-sm text-gray-600 hover:cursor-pointer'>
        <NavLink className='flex flex-col items-center gap-1' to='/'>
          <p>HOME</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-800 hidden'/>
        </NavLink>

        <NavLink className='flex flex-col items-center gap-1' to='/catalog'>
          <p>CATALOG</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-800 hidden'/>
        </NavLink>

        <NavLink className='flex flex-col items-center gap-1' to='/about'>
          <p>ABOUT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-800 hidden'/>
        </NavLink>

        <NavLink className='flex flex-col items-center gap-1' to='/contact'>
          <p>CONTACT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-800 hidden'/>
        </NavLink>
      </ul>

      <div className='order-2 flex items-center gap-5 sm:order-4'>
        <img src={assets.favourite} alt="favourite" className='w-5 hover:cursor-pointer'/>

        <div className='group relative'>
          <img className='w-5 cursor-pointer' src={assets.usericon} alt="user" />
          <div className='group-hover:block hidden absolute dropdown-menu right-0 z-50 pt-4'>
            <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                <p className='cursor-pointer hover:text-black'>My Profile</p>
                <NavLink className='cursor-pointer hover:text-black' to='/orders'>
                  Orders
                </NavLink>
                <p className='cursor-pointer hover:text-black'>Wishlist</p>
                <p className='cursor-pointer hover:text-black'>Logout</p>
            </div>
          </div>
        </div>

        <Link to='/cart' className='relative'>
          <img src={assets.carticon} alt="cart" className='w-5 min-w-5 hover:cursor-pointer'/>
          <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>10</p>
        </Link>

        <img src={assets.menuicon} onClick={() => setVisible(true)} alt="menu" className='w-5 cursor-pointer sm:hidden'/>
      </div>

      {/* Mobile Menu */}
        <div className={`fixed top-0 right-0 bottom-0 z-50 overflow-hidden bg-white transition-all duration-300 ${visible ? 'w-full' : 'w-0'}`}>
            <div className='flex flex-col text-grey-600 '>
              <div onClick={()=>setVisible(false)} className='flex items-center gap-2 p-3 hover:bg-gray-100 hover:cursor-pointer'>
                <img className='h-4 rotate-180' src={assets.dropdownicon} alt="" />
                <p>Back</p>
              </div>
              <NavLink onClick={()=>setVisible(false)} className='py-6 pl-2 border text-gray-600' to='/'>HOME</NavLink>
              <NavLink onClick={()=>setVisible(false)} className='py-6 pl-2 border text-gray-600' to='/catalog'>CATALOG</NavLink>
              <NavLink onClick={()=>setVisible(false)} className='py-6 pl-2 border text-gray-600' to='/about'>ABOUT</NavLink>
              <NavLink onClick={()=>setVisible(false)} className='py-6 pl-2 border text-gray-600' to='/contact'>CONTACT</NavLink>
            </div>
        </div>
    </div>
  )
}

export default Navbar
