import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import cuetLogo from '../assets/logos/CUET_Vector_Logo.svg.png'
import sayedProfile from '../assets/images/sayed.jpg'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, isLoggedIn, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [profileImage, setProfileImage] = useState(null)

  // Check if demo user
  const isDemoUser = user?.fullName === 'Md Abu Sayed'

  // Load profile image from localStorage
  useEffect(() => {
    if (user && !isDemoUser) {
      const savedImage = localStorage.getItem(`profileImage_${user.studentId}`)
      setProfileImage(savedImage)
    } else if (isDemoUser) {
      setProfileImage(sayedProfile)
    } else {
      setProfileImage(null)
    }
  }, [user?.studentId, isDemoUser])

  // Listen for storage changes (when profile image is updated)
  useEffect(() => {
    const handleStorageChange = () => {
      if (user && !isDemoUser) {
        const savedImage = localStorage.getItem(`profileImage_${user.studentId}`)
        setProfileImage(savedImage)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Listen for custom profile image update event (for same-tab updates)
    window.addEventListener('profileImageUpdated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileImageUpdated', handleStorageChange)
    }
  }, [user?.studentId, isDemoUser])

  const navLinks = [
    { to: '/', label: 'Home', icon: 'fa-home' },
    { to: '/jobs', label: 'Jobs', icon: 'fa-briefcase' },
    { to: '/scholarships', label: 'Scholarships', icon: 'fa-graduation-cap' },
    { to: '/community', label: 'Community', icon: 'fa-users' },
    { to: '/about', label: 'About', icon: 'fa-info-circle' },
  ]

  const getNavLinkClass = (isActive) => {
    return isActive 
      ? 'font-medium transition-all duration-200 text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 pb-1' 
      : 'font-medium transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 border-b-2 border-transparent pb-1'
  }

  return (
    <nav className="glass border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img src={cuetLogo} alt="CUET Logo" className="h-11 w-11 object-contain logo-glow transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -inset-1 bg-teal-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl heading-font text-teal-800 dark:text-teal-400 leading-tight">CUET ConnectX</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 tracking-wider uppercase">Alumni Network</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => 
                `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive 
                  ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`
              }>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 border border-gray-200 dark:border-gray-600 flex items-center justify-center"
              aria-label="Toggle theme"
            >
              <i className={`fas ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-teal-600'} text-lg w-5 h-5 flex items-center justify-center`}></i>
            </button>

            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                  {profileImage ? (
                    <img src={profileImage} alt="User" className="w-9 h-9 rounded-full border-2 border-teal-500 object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full border-2 border-teal-500 bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:block font-medium text-gray-700 dark:text-gray-300">{user?.fullName || 'User'}</span>
                  <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 py-2 animate-fade-in-up">
                    <div className="px-4 py-3 border-b dark:border-gray-700">
                      <p className="font-semibold text-gray-800 dark:text-white">{user?.fullName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <i className="fas fa-user-circle text-teal-600"></i> My Profile
                    </Link>
                    <Link to="/" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      <i className="fas fa-cog text-gray-500"></i> Settings
                    </Link>
                    <hr className="my-2 dark:border-gray-700" />
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-5 py-2.5 text-teal-700 dark:text-teal-400 font-medium rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all duration-200">Login</Link>
                <Link to="/signup" className="btn-primary">Get Started</Link>
              </div>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="block py-2 text-gray-600 dark:text-gray-300 hover:text-teal-600">
                {link.label}
              </NavLink>
            ))}
            {!isLoggedIn && (
              <div className="flex gap-2 mt-4">
                <Link to="/login" className="flex-1 text-center py-2 border border-teal-600 text-teal-600 rounded-lg">Login</Link>
                <Link to="/signup" className="flex-1 text-center py-2 bg-teal-600 text-white rounded-lg">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
