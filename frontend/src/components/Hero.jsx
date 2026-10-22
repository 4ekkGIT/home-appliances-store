import { assets } from '../assets/assets.js'


const Hero = () => {
  return (
      // <div className='flex aspect-[16/9] max-w-5xl flex-col sm:flex-row border border-gray-300 mx-auto rounded-lg overflow-hidden'>
    <div className='w-full h-[180px] sm:h-[280px] lg:h-[400px] overflow-hidden'>

      <img className='h-full w-full object-cover' src={assets.iphoneduohero} alt="heroimage" />

    </div>
  )
}

export default Hero
