import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        
        <div>
            <img src={assets.nexoraLogo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quia consequuntur earum, dolorem esse vitae eum deleniti accusamus similique, voluptates rerum iure temporibus inventore aspernatur tempora ab! Alias voluptas iure consectetur?</p>
        </div>

        <div>
            <p className='text-x1 font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li><a href='/'>Home</a></li>
                <li><a href='/about'>About</a></li>
                <li><a href='/orders'>Delivery</a></li>
                <li>Privacy policy</li>
            </ul>
        </div>

        <div>
            <p className='text-x1 font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+7-777-777-7777</li>
                <li>contact@nexora.com</li>
            </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>
            Copyright 2026@ nexora.com - All Right Reserved
        </p>
      </div>
    </div>
  )
}

export default Footer
