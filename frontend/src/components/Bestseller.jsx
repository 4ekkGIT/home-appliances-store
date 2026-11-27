import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'

const Bestseller = () => {
const {products, catalogLoading, catalogError, loadCatalog} = useContext(ShopContext)
const bestSeller = products.slice(0, 5)

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'FEATURED'} text2={'PRODUCTS'} />
      </div>

      {catalogLoading ? (
        <p role="status" className="py-8 text-center text-sm text-gray-500">Loading products…</p>
      ) : catalogError ? (
        <div role="alert" className="py-8 text-center text-sm text-red-700">
          <p>{catalogError}</p>
          <button type="button" onClick={loadCatalog} className="mt-2 underline">Try again</button>
        </div>
      ) : bestSeller.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No products are available yet.</p>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
            {
                bestSeller.map((item)=>(
                    <ProductItem
                  key={item._id}
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  category={item.category}
                  bestSeller={item.bestSeller}
                />
                ))
            }
        </div>
      )}
    </div>
  )
}

export default Bestseller
