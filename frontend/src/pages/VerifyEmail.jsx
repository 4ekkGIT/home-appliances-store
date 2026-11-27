import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AuthInput from '../components/AuthInput'
import { resendVerificationEmail, verifyEmail } from '../api/authService'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState(token ? 'verifying' : 'missing')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    verifyEmail(token)
      .then(() => setStatus('verified'))
      .catch((error) => {
        setStatus('failed')
        setMessage(error.message)
      })
  }, [token])

  const resend = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      await resendVerificationEmail(email)
      setMessage('If the account exists and is not verified, a new confirmation email has been sent.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <AuthLayout
      title={status === 'verified' ? 'Email confirmed' : 'Confirm your email'}
      subtitle={status === 'verified'
        ? 'Your Nexora account is ready.'
        : 'A confirmation link was sent to your email address.'}
    >
      {status === 'verifying' && <p className="text-sm text-gray-600">Verifying...</p>}
      {status === 'verified' && (
        <Link to="/login" className="block w-full bg-black text-white py-3 rounded-md text-sm text-center">
          Sign In
        </Link>
      )}
      {(status === 'missing' || status === 'failed') && (
        <form onSubmit={resend} className="flex flex-col gap-4">
          {message && <p role="alert" className="text-sm text-red-600">{message}</p>}
          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
          />
          <button type="submit" className="w-full bg-black text-white py-3 rounded-md text-sm">
            Resend confirmation email
          </button>
        </form>
      )}
    </AuthLayout>
  )
}

export default VerifyEmail
