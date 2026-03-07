import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])

  useEffect(() => {
    // Check for existing token and load user
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authAPI.getMe()
          if (response.success) {
            setUser(response.user)
            setIsLoggedIn(true)
            loadFollowData(response.user.studentId)
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
      setFollowing([])
      setFollowers([])
    }

    window.addEventListener('auth:logout', handleForcedLogout)
    return () => window.removeEventListener('auth:logout', handleForcedLogout)
  }, [])

  const loadFollowData = (studentId) => {
    const savedFollowing = localStorage.getItem(`following_${studentId}`)
    if (savedFollowing) {
      setFollowing(JSON.parse(savedFollowing))
    }
    const savedFollowers = localStorage.getItem(`followers_${studentId}`)
    if (savedFollowers) {
      setFollowers(JSON.parse(savedFollowers))
    }
  }

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
        loadFollowData(response.user.studentId)
        return { success: true }
      }
      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update user profile
  const updateUser = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsLoggedIn(false)
    setFollowing([])
    setFollowers([])
  }

  // Follow a member - also add current user to member's followers
  const followMember = (memberId) => {
    if (!user) return
    const memberIdStr = String(memberId)
    if (!following.includes(memberIdStr)) {
      const newFollowing = [...following, memberIdStr]
      setFollowing(newFollowing)
      localStorage.setItem(`following_${user.studentId}`, JSON.stringify(newFollowing))
      
      // Add current user to the member's followers list
      const memberFollowers = JSON.parse(localStorage.getItem(`followers_${memberIdStr}`) || '[]')
      if (!memberFollowers.includes(user.studentId)) {
        memberFollowers.push(user.studentId)
        localStorage.setItem(`followers_${memberIdStr}`, JSON.stringify(memberFollowers))
      }
    }
  }

  // Unfollow a member - also remove current user from member's followers
  const unfollowMember = (memberId) => {
    if (!user) return
    const memberIdStr = String(memberId)
    const newFollowing = following.filter(id => id !== memberIdStr)
    setFollowing(newFollowing)
    localStorage.setItem(`following_${user.studentId}`, JSON.stringify(newFollowing))
    
    // Remove current user from the member's followers list
    const memberFollowers = JSON.parse(localStorage.getItem(`followers_${memberIdStr}`) || '[]')
    const updatedFollowers = memberFollowers.filter(id => id !== user.studentId)
    localStorage.setItem(`followers_${memberIdStr}`, JSON.stringify(updatedFollowers))
  }

  // Check if following a member
  const isFollowingMember = (memberId) => {
    return following.includes(String(memberId))
  }

  // Get following list
  const getFollowingList = () => following

  // Get followers list - reload from localStorage to get latest
  const getFollowers = () => {
    if (!user) return []
    const savedFollowers = localStorage.getItem(`followers_${user.studentId}`)
    return savedFollowers ? JSON.parse(savedFollowers) : []
  }

  // Refresh followers from localStorage
  const refreshFollowers = () => {
    if (user) {
      const savedFollowers = localStorage.getItem(`followers_${user.studentId}`)
      if (savedFollowers) {
        setFollowers(JSON.parse(savedFollowers))
      }
    }
  }

  const followUser = async (targetUserId) => {
    try {
      const response = await usersAPI.follow(targetUserId);
      if (response.success) {
        setFollowing(response.user.following);
        setFollowers(response.targetUser.followers);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async (targetUserId) => {
    try {
      const response = await usersAPI.unfollow(targetUserId);
      if (response.success) {
        setFollowing(response.user.following);
        setFollowers(response.targetUser.followers);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn,
      loading,
      login, 
      logout, 
      register, 
      updateUser,
      following,
      followers,
      followMember,
      unfollowMember,
      isFollowingMember,
      getFollowingList,
      getFollowers,
      refreshFollowers,
      followUser,
      unfollowUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
