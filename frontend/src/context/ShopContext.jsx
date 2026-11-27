
import { createContext, useCallback, useEffect, useState } from 'react'
import { getBrands, getCategories, getProducts } from '../api/client'

// eslint-disable-next-line react-refresh/only-export-components
export const ShopContext = createContext({})

const ShopContextProvider = ({ children }) => {
  const currency = '$'
  const delivery_fee = 10
  const [products, setProducts] = useState([])
  const [highestPrice, setHighestPrice] = useState(0)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')

  const fetchCatalog = useCallback(() => Promise.all([
        getProducts({ page: 0, size: 100, active: true, sortBy: 'createdAt', sortDirection: 'DESC' }),
        getCategories(),
        getBrands(),
        getProducts({ page: 0, size: 1, active: true, sortBy: 'price', sortDirection: 'DESC' }),
      ]), [])

  useEffect(() => {
    let active = true
    fetchCatalog()
      .then(([productPage, categoryList, brandList, highestPricedPage]) => {
        if (!active) return
        setProducts(productPage.content)
        setHighestPrice(Number(highestPricedPage.content[0]?.price) || 0)
        setCategories(categoryList)
        setBrands(brandList)
      })
      .catch((error) => {
        if (active) setCatalogError(error.message)
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })

    return () => { active = false }
  }, [fetchCatalog])

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true)
    setCatalogError('')
    try {
      const [productPage, categoryList, brandList, highestPricedPage] = await fetchCatalog()
      setProducts(productPage.content)
      setHighestPrice(Number(highestPricedPage.content[0]?.price) || 0)
      setCategories(categoryList)
      setBrands(brandList)
    } catch (error) {
      setCatalogError(error.message)
    } finally {
      setCatalogLoading(false)
    }
  }, [fetchCatalog])

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nexora-wishlist')) || []
    } catch {
      return []
    }
  })

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nexora-cart'))
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('nexora-wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem('nexora-cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product) => {
    const id = String(product._id ?? product.id)
    const itemProduct = { ...product, _id: id }
    setCartItems((previous) => {
      const existing = previous.find((item) => item.product._id === id)
      return existing
        ? previous.map((item) => item.product._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item)
        : [...previous, { product: itemProduct, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((previous) => previous.filter((item) => item.product._id !== String(productId)))
  }

  const updateCartQuantity = (productId, quantity) => {
    const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
    setCartItems((previous) => previous.map((item) => item.product._id === String(productId)
      ? { ...item, quantity: normalizedQuantity }
      : item))
  }

  const clearCart = () => setCartItems([])
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  const total = subtotal + (cartItems.length ? delivery_fee : 0)

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
    highestPrice,
    categories,
    brands,
    catalogLoading,
    catalogError,
    loadCatalog,
    currency,
    delivery_fee,
    cartItems,
    cartCount,
    subtotal,
    total,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
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
