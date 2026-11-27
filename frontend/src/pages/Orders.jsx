import { useEffect, useState } from 'react'
import { cancelMyOrder, getMyOrders } from '../api/client'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    let active = true
    getMyOrders()
      .then((items) => {
        if (active) setOrders(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    setCancellingId(id)
    setError('')
    try {
      const updated = await cancelMyOrder(id)
      setOrders((current) => current.map((order) => order.id === updated.id ? updated : order))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-5xl py-8 sm:py-12">
      <h1 className="text-2xl font-semibold text-gray-950">My orders</h1>
      {isLoading && <p role="status" className="mt-8 text-sm text-gray-500">Loading orders...</p>}
      {error && <p role="alert" className="mt-8 text-sm text-red-700">{error}</p>}
      {!isLoading && !error && orders.length === 0 && (
        <p className="mt-8 text-sm text-gray-500">You have no orders yet.</p>
      )}
      <div className="mt-8 space-y-5">
        {orders.map((order) => (
          <article key={order.id} className="border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="font-semibold text-gray-950">Order #{order.id}</h2>
                <p className="mt-1 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{order.status}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {order.items.map((item, index) => (
                <li key={`${item.productId ?? 'deleted'}-${index}`} className="flex justify-between gap-4">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{Number(item.lineTotal).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <span className="font-semibold text-gray-950">Total: {Number(order.totalAmount).toFixed(2)}</span>
              {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                <button type="button" onClick={() => cancelOrder(order.id)} disabled={cancellingId === order.id} className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50">
                  {cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

export default Orders
