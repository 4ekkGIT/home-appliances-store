import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthInput from '../components/AuthInput'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const { login, user, isLoading, authError } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Единственное место редиректа: срабатывает и после входа, и если пользователь уже авторизован
  useEffect(() => {
    if (!isLoading && user) {
      navigate(location.state?.from || '/', { replace: true })
    }
  }, [isLoading, location.state, navigate, user])

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)
    try {
      await login(formData.email, formData.password)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your Nexora account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          autoComplete="email"
        />

        <PasswordInput value={formData.password} onChange={handleChange} />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-gray-500 hover:text-black"
          >
            Forgot password?
          </Link>
        </div>

        {(error || authError) && (
          <div role="alert" className="text-sm text-red-600">
            <p>{error || authError}</p>
            {(error || authError).toLowerCase().includes('not verified') && (
              <Link to="/verify-email" className="mt-1 inline-block underline">
                Resend confirmation email
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-md text-sm hover:bg-gray-800 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-black font-medium underline">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login