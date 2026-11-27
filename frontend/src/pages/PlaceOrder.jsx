import { useContext, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { createOrder } from '../api/client'
import { ShopContext } from '../context/ShopContext'
import { useAuth } from '../context/AuthContext'

const inputClass = 'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-700'

const PlaceOrder = () => {
  const { cartItems, currency, subtotal, delivery_fee, total, clearCart } = useContext(ShopContext)
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [completedOrder, setCompletedOrder] = useState(null)

  if (cartItems.length === 0 && !completedOrder) return <Navigate to="/cart" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const values = Object.fromEntries(formData.entries())
    try {
      const order = await createOrder({
        items: cartItems.map(({ product, quantity }) => ({ productId: Number(product._id), quantity })),
        address: {
          contactName: values.contactName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          street: values.street.trim(),
          building: values.building.trim(),
          apartment: values.apartment.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country.trim(),
        },
      })
      setCompletedOrder(order)
      clearCart()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (completedOrder) {
    return (
      <main className="mx-auto max-w-2xl py-16 text-center sm:py-24">
        <p className="text-sm font-semibold uppercase text-green-700">Order confirmed</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-950">Thank you for your order</h1>
        <p className="mt-3 text-sm text-gray-600">Order #{completedOrder.orderId} has been placed.</p>
        <p className="mt-5 text-lg font-semibold text-gray-950">{Number(completedOrder.total).toFixed(2)} {currency}</p>
        <Link to="/catalog" className="mt-7 inline-flex rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">Continue shopping</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl py-8 sm:py-12">
      <h1 className="text-2xl font-semibold text-gray-950">Delivery details</h1>
      <form onSubmit={handleSubmit} className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-800 sm:col-span-2">Contact name<input name="contactName" required minLength="2" maxLength="100" autoComplete="name" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800">Email<input name="email" type="email" required maxLength="255" defaultValue={user?.email || ''} autoComplete="email" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800">Phone<input name="phone" type="tel" required minLength="7" maxLength="30" pattern="[+()0-9 .-]{7,30}" autoComplete="tel" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800 sm:col-span-2">Street<input name="street" required maxLength="200" autoComplete="address-line1" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800">Building / house<input name="building" required maxLength="50" autoComplete="address-line2" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800">Apartment (optional)<input name="apartment" maxLength="30" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800">City<input name="city" required maxLength="100" autoComplete="address-level2" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800">Postal code<input name="postalCode" required maxLength="20" autoComplete="postal-code" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-800 sm:col-span-2">Country<input name="country" required maxLength="100" autoComplete="country-name" className={inputClass} /></label>
          {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
          <p className="text-xs text-gray-500 sm:col-span-2">Stock and current prices are verified when the order is submitted.</p>
        </section>

        <aside className="h-fit border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-950">Order summary</h2>
          <ul className="mt-4 space-y-3 border-b border-gray-200 pb-4 text-sm">
            {cartItems.map(({ product, quantity }) => (
              <li key={product._id} className="flex justify-between gap-3 text-gray-600">
                <span className="min-w-0">{product.name} <span className="text-gray-400">× {quantity}</span></span>
                <span className="shrink-0">{(Number(product.price) * quantity).toFixed(2)} {currency}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600"><dt>Subtotal</dt><dd>{subtotal.toFixed(2)} {currency}</dd></div>
            <div className="flex justify-between text-gray-600"><dt>Delivery</dt><dd>{delivery_fee.toFixed(2)} {currency}</dd></div>
            <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-950"><dt>Total</dt><dd>{total.toFixed(2)} {currency}</dd></div>
          </dl>
          <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? 'Placing order…' : 'Place order'}
          </button>
          <Link to="/cart" className="mt-3 block text-center text-sm text-gray-500 underline underline-offset-2">Back to cart</Link>
        </aside>
      </form>
    </main>
  )
}

export default PlaceOrder
