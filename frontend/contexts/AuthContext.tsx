'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setToken(storedToken)
      // Optimistically set as authenticated, then validate in background
      setIsAuthenticated(true)
      setLoading(false)
      // Validate token in background (don't block UI)
      validateToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Validate token with backend
  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
          'Content-Type': 'application/json',
        },
      })
      console.log(response)
      if (response.ok) {
        // Token is valid, ensure authenticated state
        setIsAuthenticated(true)
        setToken(tokenToValidate)
      } else if (response.status === 401 || response.status === 403) {
        // Only clear token on actual authentication failures (401/403)
        // Don't clear on network errors or other issues
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setIsAuthenticated(false)
      }
      // For other errors (500, network errors, etc.), keep the token
      // User stays logged in - token will be validated on next API call
    } catch (error) {
      // Network errors or fetch failures - don't clear token
      // Keep user logged in, token will be validated on actual API calls
      console.warn('Token validation failed, but keeping user logged in:', error)
    }
  }

  // Login function
  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setIsAuthenticated(true)
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setIsAuthenticated(false)
    router.push('/')
  }

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      setIsAuthenticated(false)
      return false
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      })
      console.log(response)
      if (response.ok) {
        setIsAuthenticated(true)
        setToken(storedToken)
        return true
      } else if (response.status === 401 || response.status === 403) {
        // Only logout on actual authentication failures
        logout()
        return false
      } else {
        // For other errors, assume token is still valid
        setIsAuthenticated(true)
        setToken(storedToken)
        return true
      }
    } catch (error) {
      // Network errors - assume token is still valid
      setIsAuthenticated(true)
      setToken(storedToken)
      return true
    }
  }

  const value: AuthContextType = {
    isAuthenticated,
    token,
    loading,
    login,
    logout,
    checkAuth,
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

