import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../api/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const handleSessionError = useCallback((error) => {
    if (error.status === 401 || error.status === 403) {
      setUser(null)
    } else {
      setAuthError(error.message)
    }
  }, [])

  const checkSession = useCallback(async () => {
    setIsLoading(true)
    setAuthError('')
    try {
      setUser(await getCurrentUser())
    } catch (error) {
      handleSessionError(error)
    } finally {
      setIsLoading(false)
    }
  }, [handleSessionError])

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch((error) => {
        if (active) handleSessionError(error)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [handleSessionError])

  const login = useCallback(async (email, password) => {
    setAuthError('')
    try {
      const currentUser = await loginUser(email.trim(), password)
      setUser(currentUser)
      return currentUser
    } catch (error) {
      if (error.status === 401) {
        if (error.message !== 'Invalid email or password') {
          throw new Error(error.message, { cause: error })
        }
        throw new Error('Invalid email or password', { cause: error })
      }
      if (!error.status) {
        throw new Error('Cannot reach the server. Please try again later', {
          cause: error,
        })
      }
      throw error
    }
  }, [])

  const register = useCallback(async (data) => {
    setAuthError('')
    try {
      await registerUser(data)
    } catch (error) {
      if (error.status === 409) {
        throw new Error('An account with this email already exists', {
          cause: error,
        })
      }
      if (!error.status) {
        throw new Error('Cannot reach the server. Please try again later', {
          cause: error,
        })
      }
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
    setAuthError('')
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, authError, login, register, logout, checkSession }),
    [user, isLoading, authError, login, register, logout, checkSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
