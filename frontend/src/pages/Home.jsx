import Hero from '../components/Hero'
import HotDeals from '../components/HotDeals'
import LatestCollection from '../components/LatestCollection'
import PopularCategories from '../components/PopularCategories'

const Home = () => {
  return (
    <div>
      <Hero />

      <PopularCategories />

      <LatestCollection />

      <HotDeals />
    </div>
  )
}

export default Home
