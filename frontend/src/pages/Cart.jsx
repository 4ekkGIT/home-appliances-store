import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAvailableStock } from '../api/client'
import { ShopContext } from '../context/ShopContext'

const money = (amount, currency) => `${Number(amount).toFixed(2)} ${currency}`

const Cart = () => {
  const {
    cartItems,
    currency,
    delivery_fee,
    subtotal,
    total,
    removeFromCart,
    updateCartQuantity,
  } = useContext(ShopContext)
  const [stockResult, setStockResult] = useState({ key: '', stock: {}, error: '' })
  const stockKey = cartItems.map(({ product }) => product._id).join(',')

  useEffect(() => {
    if (cartItems.length === 0) return undefined

    let active = true
    Promise.all(cartItems.map(async ({ product }) => {
      const result = await getAvailableStock(product._id)
      return [product._id, result.availableQuantity]
    }))
      .then((entries) => {
        if (active) setStockResult({ key: stockKey, stock: Object.fromEntries(entries), error: '' })
      })
      .catch((error) => {
        if (active) setStockResult({ key: stockKey, stock: {}, error: error.message })
      })

    return () => { active = false }
  }, [cartItems, stockKey])

  const checkingStock = cartItems.length > 0 && stockResult.key !== stockKey
  const stockError = stockResult.key === stockKey ? stockResult.error : ''
  const availableStock = stockResult.key === stockKey ? stockResult.stock : {}

  const hasInsufficientStock = cartItems.some(({ product, quantity }) =>
    availableStock[product._id] !== undefined && availableStock[product._id] < quantity)
  const canCheckout = cartItems.length > 0 && !checkingStock && !stockError
    && Object.keys(availableStock).length === cartItems.length && !hasInsufficientStock

  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-5xl py-16 text-center sm:py-24">
        <h1 className="text-2xl font-semibold text-gray-950">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-600">Find something useful for your home.</p>
        <Link to="/catalog" className="mt-6 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">
          Browse products
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl py-8 sm:py-12">
      <h1 className="text-2xl font-semibold text-gray-950">Shopping cart</h1>
      <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Cart items" className="divide-y divide-gray-200 border-y border-gray-200">
          {cartItems.map(({ product, quantity }) => {
            const available = availableStock[product._id]
            return (
              <article key={product._id} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:gap-6">
                <Link to={`/product/${product._id}`} className="flex aspect-square items-center justify-center bg-white p-2">
                  {product.image?.[0] ? <img src={product.image[0]} alt={product.name} className="h-full w-full object-contain" /> : <span className="text-xs text-gray-400">No image</span>}
                </Link>
                <div className="min-w-0">
                  <Link to={`/product/${product._id}`} className="font-medium text-gray-900 hover:underline">{product.name}</Link>
                  <p className="mt-1 text-sm text-gray-600">{money(product.price, currency)}</p>
                  {available !== undefined && (
                    <p className={`mt-2 text-xs ${available < quantity ? 'text-red-700' : 'text-green-700'}`}>
                      {available < quantity ? `Only ${available} available` : `${available} available`}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <span>Qty</span>
                      <input
                        type="number"
                        min="1"
                        max={available ?? undefined}
                        value={quantity}
                        onChange={(event) => updateCartQuantity(product._id, event.target.value)}
                        aria-label={`Quantity for ${product.name}`}
                        className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
                      />
                    </label>
                    <button type="button" onClick={() => removeFromCart(product._id)} className="text-xs text-gray-500 underline underline-offset-2 hover:text-red-700">
                      Remove
                    </button>
                  </div>
                </div>
                <p className="col-start-2 text-sm font-semibold text-gray-900 sm:col-start-auto sm:text-right">
                  {money(Number(product.price) * quantity, currency)}
                </p>
              </article>
            )
          })}
        </section>

        <aside className="h-fit border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-950">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 text-gray-600"><dt>Subtotal</dt><dd>{money(subtotal, currency)}</dd></div>
            <div className="flex justify-between gap-4 text-gray-600"><dt>Delivery</dt><dd>{money(delivery_fee, currency)}</dd></div>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 font-semibold text-gray-950"><dt>Total</dt><dd>{money(total, currency)}</dd></div>
          </dl>
          {checkingStock && <p role="status" className="mt-4 text-sm text-gray-500">Checking availability…</p>}
          {stockError && <p role="alert" className="mt-4 text-sm text-red-700">Could not verify stock: {stockError}</p>}
          {hasInsufficientStock && <p role="alert" className="mt-4 text-sm text-red-700">Reduce quantities to match available stock before checkout.</p>}
          <Link
            to="/place-order"
            aria-disabled={!canCheckout}
            onClick={(event) => { if (!canCheckout) event.preventDefault() }}
            className={`mt-6 flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white ${canCheckout ? 'bg-black hover:bg-gray-800' : 'pointer-events-none bg-gray-400'}`}
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </main>
  )
}

export default Cart