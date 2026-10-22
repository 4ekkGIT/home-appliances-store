import { assets } from "../assets/assets"

const PopularCategories = () => {
  return (
    <section className="w-full flex justify-center mt-4">

      <div className="w-full px-4 md:px-6 2xl:px-10 max-w-360">

        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl md:text-[40px] text-gray-800 font-roboto-condensed font-semibold">Bestsellers</h2>
          <a href="/catalog" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-gray-800 transition-colors">View All</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mt-4 gap-3 sm:gap-4 md:gap-6">
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.cheapDealsCategory} alt="Cheap Deals" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Cheap Deals</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.iphone18CategoryImg} alt="Apple phones" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Apple phones</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.smartphoneCategory} alt="Smartphones" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Smartphones</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.headphonesCategory} alt="Headphones" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Headphones</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.heaterCategory} alt="Heaters" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Heaters</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.vacuumCleanerCategory} alt="Vacuum Cleaners" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Vacuum Cleaners</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.washingMachineCategory} alt="Washing Machines" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Washing Machines</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.tvsCategory} alt="TVs" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">TVs</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.laptopsCategory} alt="Laptops" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Laptops</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.fridgesCategory} alt="Fridges" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Fridges</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.waterHeatersCategory} alt="Water Heaters" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Water Heaters</h3>
          </div>
          <div className="flex flex-col bg-white rounded-lg items-center justify-center gap-2 p-2 sm:p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
            <img src={assets.promotionImg} alt="Cheap Deals" className="w-full max-w-[120px] aspect-square object-contain" />
            <h3 className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base text-center">Cheap Deals</h3>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PopularCategories