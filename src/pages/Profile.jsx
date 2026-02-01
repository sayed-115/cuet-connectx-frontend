import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import sayedProfile from '../assets/images/sayed.jpg'
import coverDefault from '../assets/images/cover.png'

// Sample member data for following list (same as MemberProfile)
const membersData = {
  1: { id: 1, name: 'Anupam Paul', initials: 'AP', type: 'Student', department: 'CSE', batch: '2022' },
  2: { id: 2, name: 'MD Abu Sayed', initials: 'AS', type: 'Student', department: 'CSE', batch: '2022' },
  3: { id: 3, name: 'Fatima Rahman', initials: 'FR', type: 'Student', department: 'EEE', batch: '2023' },
  4: { id: 4, name: 'Karim Hassan', initials: 'KH', type: 'Student', department: 'ME', batch: '2021' },
  5: { id: 5, name: 'Abir Hassan', initials: 'AH', type: 'Alumni', department: 'CSE', batch: '2018' },
  6: { id: 6, name: 'Fahim Hassan', initials: 'FH', type: 'Alumni', department: 'CSE', batch: '2007' },
  7: { id: 7, name: 'Nusrat Jahan', initials: 'NJ', type: 'Alumni', department: 'CSE', batch: '2019' },
}

function Profile() {
  const { user, isLoggedIn, following, unfollowMember, getFollowers, registeredUsers } = useAuth()
  const navigate = useNavigate()
  const [showShareToast, setShowShareToast] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [followersList, setFollowersList] = useState([])
  const [showCoverMenu, setShowCoverMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  // Check if demo user (Md Abu Sayed)
  const isDemoUser = user?.fullName === 'Md Abu Sayed'
  
  // Image states - only show default images for demo user
  const [coverImage, setCoverImage] = useState(isDemoUser ? coverDefault : null)
  const [profileImage, setProfileImage] = useState(isDemoUser ? sayedProfile : null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  
  // Load followers when modal opens
  useEffect(() => {
    if (showFollowersModal && user) {
      const savedFollowers = localStorage.getItem(`followers_${user.studentId}`)
      if (savedFollowers) {
        setFollowersList(JSON.parse(savedFollowers))
      }
    }
  }, [showFollowersModal, user])
  
  // Get default profile data for a user
  const getDefaultProfileData = (userData) => ({
    about: '',
    email: userData?.email || '',
    address: '',
    socialLinks: {
      linkedin: '',
      github: '',
      facebook: '',
      portfolio: ''
    },
    currentProfession: '',
    previousProfession: '',
    researchInterests: [],
    education: [
      { id: 1, degree: 'Bachelor of Science', institution: 'Chittagong University of Engineering & Technology', year: `${userData?.batch || 2022} - Present`, major: 'Computer Science', focus: '' }
    ],
    skills: [],
    followers: 0
  })

  // Demo user profile data
  const getDemoProfileData = () => ({
    about: 'Passionate computer science student interested in machine learning and web development. Looking for internship opportunities and research collaborations.',
    email: 'u2204115@student.cuet.ac.bd',
    address: 'Dhaka, Bangladesh',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/mdabusayed',
      github: 'https://github.com/mdabusayed',
      facebook: 'https://facebook.com/mdabusayed',
      portfolio: 'https://mdabusayed.dev'
    },
    currentProfession: 'Software Engineering Intern at TechCorp',
    previousProfession: 'Web Developer at StartupXYZ',
    researchInterests: ['Machine Learning', 'Artificial Intelligence', 'Natural Language Processing'],
    education: [
      { id: 1, degree: 'Bachelor of Science in Computer Science', institution: 'Chittagong University of Engineering & Technology', year: '2022 - Present', major: 'Computer Science', focus: 'AI & Machine Learning' },
      { id: 2, degree: 'Higher Secondary Certificate', institution: 'Chittagong College', year: '2020 - 2022', major: 'Science Group', gpa: '5.00' }
    ],
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Structures', 'Algorithms', 'Git'],
    followers: 245
  })

  // Load profile data from localStorage or use defaults
  const loadProfileData = () => {
    if (!user) return getDefaultProfileData(null)
    if (isDemoUser) return getDemoProfileData()
    
    const savedProfile = localStorage.getItem(`profileData_${user.studentId}`)
    if (savedProfile) {
      return JSON.parse(savedProfile)
    }
    return getDefaultProfileData(user)
  }

  // Profile data state
  const [profileData, setProfileData] = useState(loadProfileData)

  // Edit modal states
  const [editModal, setEditModal] = useState({ show: false, section: '', data: null })
  const [addEducationModal, setAddEducationModal] = useState(false)
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '', major: '', focus: '', gpa: '' })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  // Reload profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData(loadProfileData())
      // Also reload images from localStorage for non-demo users
      if (!isDemoUser) {
        const savedCover = localStorage.getItem(`coverImage_${user.studentId}`)
        const savedProfile = localStorage.getItem(`profileImage_${user.studentId}`)
        setCoverImage(savedCover || null)
        setProfileImage(savedProfile || null)
      }
      // Load followers list
      const savedFollowers = localStorage.getItem(`followers_${user.studentId}`)
      if (savedFollowers) {
        setFollowersList(JSON.parse(savedFollowers))
      } else {
        setFollowersList([])
      }
    }
  }, [user?.studentId])

  // Save profile data to localStorage when it changes (for non-demo users)
  useEffect(() => {
    if (user && !isDemoUser) {
      localStorage.setItem(`profileData_${user.studentId}`, JSON.stringify(profileData))
    }
  }, [profileData, user?.studentId, isDemoUser])

  // Save images to localStorage when they change (for non-demo users)
  useEffect(() => {
    if (user && !isDemoUser && coverImage) {
      localStorage.setItem(`coverImage_${user.studentId}`, coverImage)
    }
  }, [coverImage, user?.studentId, isDemoUser])

  useEffect(() => {
    if (user && !isDemoUser && profileImage) {
      localStorage.setItem(`profileImage_${user.studentId}`, profileImage)
      // Dispatch custom event to sync with navbar immediately
      window.dispatchEvent(new Event('profileImageUpdated'))
    }
  }, [profileImage, user?.studentId, isDemoUser])

  // Handle cover image upload
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingCover(true)
    
    // Compress and resize image for better performance
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      // Resize to max 1200px width for cover
      const maxWidth = 1200
      const scale = Math.min(1, maxWidth / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      const compressedImage = canvas.toDataURL('image/jpeg', 0.7)
      setCoverImage(compressedImage)
      setIsUploadingCover(false)
    }
    
    img.onerror = () => {
      alert('Failed to load image. Please try another.')
      setIsUploadingCover(false)
    }
    
    img.src = URL.createObjectURL(file)
  }

  // Handle cover image delete
  const handleCoverDelete = () => {
    setCoverImage(null)
    localStorage.removeItem(`coverImage_${user.studentId}`)
    setShowCoverMenu(false)
  }

  // Handle profile image upload
  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingProfile(true)
    
    // Compress and resize image for better performance
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      // Resize to max 400px for profile pic
      const maxSize = 400
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      const compressedImage = canvas.toDataURL('image/jpeg', 0.8)
      setProfileImage(compressedImage)
      setIsUploadingProfile(false)
    }
    
    img.onerror = () => {
      alert('Failed to load image. Please try another.')
      setIsUploadingProfile(false)
    }
    
    img.src = URL.createObjectURL(file)
  }

  // Handle profile image delete
  const handleProfileDelete = () => {
    setProfileImage(null)
    localStorage.removeItem(`profileImage_${user.studentId}`)
    setShowProfileMenu(false)
    // Dispatch custom event to sync with navbar immediately
    window.dispatchEvent(new Event('profileImageUpdated'))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.fullName} - CUET ConnectX`,
        text: `Check out ${user?.fullName}'s profile on CUET ConnectX`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 3000)
    }
  }

  const openEditModal = (section, data = null) => {
    setEditModal({ show: true, section, data })
  }

  const closeEditModal = () => {
    setEditModal({ show: false, section: '', data: null })
  }

  const handleSaveEdit = (section, newData) => {
    if (section === 'about') {
      setProfileData({ ...profileData, about: newData })
    } else if (section === 'contact') {
      setProfileData({ ...profileData, email: newData.email, address: newData.address })
    } else if (section === 'social') {
      setProfileData({ ...profileData, socialLinks: newData })
    } else if (section === 'professional') {
      setProfileData({ ...profileData, currentProfession: newData.currentProfession, previousProfession: newData.previousProfession, researchInterests: newData.researchInterests })
    } else if (section === 'skills') {
      setProfileData({ ...profileData, skills: newData })
    } else if (section === 'education') {
      const updatedEducation = profileData.education.map(edu => edu.id === newData.id ? newData : edu)
      setProfileData({ ...profileData, education: updatedEducation })
    }
    closeEditModal()
  }

  const handleAddEducation = (e) => {
    e.preventDefault()
    const education = { id: Date.now(), ...newEducation }
    setProfileData({ ...profileData, education: [...profileData.education, education] })
    setNewEducation({ degree: '', institution: '', year: '', major: '', focus: '', gpa: '' })
    setAddEducationModal(false)
  }

  if (!user) return null

  // Get following members data
  const followingMembers = following.map(id => membersData[id]).filter(Boolean)

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen relative">

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowFollowingModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Following ({following.length})</h3>
              <button onClick={() => setShowFollowingModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="overflow-y-auto max-h-96 p-4">
              {followingMembers.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-user-friends text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                  <p className="text-gray-500 dark:text-gray-400">You're not following anyone yet</p>
                  <Link to="/community" className="text-teal-600 hover:text-teal-700 text-sm mt-2 inline-block">
                    Discover members to follow
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {followingMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Link 
                        to={`/member/${member.id}`} 
                        onClick={() => setShowFollowingModal(false)}
                        className="flex items-center gap-3 flex-1"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{member.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.type} • {member.department} • Batch {member.batch}</p>
                        </div>
                      </Link>
                      <button 
                        onClick={() => unfollowMember(member.id)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300 transition-colors"
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowFollowersModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Followers ({followersList.length})</h3>
              <button onClick={() => setShowFollowersModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="overflow-y-auto max-h-96 p-4">
              {followersList.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-users text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                  <p className="text-gray-500 dark:text-gray-400">You don't have any followers yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                    Share your profile to get followers
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followersList.map(followerId => {
                    // Try to find in membersData first, then in registered users
                    const member = Object.values(membersData).find(m => String(m.id) === followerId) 
                    if (member) {
                      return (
                        <div key={followerId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Link 
                            to={`/member/${member.id}`} 
                            onClick={() => setShowFollowersModal(false)}
                            className="flex items-center gap-3 flex-1"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{member.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{member.type} • {member.department} • Batch {member.batch}</p>
                            </div>
                          </Link>
                        </div>
                      )
                    }
                    // Show student ID if member not found in sample data
                    return (
                      <div key={followerId} className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800 dark:text-white">User {followerId}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Student ID: {followerId}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2">
          <i className="fas fa-check-circle"></i> Profile link copied to clipboard!
        </div>
      )}
      
      {/* Cover */}
      <div 
        className="h-48 bg-gradient-to-r from-teal-800 via-teal-600 to-teal-800 relative overflow-hidden"
        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!coverImage && !isUploadingCover && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px'}}></div>
          </div>
        )}
        {isUploadingCover && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
              <p>Uploading...</p>
            </div>
          </div>
        )}
        {/* Cover Image Options Menu */}
        <div className="absolute bottom-4 right-4 z-10">
          <button 
            onClick={() => setShowCoverMenu(!showCoverMenu)}
            className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
          >
            <i className={`fas ${isUploadingCover ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i> 
            {isUploadingCover ? 'Uploading...' : 'Edit Cover'}
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          {showCoverMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[160px]">
              <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors">
                <input 
                  type="file" 
                  onChange={(e) => { handleCoverUpload(e); setShowCoverMenu(false); }} 
                  accept="image/*" 
                  className="hidden"
                  disabled={isUploadingCover}
                />
                <i className="fas fa-upload text-teal-600 dark:text-teal-400"></i>
                <span>Upload Photo</span>
              </label>
              {coverImage && (
                <button 
                  onClick={handleCoverDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                >
                  <i className="fas fa-trash"></i>
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          )}
        </div>
        {/* Click outside to close menu */}
        {showCoverMenu && (
          <div className="fixed inset-0 z-0" onClick={() => setShowCoverMenu(false)}></div>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {isUploadingProfile ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)
                )}
              </div>
              {/* Edit profile pic button */}
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="absolute inset-0 w-28 h-28 rounded-full bg-black/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-10"
              >
                <i className="fas fa-camera text-white text-xl"></i>
              </button>
              {/* Profile Image Options Menu */}
              {showProfileMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[160px] z-50">
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors">
                    <input 
                      type="file" 
                      onChange={(e) => { handleProfileUpload(e); setShowProfileMenu(false); }} 
                      accept="image/*" 
                      className="hidden"
                      disabled={isUploadingProfile}
                    />
                    <i className="fas fa-upload text-teal-600 dark:text-teal-400"></i>
                    <span>Upload Photo</span>
                  </label>
                  {profileImage && (
                    <button 
                      onClick={handleProfileDelete}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              )}
              {/* Click outside to close menu */}
              {showProfileMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
              )}
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>

            {/* Info & Actions Row */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between w-full pt-2 sm:pt-4">
              <div>
                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white heading-font mb-2">{user.fullName}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-semibold">
                    {user.userType === 'student' ? 'Current Student' : 'Alumni'}
                  </span>
                  {user.departmentShort && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      {user.departmentShort}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    Batch {user.batch}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {user.department ? `${user.department} • ` : ''}Student ID: {user.studentId}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 sm:mt-0">
                <button 
                  onClick={() => openEditModal('profile')}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
                <button 
                  onClick={handleShare}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  <i className="fas fa-share-alt"></i> Share
                </button>
              </div>
            </div>
          </div>

          {/* Followers & Following */}
          <div className="mt-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 group"
              onClick={() => setShowFollowersModal(true)}
            >
              <i className="fas fa-users text-teal-600 dark:text-teal-400"></i>
              <span className="font-bold text-gray-800 dark:text-white">{followersList.length}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Followers</span>
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 group"
              onClick={() => setShowFollowingModal(true)}
            >
              <i className="fas fa-user-plus text-teal-600 dark:text-teal-400"></i>
              <span className="font-bold text-gray-800 dark:text-white">{following.length}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Following</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6 pb-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">About</h3>
                <button onClick={() => openEditModal('about', profileData.about)} className="text-gray-400 hover:text-teal-600 transition-colors">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {profileData.about}
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Contact Information</h3>
                <button onClick={() => openEditModal('contact', { email: profileData.email, address: profileData.address })} className="text-gray-400 hover:text-teal-600 transition-colors">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-envelope text-gray-400 mt-1"></i>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${profileData.email}`} className="text-teal-600 hover:underline text-sm">{profileData.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="fas fa-map-marker-alt text-gray-400 mt-1"></i>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{profileData.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Social Links</h3>
                <button onClick={() => openEditModal('social', profileData.socialLinks)} className="text-gray-400 hover:text-teal-600 transition-colors">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
              <div className="space-y-3">
                {profileData.socialLinks.linkedin && (
                  <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors">
                    <i className="fab fa-linkedin text-blue-600"></i>
                    <span className="text-sm">LinkedIn Profile</span>
                  </a>
                )}
                {profileData.socialLinks.github && (
                  <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors">
                    <i className="fab fa-github text-gray-800 dark:text-gray-200"></i>
                    <span className="text-sm">GitHub Profile</span>
                  </a>
                )}
                {profileData.socialLinks.facebook && (
                  <a href={profileData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors">
                    <i className="fab fa-facebook text-blue-500"></i>
                    <span className="text-sm">Facebook Profile</span>
                  </a>
                )}
                {profileData.socialLinks.portfolio && (
                  <a href={profileData.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors">
                    <i className="fas fa-globe text-teal-600"></i>
                    <span className="text-sm">Portfolio Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Professional Information</h3>
                <button onClick={() => openEditModal('professional', { currentProfession: profileData.currentProfession, previousProfession: profileData.previousProfession, researchInterests: profileData.researchInterests })} className="text-gray-400 hover:text-teal-600 transition-colors">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-teal-600 mb-1">
                    <i className="fas fa-briefcase"></i>
                    <span className="font-medium text-sm">Current Profession</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm ml-6">{profileData.currentProfession}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <i className="fas fa-history"></i>
                    <span className="font-medium text-sm">Previous Profession</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm ml-6">{profileData.previousProfession}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <i className="fas fa-flask"></i>
                    <span className="font-medium text-sm">Research Interests</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-6">
                    {profileData.researchInterests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-gray-600">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Education</h3>
                <button onClick={() => setAddEducationModal(true)} className="text-gray-400 hover:text-teal-600 transition-colors">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <div className="space-y-6">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-graduation-cap text-teal-600"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{edu.degree}</h4>
                          <p className="text-teal-600 text-sm">{edu.institution}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{edu.year}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Major: {edu.major} {edu.focus && `| Focus: ${edu.focus}`} {edu.gpa && `| GPA: ${edu.gpa}`}
                          </p>
                        </div>
                        <button onClick={() => openEditModal('education', edu)} className="text-gray-400 hover:text-teal-600 transition-colors">
                          <i className="fas fa-external-link-alt text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Skills</h3>
                <button onClick={() => openEditModal('skills', profileData.skills)} className="text-gray-400 hover:text-teal-600 transition-colors">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-gray-600">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.show && (
        <EditModal 
          section={editModal.section} 
          data={editModal.data} 
          onClose={closeEditModal} 
          onSave={handleSaveEdit} 
        />
      )}

      {/* Add Education Modal */}
      {addEducationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Education</h2>
              <button onClick={() => setAddEducationModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleAddEducation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree *</label>
                <input type="text" required value={newEducation.degree} onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})} className="input-professional" placeholder="e.g. Bachelor of Science in Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution *</label>
                <input type="text" required value={newEducation.institution} onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})} className="input-professional" placeholder="e.g. Chittagong University of Engineering & Technology" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
                  <input type="text" required value={newEducation.year} onChange={(e) => setNewEducation({...newEducation, year: e.target.value})} className="input-professional" placeholder="e.g. 2020 - 2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major</label>
                  <input type="text" value={newEducation.major} onChange={(e) => setNewEducation({...newEducation, major: e.target.value})} className="input-professional" placeholder="e.g. Computer Science" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Focus Area</label>
                  <input type="text" value={newEducation.focus} onChange={(e) => setNewEducation({...newEducation, focus: e.target.value})} className="input-professional" placeholder="e.g. AI & ML" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GPA</label>
                  <input type="text" value={newEducation.gpa} onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})} className="input-professional" placeholder="e.g. 3.85" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddEducationModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Education</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Edit Modal Component
function EditModal({ section, data, onClose, onSave }) {
  const [formData, setFormData] = useState(data)
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(section, formData)
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData([...formData, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (idx) => {
    setFormData(formData.filter((_, i) => i !== idx))
  }

  const addInterest = () => {
    if (interestInput.trim()) {
      setFormData({ ...formData, researchInterests: [...formData.researchInterests, interestInput.trim()] })
      setInterestInput('')
    }
  }

  const removeInterest = (idx) => {
    setFormData({ ...formData, researchInterests: formData.researchInterests.filter((_, i) => i !== idx) })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">Edit {section}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {section === 'about' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About</label>
              <textarea rows={4} value={formData} onChange={(e) => setFormData(e.target.value)} className="input-professional" placeholder="Tell us about yourself..." />
            </div>
          )}

          {section === 'contact' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input-professional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="input-professional" />
              </div>
            </>
          )}

          {section === 'social' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                <input type="url" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className="input-professional" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                <input type="url" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} className="input-professional" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                <input type="url" value={formData.facebook} onChange={(e) => setFormData({...formData, facebook: e.target.value})} className="input-professional" placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio URL</label>
                <input type="url" value={formData.portfolio} onChange={(e) => setFormData({...formData, portfolio: e.target.value})} className="input-professional" placeholder="https://yoursite.com" />
              </div>
            </>
          )}

          {section === 'professional' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Profession</label>
                <input type="text" value={formData.currentProfession} onChange={(e) => setFormData({...formData, currentProfession: e.target.value})} className="input-professional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous Profession</label>
                <input type="text" value={formData.previousProfession} onChange={(e) => setFormData({...formData, previousProfession: e.target.value})} className="input-professional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Research Interests</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())} className="input-professional flex-1" placeholder="Add interest..." />
                  <button type="button" onClick={addInterest} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.researchInterests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-2">
                      {interest}
                      <button type="button" onClick={() => removeInterest(idx)} className="text-red-500 hover:text-red-700"><i className="fas fa-times text-xs"></i></button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {section === 'skills' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="input-professional flex-1" placeholder="Add skill..." />
                <button type="button" onClick={addSkill} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-2">
                    {skill}
                    <button type="button" onClick={() => removeSkill(idx)} className="text-red-500 hover:text-red-700"><i className="fas fa-times text-xs"></i></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {section === 'education' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree</label>
                <input type="text" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} className="input-professional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
                <input type="text" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} className="input-professional" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="input-professional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major</label>
                  <input type="text" value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="input-professional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Focus</label>
                  <input type="text" value={formData.focus || ''} onChange={(e) => setFormData({...formData, focus: e.target.value})} className="input-professional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GPA</label>
                  <input type="text" value={formData.gpa || ''} onChange={(e) => setFormData({...formData, gpa: e.target.value})} className="input-professional" />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" className="flex-1 btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
