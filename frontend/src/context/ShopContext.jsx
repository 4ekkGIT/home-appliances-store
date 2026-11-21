
import { createContext, useEffect, useState } from 'react'
import { products } from '../assets/assets'

export const ShopContext = createContext()

const ShopContextProvider = ({ children }) => {
  const currency = '$'
  const delivery_fee = 10

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nexora-wishlist')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('nexora-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (productId) => {
    setWishlist((previous) =>
      previous.includes(String(productId))
        ? previous
        : [...previous, String(productId)]
    )
  }

  const removeFromWishlist = (productId) => {
    setWishlist((previous) =>
      previous.filter((id) => id !== String(productId))
    )
  }

  const toggleWishlist = (productId) => {
    const id = String(productId)

    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    )
  }

  const isWishlisted = (productId) =>
    wishlist.includes(String(productId))

  const value = {
    products,
    currency,
    delivery_fee,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
  }

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider
