import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthInput from '../components/AuthInput'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'

const MIN_PASSWORD_LENGTH = 8

const Register = () => {
  const { register, login, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, navigate, user])

  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }))
  }

  const validate = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      return 'Please enter your first and last name'
    }
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
    }

    setError('')
    setIsSubmitting(true)
    try {
      await register(payload)

      // Аккаунт создан: входим автоматически, редирект сделает useEffect
      try {
        await login(payload.email, payload.password)
      } catch {
        navigate('/login', { replace: true })
      }
    } catch (registerError) {
      setError(registerError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Nexora and discover our products"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthInput
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First name"
          autoComplete="given-name"
        />

        <AuthInput
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last name"
          autoComplete="family-name"
        />

        <AuthInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          autoComplete="email"
        />

        <PasswordInput
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-md text-sm hover:bg-gray-800 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-black font-medium underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register