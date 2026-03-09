import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import coverDefault from '../assets/images/cover.png'
import { usersAPI } from '../services/api'

function Profile() {
  const { user, isLoggedIn, unfollowUser, updateUser } = useAuth()
  const navigate = useNavigate()

  // UI states
  const [showShareToast, setShowShareToast] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showCoverMenu, setShowCoverMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Profile data (fetched from backend)
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Image states
  const [coverImage, setCoverImage] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)

  // Edit modal state
  const [editModal, setEditModal] = useState({ show: false, section: '', data: null })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/login')
  }, [isLoggedIn, navigate])

  // Fetch profile data from backend
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const res = await usersAPI.getProfile()
      if (res.success && res.user) {
        setProfileData(res.user)
        setProfileImage(res.user.profileImage || null)
        setCoverImage(res.user.coverImage || null)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchProfile()
  }, [isLoggedIn, fetchProfile])

  // Show toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Save a section to backend
  const handleSaveSection = async (section, data) => {
    setSaving(true)
    try {
      let payload = {}
      switch (section) {
        case 'about':
          payload = { about: data }
          break
        case 'contact':
          payload = { contactEmail: data.contactEmail, phone: data.phone, address: data.address }
          break
        case 'social':
          payload = { socialLinks: data }
          break
        case 'professional':
          payload = { currentProfession: data.currentProfession, previousProfession: data.previousProfession, researchInterests: data.researchInterests }
          break
        case 'skills':
          payload = { skills: data }
          break
        case 'education':
          payload = { education: data }
          break
        default:
          break
      }
      const res = await usersAPI.updateProfile(payload)
      if (res.success) {
        setProfileData(res.user)
        updateUser(payload)
        showToast('Profile updated successfully!')
      }
    } catch (err) {
      console.error('Save failed:', err)
      showToast(err.message || 'Failed to save changes', 'error')
    } finally {
      setSaving(false)
      setEditModal({ show: false, section: '', data: null })
    }
  }

  // Image upload handlers
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('coverImage', file)
      const res = await usersAPI.uploadImage(formData)
      if (res.success && res.user) {
        const imgUrl = res.user.coverImage
        setCoverImage(imgUrl)
        setProfileData(prev => ({ ...prev, coverImage: imgUrl }))
        updateUser({ coverImage: imgUrl })
        showToast('Cover image updated!')
      }
    } catch (err) {
      console.error('Cover image upload failed:', err)
      showToast(err.message || 'Failed to upload image', 'error')
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleCoverDelete = () => {
    setCoverImage(null)
    setShowCoverMenu(false)
    updateUser({ coverImage: null })
  }

  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingProfile(true)
    try {
      const formData = new FormData()
      formData.append('profileImage', file)
      const res = await usersAPI.uploadImage(formData)
      if (res.success && res.user) {
        const imgUrl = res.user.profileImage
        setProfileImage(imgUrl)
        setProfileData(prev => ({ ...prev, profileImage: imgUrl }))
        updateUser({ profileImage: imgUrl })
        showToast('Profile image updated!')
      }
    } catch (err) {
      console.error('Profile image upload failed:', err)
      showToast(err.message || 'Failed to upload image', 'error')
    } finally {
      setIsUploadingProfile(false)
    }
  }

  const handleProfileDelete = async () => {
    setProfileImage(null)
    setShowProfileMenu(false)
    updateUser({ profileImage: null })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${user?.fullName} - CUET ConnectX`, text: `Check out ${user?.fullName}'s profile on CUET ConnectX`, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 3000)
    }
  }

  const openEditModal = (section) => {
    if (!profileData) return
    let data
    switch (section) {
      case 'about': data = profileData.about || ''; break
      case 'contact': data = { contactEmail: profileData.contactEmail || profileData.email || '', phone: profileData.phone || '', address: profileData.address || '' }; break
      case 'social': data = { linkedin: profileData.socialLinks?.linkedin || '', github: profileData.socialLinks?.github || '', facebook: profileData.socialLinks?.facebook || '', portfolio: profileData.socialLinks?.portfolio || '' }; break
      case 'professional': data = { currentProfession: profileData.currentProfession || '', previousProfession: profileData.previousProfession || '', researchInterests: profileData.researchInterests || [] }; break
      case 'skills': data = [...(profileData.skills || [])]; break
      case 'education': data = (profileData.education || []).map(e => ({ ...e })); break
      default: data = null
    }
    setEditModal({ show: true, section, data })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!passwordData.currentPassword) errs.currentPassword = 'Current password is required'
    if (!passwordData.newPassword) errs.newPassword = 'New password is required'
    else if (passwordData.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters'
    if (passwordData.newPassword !== passwordData.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setPasswordErrors(errs)
    if (Object.keys(errs).length > 0) return

    setChangingPassword(true)
    try {
      await usersAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      showToast('Password changed successfully! Please login again.')
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      showToast(err.message || 'Failed to change password', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  // Loading state — show before any access to `user`
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-teal-600 mb-4"></i>
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error && !profileData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={fetchProfile} className="btn-primary px-6 py-2">Retry</button>
        </div>
      </div>
    )
  }

  if (!user) return null

  const pd = profileData || {}

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen relative">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i> {toast.message}
        </div>
      )}

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2">
          <i className="fas fa-check-circle"></i> Profile link copied to clipboard!
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <FollowModal
          title={`Following (${pd.following?.length || 0})`}
          items={pd.following || []}
          onClose={() => setShowFollowingModal(false)}
          emptyText="You're not following anyone yet"
          unfollowMember={unfollowUser}
        />
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <FollowModal
          title={`Followers (${pd.followers?.length || 0})`}
          items={(pd.followers || []).map(f => typeof f === 'object' ? f : null).filter(Boolean)}
          isFollowerMode
          onClose={() => setShowFollowersModal(false)}
          emptyText="You don't have any followers yet"
        />
      )}

      {/* Cover */}
      <div
        className="h-48 bg-gradient-to-r from-teal-800 via-teal-600 to-teal-800 relative overflow-hidden"
        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!coverImage && !isUploadingCover && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
          </div>
        )}
        {isUploadingCover && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center"><i className="fas fa-spinner fa-spin text-3xl mb-2"></i><p>Uploading...</p></div>
          </div>
        )}
        <div className="absolute bottom-4 right-4 z-10">
          <button onClick={() => setShowCoverMenu(!showCoverMenu)} className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2">
            <i className={`fas ${isUploadingCover ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
            {isUploadingCover ? 'Uploading...' : 'Edit Cover'}
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          {showCoverMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[160px]">
              <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors">
                <input type="file" onChange={(e) => { handleCoverUpload(e); setShowCoverMenu(false) }} accept="image/*" className="hidden" disabled={isUploadingCover} />
                <i className="fas fa-upload text-teal-600 dark:text-teal-400"></i><span>Upload Photo</span>
              </label>
              {coverImage && (
                <button onClick={handleCoverDelete} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                  <i className="fas fa-trash"></i><span>Remove Photo</span>
                </button>
              )}
            </div>
          )}
        </div>
        {showCoverMenu && <div className="fixed inset-0 z-0" onClick={() => setShowCoverMenu(false)}></div>}
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
                  (user?.fullName || '?').split(' ').map(n => n[0]).join('').substring(0, 2)
                )}
              </div>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="absolute inset-0 w-28 h-28 rounded-full bg-black/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-10">
                <i className="fas fa-camera text-white text-xl"></i>
              </button>
              {showProfileMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[160px] z-50">
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors">
                    <input type="file" onChange={(e) => { handleProfileUpload(e); setShowProfileMenu(false) }} accept="image/*" className="hidden" disabled={isUploadingProfile} />
                    <i className="fas fa-upload text-teal-600 dark:text-teal-400"></i><span>Upload Photo</span>
                  </label>
                  {profileImage && (
                    <button onClick={handleProfileDelete} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                      <i className="fas fa-trash"></i><span>Remove Photo</span>
                    </button>
                  )}
                </div>
              )}
              {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between w-full pt-2 sm:pt-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white heading-font mb-2">{user.fullName}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-semibold">{user.userType === 'student' ? 'Current Student' : 'Alumni'}</span>
                  {user.departmentShort && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">{user.departmentShort}</span>}
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">Batch {user.batch}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{user.department ? `${user.department} • ` : ''}Student ID: {user.studentId}</p>
              </div>
              <div className="flex gap-2 mt-3 sm:mt-0">
                <button onClick={handleShare} className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
                  <i className="fas fa-share-alt"></i> Share
                </button>
              </div>
            </div>
          </div>

          {/* Followers / Following */}
          <div className="mt-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 group" onClick={() => setShowFollowersModal(true)}>
              <i className="fas fa-users text-teal-600 dark:text-teal-400"></i>
              <span className="font-bold text-gray-800 dark:text-white">{pd.followers?.length || 0}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Followers</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 group" onClick={() => setShowFollowingModal(true)}>
              <i className="fas fa-user-plus text-teal-600 dark:text-teal-400"></i>
              <span className="font-bold text-gray-800 dark:text-white">{pd.following?.length || 0}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Following</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6 pb-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About */}
            <SectionCard title="About" icon="fa-user" onEdit={() => openEditModal('about')}>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{pd.about || <span className="italic text-gray-400">No bio added yet. Click edit to add one.</span>}</p>
            </SectionCard>

            {/* Contact Information */}
            <SectionCard title="Contact Information" icon="fa-address-card" onEdit={() => openEditModal('contact')}>
              <div className="space-y-4">
                <ContactRow icon="fa-envelope" label="Email" value={pd.contactEmail || pd.email} href={`mailto:${pd.contactEmail || pd.email}`} />
                <ContactRow icon="fa-phone" label="Phone" value={pd.phone} />
                <ContactRow icon="fa-map-marker-alt" label="Address" value={pd.address} />
              </div>
            </SectionCard>

            {/* Social Links */}
            <SectionCard title="Social Links" icon="fa-link" onEdit={() => openEditModal('social')}>
              <div className="space-y-3">
                <SocialLink url={pd.socialLinks?.linkedin} icon="fab fa-linkedin" color="text-blue-600" label="LinkedIn" />
                <SocialLink url={pd.socialLinks?.github} icon="fab fa-github" color="text-gray-800 dark:text-gray-200" label="GitHub" />
                <SocialLink url={pd.socialLinks?.facebook} icon="fab fa-facebook" color="text-blue-500" label="Facebook" />
                <SocialLink url={pd.socialLinks?.portfolio} icon="fas fa-globe" color="text-teal-600" label="Portfolio" />
                {!pd.socialLinks?.linkedin && !pd.socialLinks?.github && !pd.socialLinks?.facebook && !pd.socialLinks?.portfolio && (
                  <p className="text-gray-400 dark:text-gray-500 text-sm italic">No social links added yet.</p>
                )}
              </div>
            </SectionCard>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <i className="fas fa-lock text-teal-600 text-base"></i>Security
                </h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Manage your account security settings.</p>
              <button
                onClick={() => { setShowPasswordModal(true); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordErrors({}) }}
                className="w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <i className="fas fa-key"></i> Change Password
              </button>
            </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Information */}
            <SectionCard title="Professional Information" icon="fa-briefcase" onEdit={() => openEditModal('professional')}>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-teal-600 mb-1"><i className="fas fa-briefcase"></i><span className="font-medium text-sm">Current Profession</span></div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm ml-6">{pd.currentProfession || <span className="italic text-gray-400">Not specified</span>}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1"><i className="fas fa-history"></i><span className="font-medium text-sm">Previous Profession</span></div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm ml-6">{pd.previousProfession || <span className="italic text-gray-400">Not specified</span>}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-2"><i className="fas fa-flask"></i><span className="font-medium text-sm">Research Interests</span></div>
                  <div className="flex flex-wrap gap-2 ml-6">
                    {(pd.researchInterests || []).length > 0 ? pd.researchInterests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-gray-600">{interest}</span>
                    )) : <span className="italic text-gray-400 text-sm">No research interests added.</span>}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Education */}
            <SectionCard title="Education" icon="fa-graduation-cap" onEdit={() => openEditModal('education')}>
              <div className="space-y-6">
                {(pd.education || []).length > 0 ? pd.education.map((edu, idx) => (
                  <div key={edu._id || idx} className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-graduation-cap text-teal-600"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{edu.degree}</h4>
                      <p className="text-teal-600 text-sm">{edu.institution}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{edu.year}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {edu.major && `Major: ${edu.major}`}{edu.focus && ` | Focus: ${edu.focus}`}{edu.gpa && ` | GPA: ${edu.gpa}`}
                      </p>
                    </div>
                  </div>
                )) : <p className="italic text-gray-400 text-sm">No education entries added yet.</p>}
              </div>
            </SectionCard>

            {/* Skills */}
            <SectionCard title="Skills" icon="fa-tools" onEdit={() => openEditModal('skills')}>
              <div className="flex flex-wrap gap-2">
                {(pd.skills || []).length > 0 ? pd.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs border border-gray-200 dark:border-gray-600">{skill}</span>
                )) : <p className="italic text-gray-400 text-sm">No skills added yet.</p>}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-key text-teal-600"></i> Change Password
              </h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="input-professional" placeholder="Enter current password" />
                {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-professional" placeholder="Enter new password" />
                {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-professional" placeholder="Confirm new password" />
                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 btn-secondary" disabled={changingPassword}>Cancel</button>
                <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2" disabled={changingPassword}>
                  {changingPassword && <i className="fas fa-spinner fa-spin"></i>}
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <EditModal
          section={editModal.section}
          data={editModal.data}
          onClose={() => setEditModal({ show: false, section: '', data: null })}
          onSave={handleSaveSection}
          saving={saving}
        />
      )}
    </div>
  )
}

/* ================== Sub-components ================== */

function SectionCard({ title, icon, onEdit, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <i className={`fas ${icon} text-teal-600 text-base`}></i>{title}
        </h3>
        <button onClick={onEdit} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors" title={`Edit ${title}`}>
          <i className="fas fa-pen text-sm"></i>
        </button>
      </div>
      {children}
    </div>
  )
}

function ContactRow({ icon, label, value, href }) {
  if (!value) return (
    <div className="flex items-start gap-3">
      <i className={`fas ${icon} text-gray-400 mt-1`}></i>
      <div><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p><p className="text-gray-400 text-sm italic">Not provided</p></div>
    </div>
  )
  return (
    <div className="flex items-start gap-3">
      <i className={`fas ${icon} text-gray-400 mt-1`}></i>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {href ? <a href={href} className="text-teal-600 hover:underline text-sm">{value}</a> : <p className="text-gray-700 dark:text-gray-300 text-sm">{value}</p>}
      </div>
    </div>
  )
}

function SocialLink({ url, icon, color, label }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-teal-600 transition-colors">
      <i className={`${icon} ${color}`}></i><span className="text-sm">{label}</span>
    </a>
  )
}

function FollowModal({ title, items, onClose, emptyText, unfollowMember, isFollowerMode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><i className="fas fa-times text-xl"></i></button>
        </div>
        <div className="overflow-y-auto max-h-96 p-4">
          {(!items || items.length === 0) ? (
            <div className="text-center py-8">
              <i className="fas fa-user-friends text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
              <p className="text-gray-500 dark:text-gray-400">{emptyText}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const member = typeof item === 'object' ? item : null
                const name = member?.fullName || `User ${item}`
                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2)
                const memberId = member?._id || item
                return (
                  <div key={memberId || idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Link to={member?._id ? `/member/${member._id}` : '#'} onClick={onClose} className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                        {member?.profileImage ? <img src={member.profileImage} alt="" className="w-full h-full object-cover" /> : initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member?.departmentShort || ''} {member?.batch ? `• Batch ${member.batch}` : ''}</p>
                      </div>
                    </Link>
                    {!isFollowerMode && unfollowMember && (
                      <button onClick={() => unfollowMember(memberId)} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300 transition-colors">Unfollow</button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================== Edit Modal ================== */

function EditModal({ section, data, onClose, onSave, saving }) {
  const [formData, setFormData] = useState(data)
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [errors, setErrors] = useState({})

  // Education: add new blank entry
  const [showAddEdu, setShowAddEdu] = useState(false)
  const [newEdu, setNewEdu] = useState({ degree: '', institution: '', year: '', major: '', focus: '', gpa: '' })

  const validate = () => {
    const errs = {}
    if (section === 'about' && typeof formData === 'string' && formData.length > 500) {
      errs.about = 'About cannot exceed 500 characters'
    }
    if (section === 'contact') {
      if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) errs.contactEmail = 'Invalid email format'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave(section, formData)
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.includes(skillInput.trim())) {
      setFormData([...formData, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (idx) => setFormData(formData.filter((_, i) => i !== idx))

  const addInterest = () => {
    if (interestInput.trim() && !formData.researchInterests.includes(interestInput.trim())) {
      setFormData({ ...formData, researchInterests: [...formData.researchInterests, interestInput.trim()] })
      setInterestInput('')
    }
  }

  const removeInterest = (idx) => setFormData({ ...formData, researchInterests: formData.researchInterests.filter((_, i) => i !== idx) })

  const handleAddEducation = (e) => {
    e.preventDefault()
    if (!newEdu.degree || !newEdu.institution || !newEdu.year) return
    setFormData([...formData, { ...newEdu }])
    setNewEdu({ degree: '', institution: '', year: '', major: '', focus: '', gpa: '' })
    setShowAddEdu(false)
  }

  const removeEducation = (idx) => setFormData(formData.filter((_, i) => i !== idx))

  const updateEducation = (idx, field, value) => {
    const updated = formData.map((edu, i) => i === idx ? { ...edu, [field]: value } : edu)
    setFormData(updated)
  }

  const sectionTitles = { about: 'About', contact: 'Contact Information', social: 'Social Links', professional: 'Professional Information', skills: 'Skills', education: 'Education' }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit {sectionTitles[section]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><i className="fas fa-times text-xl"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ABOUT */}
          {section === 'about' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About</label>
              <textarea rows={4} value={formData} onChange={(e) => setFormData(e.target.value)} className="input-professional" placeholder="Tell us about yourself..." maxLength={500} />
              <p className="text-xs text-gray-400 mt-1">{typeof formData === 'string' ? formData.length : 0}/500</p>
              {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about}</p>}
            </div>
          )}

          {/* CONTACT */}
          {section === 'contact' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="input-professional" placeholder="your@email.com" />
                {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-professional" placeholder="+880..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-professional" placeholder="City, Country" />
              </div>
            </>
          )}

          {/* SOCIAL LINKS */}
          {section === 'social' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><i className="fab fa-linkedin text-blue-600 mr-1"></i>LinkedIn</label>
                <input type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} className="input-professional" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><i className="fab fa-github text-gray-700 dark:text-gray-300 mr-1"></i>GitHub</label>
                <input type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} className="input-professional" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><i className="fab fa-facebook text-blue-500 mr-1"></i>Facebook</label>
                <input type="url" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} className="input-professional" placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"><i className="fas fa-globe text-teal-600 mr-1"></i>Portfolio</label>
                <input type="url" value={formData.portfolio} onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })} className="input-professional" placeholder="https://yoursite.com" />
              </div>
            </>
          )}

          {/* PROFESSIONAL */}
          {section === 'professional' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Profession</label>
                <input type="text" value={formData.currentProfession} onChange={(e) => setFormData({ ...formData, currentProfession: e.target.value })} className="input-professional" placeholder="e.g. Software Engineer at Google" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous Profession</label>
                <input type="text" value={formData.previousProfession} onChange={(e) => setFormData({ ...formData, previousProfession: e.target.value })} className="input-professional" placeholder="e.g. Intern at Microsoft" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Research Interests</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest() } }} className="input-professional flex-1" placeholder="Add interest..." />
                  <button type="button" onClick={addInterest} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.researchInterests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      {interest}
                      <button type="button" onClick={() => removeInterest(idx)} className="text-red-500 hover:text-red-700"><i className="fas fa-times text-xs"></i></button>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SKILLS */}
          {section === 'skills' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} className="input-professional flex-1" placeholder="Add skill..." />
                <button type="button" onClick={addSkill} className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    {skill}
                    <button type="button" onClick={() => removeSkill(idx)} className="text-red-500 hover:text-red-700"><i className="fas fa-times text-xs"></i></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION */}
          {section === 'education' && (
            <div className="space-y-4">
              {formData.map((edu, idx) => (
                <div key={edu._id || idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 relative">
                  <button type="button" onClick={() => removeEducation(idx)} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Remove">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                  <div className="space-y-3 pr-6">
                    <input type="text" value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} className="input-professional" placeholder="Degree *" required />
                    <input type="text" value={edu.institution} onChange={(e) => updateEducation(idx, 'institution', e.target.value)} className="input-professional" placeholder="Institution *" required />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={edu.year} onChange={(e) => updateEducation(idx, 'year', e.target.value)} className="input-professional" placeholder="Year *" required />
                      <input type="text" value={edu.major || ''} onChange={(e) => updateEducation(idx, 'major', e.target.value)} className="input-professional" placeholder="Major" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={edu.focus || ''} onChange={(e) => updateEducation(idx, 'focus', e.target.value)} className="input-professional" placeholder="Focus Area" />
                      <input type="text" value={edu.gpa || ''} onChange={(e) => updateEducation(idx, 'gpa', e.target.value)} className="input-professional" placeholder="GPA" />
                    </div>
                  </div>
                </div>
              ))}

              {showAddEdu ? (
                <div className="border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">New Education Entry</h4>
                  <div className="space-y-3">
                    <input type="text" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} className="input-professional" placeholder="Degree *" />
                    <input type="text" value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} className="input-professional" placeholder="Institution *" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={newEdu.year} onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })} className="input-professional" placeholder="Year *" />
                      <input type="text" value={newEdu.major} onChange={(e) => setNewEdu({ ...newEdu, major: e.target.value })} className="input-professional" placeholder="Major" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={newEdu.focus} onChange={(e) => setNewEdu({ ...newEdu, focus: e.target.value })} className="input-professional" placeholder="Focus Area" />
                      <input type="text" value={newEdu.gpa} onChange={(e) => setNewEdu({ ...newEdu, gpa: e.target.value })} className="input-professional" placeholder="GPA" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowAddEdu(false)} className="flex-1 btn-secondary">Cancel</button>
                      <button type="button" onClick={handleAddEducation} className="flex-1 btn-primary" disabled={!newEdu.degree || !newEdu.institution || !newEdu.year}>Add</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setShowAddEdu(true)} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-teal-500 hover:text-teal-600 transition-colors text-sm flex items-center justify-center gap-2">
                  <i className="fas fa-plus"></i> Add Education
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary" disabled={saving}>Cancel</button>
            <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2" disabled={saving}>
              {saving && <i className="fas fa-spinner fa-spin"></i>}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile