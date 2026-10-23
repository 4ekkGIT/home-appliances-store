import Bestseller from '../components/Bestseller'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import PopularCategories from '../components/PopularCategories'

const Home = () => {
  return (
    <div>
      <Hero />

      <PopularCategories />

      <LatestCollection />

      <Bestseller />
    </div>
  )
}

export default Home
