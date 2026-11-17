import { createContext, useContext, useState, useEffect } from 'react'
import {
  getCurrentUser,
  loginUser as apiLogin,
  logoutUser as apiLogout,
  registerUser as apiRegister,
  updateProfile as apiUpdateProfile,
} from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // Fetch logged in user details on initial load
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await getCurrentUser()
        if (response?.data) {
          setUser(response.data)
        } else {
          // Token is invalid/expired
          localStorage.removeItem('token')
          setUser(null)
          setToken(null)
        }
      } catch (err) {
        console.warn('Session expired or user not logged in:', err.message)
        localStorage.removeItem('token')
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (credentials) => {
    const res = await apiLogin(credentials)
    if (res?.data?.accessToken) {
      setToken(res.data.accessToken)
      localStorage.setItem('token', res.data.accessToken)
    }
    if (res?.data?.user) {
      setUser(res.data.user)
    }
    return res
  }

  const register = async (userData) => {
    return await apiRegister(userData)
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (err) {
      console.warn('Logout API error:', err)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setToken(null)
    }
  }

  const updateUser = async (profileData) => {
    const res = await apiUpdateProfile(profileData)
    if (res?.data) {
      setUser(res.data)
    }
    return res
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
