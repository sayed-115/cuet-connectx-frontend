import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

// Demo user data (fallback for offline mode)
const DEMO_USER = {
  fullName: 'Md Abu Sayed',
  studentId: '2204115',
  email: 'u2204115@student.cuet.ac.bd',
  password: 'demo1234',
  userType: 'current student',
  batch: 2022,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [useBackend, setUseBackend] = useState(true) // Toggle for backend vs localStorage

  useEffect(() => {
    // Check for existing token and load user
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token && useBackend) {
        try {
          const response = await authAPI.getMe()
          if (response.success) {
            setUser(response.user)
            setIsLoggedIn(true)
            loadFollowData(response.user.studentId)
          }
        } catch (error) {
          console.log('Token expired or invalid, falling back to localStorage')
          localStorage.removeItem('token')
          loadFromLocalStorage()
        }
      } else {
        loadFromLocalStorage()
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

  const loadFromLocalStorage = () => {
    const savedUser = localStorage.getItem('currentUser')
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (savedUser && loggedIn) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setIsLoggedIn(true)
      loadFollowData(parsedUser.studentId)
    }
    
    // Load registered users
    const savedUsers = localStorage.getItem('registeredUsers')
    if (savedUsers) {
      setRegisteredUsers(JSON.parse(savedUsers))
    } else {
      const initialUsers = [DEMO_USER]
      localStorage.setItem('registeredUsers', JSON.stringify(initialUsers))
      setRegisteredUsers(initialUsers)
    }
  }

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
    if (useBackend) {
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
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
    
    // Fallback to localStorage
    const existingUser = registeredUsers.find(u => u.studentId === userData.studentId)
    if (existingUser) {
      return { success: false, error: 'Student ID already registered' }
    }
    
    const emailExists = registeredUsers.find(u => u.email === userData.email)
    if (emailExists) {
      return { success: false, error: 'Email already registered' }
    }
    
    const newUsers = [...registeredUsers, userData]
    localStorage.setItem('registeredUsers', JSON.stringify(newUsers))
    setRegisteredUsers(newUsers)
    
    const { password, ...userWithoutPassword } = userData
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
    localStorage.setItem('isLoggedIn', 'true')
    setUser(userWithoutPassword)
    setIsLoggedIn(true)
    
    return { success: true }
  }

  // Login with credentials
  const login = async (studentIdOrEmail, password) => {
    if (useBackend) {
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
      } catch (error) {
        console.log('Backend login failed, trying localStorage:', error.message)
        // Fall through to localStorage login
      }
    }
    
    // Fallback to localStorage
    const foundUser = registeredUsers.find(u => 
      (u.studentId === studentIdOrEmail || u.email === studentIdOrEmail) && u.password === password
    )
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
      localStorage.setItem('isLoggedIn', 'true')
      setUser(userWithoutPassword)
      setIsLoggedIn(true)
      loadFollowData(userWithoutPassword.studentId)
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  // Update user profile
  const updateUser = async (updatedData) => {
    const updatedUser = { ...user, ...updatedData }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setUser(updatedUser)
    
    // Also update in registered users (localStorage fallback)
    const updatedUsers = registeredUsers.map(u => 
      u.studentId === user.studentId ? { ...u, ...updatedData } : u
    )
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers))
    setRegisteredUsers(updatedUsers)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isLoggedIn')
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
