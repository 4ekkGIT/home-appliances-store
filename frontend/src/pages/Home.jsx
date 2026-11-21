import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import PopularCategories from '../components/PopularCategories'

const Home = () => {
  return (
    <div>
      <Hero />

      <PopularCategories />

      <LatestCollection />

    </div>
  )
}

export default Home
