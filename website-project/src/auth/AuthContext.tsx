import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AuthUser, AuthState, LoginCredentials } from '../types'

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'CLEAR_ERROR' }

// Auth Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
      }
    case 'LOGOUT':
    case 'SESSION_EXPIRED':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        const expiryStr = localStorage.getItem('auth_expiry')

        if (token && userStr && expiryStr) {
          const expiry = parseInt(expiryStr)
          const now = Date.now()

          if (now < expiry) {
            const user = JSON.parse(userStr)
            dispatch({ type: 'LOGIN_SUCCESS', payload: user })
          } else {
            // Session expired
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_expiry')
            dispatch({ type: 'SESSION_EXPIRED' })
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error)
        // Clear potentially corrupted data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_expiry')
      }
    }

    checkExistingSession()
  }, [])

  // Auto logout on session expiry
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const expiryStr = localStorage.getItem('auth_expiry')
      if (expiryStr) {
        const expiry = parseInt(expiryStr)
        const now = Date.now()
        const timeLeft = expiry - now

        if (timeLeft > 0) {
          const timeoutId = setTimeout(() => {
            logout()
          }, timeLeft)

          return () => clearTimeout(timeoutId)
        } else {
          logout()
        }
      }
    }
  }, [state.isAuthenticated, state.user])

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' })

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock authentication - replace with real API call
      if (credentials.email === 'admin@smartfire.com' && credentials.password === 'admin123') {
        const user: AuthUser = {
          id: '1',
          email: credentials.email,
          username: 'admin',
          role: 'admin',
          name: 'System Administrator',
          lastLogin: Date.now(),
          createdAt: Date.now(),
        }

        // Calculate session expiry (24 hours or 1 hour based on remember me)
        const sessionDuration = credentials.rememberMe ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000
        const expiry = Date.now() + sessionDuration

        // Store in localStorage
        localStorage.setItem('auth_token', 'mock_jwt_token_' + Date.now())
        localStorage.setItem('auth_user', JSON.stringify(user))
        localStorage.setItem('auth_expiry', expiry.toString())

        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } else {
        throw new Error('Invalid email or password')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_expiry')
    dispatch({ type: 'LOGOUT' })
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}