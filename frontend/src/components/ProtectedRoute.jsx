import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading, authError, checkSession } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p role="status" className="py-12 text-center text-gray-500">Checking your sign-in...</p>
  }

  if (authError) {
    return (
      <div role="alert" className="py-12 text-center">
        <p className="text-gray-700">{authError}</p>
        <button
          type="button"
          onClick={checkSession}
          className="mt-4 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return (
      <div role="alert" className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-950">Access denied</h1>
        <p className="mt-2 text-sm text-gray-600">This page is available to store administrators only.</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
