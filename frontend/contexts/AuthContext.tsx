'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  handleApiError: (response: Response) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  // Validate token with backend
  const validateToken = async (tokenToValidate: string, skipLogout: boolean = false) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        // Token is valid, ensure authenticated state
        setIsAuthenticated(true)
        setToken(tokenToValidate)
        return true
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid - clear token and log out
        console.log('Token expired or invalid, clearing token...')
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setIsAuthenticated(false)
        if (!skipLogout) {
          logout()
        }
        return false
      }
      // For other errors (500, network errors, etc.), keep the token
      // User stays logged in - token will be validated on next API call
      return true
    } catch (error) {
      // Network errors or fetch failures - don't clear token
      // Keep user logged in, token will be validated on actual API calls
      console.warn('Token validation failed, but keeping user logged in:', error)
      return true
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (storedToken) {
        // Validate token before setting authenticated state
        // Skip logout during initialization - ProtectedRoute will handle redirect
        const isValid = await validateToken(storedToken, true)
        if (!isValid) {
          // Token is expired/invalid - already cleared by validateToken
          setLoading(false)
          return
        }
        // Token is valid - already set by validateToken
        setLoading(false)
      } else {
        setIsAuthenticated(false)
        setLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  // Login function
  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setIsAuthenticated(true)
  }

  // Handle API errors and check for token expiration
  const handleApiError = (response: Response): boolean => {
    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      console.log('API request failed with 401/403, token expired, logging out...')
      logout()
      return true // Indicates token was expired
    }
    return false // Not a token expiration error
  }

  const value: AuthContextType = {
    isAuthenticated,
    token,
    loading,
    login,
    logout,
    handleApiError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

