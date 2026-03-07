import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authAPI.getMe()
          if (response.success) {
            setUser(response.user)
            setIsLoggedIn(true)
          }
        } catch (error) {
          console.log('Token expired or invalid')
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  // Listen for forced logout events (e.g., token expired)
  useEffect(() => {
    const handleForcedLogout = (event) => {
      console.log('Session expired, logging out...', event.detail?.reason)
      setUser(null)
      setIsLoggedIn(false)
    }
    window.addEventListener('auth:logout', handleForcedLogout)
    return () => window.removeEventListener('auth:logout', handleForcedLogout)
  }, [])

  // Register a new user
  const register = async (userData) => {
    try {
      const response = await authAPI.register({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        studentId: userData.studentId,
        batch: userData.batch,
        department: userData.department,
        departmentShort: userData.departmentShort,
        userType: userData.userType,
      })

      if (response.success) {
        localStorage.setItem('token', response.token)
        setUser(response.user)
        setIsLoggedIn(true)
        return { success: true }
      }
      return { success: false, error: 'Registration failed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Login with credentials
  const login = async (studentIdOrEmail, password) => {
    try {
      const isEmail = studentIdOrEmail.includes('@')
      const response = await authAPI.login({
        ...(isEmail ? { email: studentIdOrEmail } : { studentId: studentIdOrEmail }),
        password,
      })

      if (response.success) {
        localStorage.setItem('token', response.token)
        setUser(response.user)
        setIsLoggedIn(true)
        return { success: true }
      }
      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update user state (merge partial fields)
  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsLoggedIn(false)
  }

  // Check if the logged-in user follows a given user ID
  const isFollowingMember = (targetId) => {
    if (!user || !user.following) return false
    return user.following.some(f => {
      const fId = typeof f === 'object' && f !== null ? (f._id || f) : f
      return String(fId) === String(targetId)
    })
  }

  // Follow a user via API — returns full response for callers
  const followUser = async (targetUserId) => {
    try {
      const response = await usersAPI.follow(targetUserId)
      if (response.success) {
        setUser(prev => ({ ...prev, following: response.user.following }))
        return response
      }
    } catch (error) {
      console.error('Error following user:', error)
      throw error
    }
  }

  // Unfollow a user via API — returns full response for callers
  const unfollowUser = async (targetUserId) => {
    try {
      const response = await usersAPI.unfollow(targetUserId)
      if (response.success) {
        setUser(prev => ({ ...prev, following: response.user.following }))
        return response
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn,
      loading,
      login, 
      logout, 
      register, 
      updateUser,
      isFollowingMember,
      followUser,
      unfollowUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
