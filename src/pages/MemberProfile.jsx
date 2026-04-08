import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { usersAPI } from '../services/api'

function MemberProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user, isFollowingMember, followUser, unfollowUser } = useAuth()
  const [showShareToast, setShowShareToast] = useState(false)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    const fetchMember = async () => {
      try {
        setLoading(true)
        const response = await usersAPI.getById(id)
        if (response.success) {
          setMember(response.user)
        }
      } catch (error) {
        console.error('Error fetching member:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMember()
  }, [id, isLoggedIn, navigate])

  const isFollowing = isFollowingMember(id)

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        const response = await unfollowUser(id)
        if (response?.success) {
          setMember(prev => ({
            ...prev,
            followers: (prev.followers || []).filter(f => {
              const fId = typeof f === 'object' && f !== null ? f._id : f
              return String(fId) !== String(user?._id || user?.id)
            })
          }))
        }
      } else {
        const response = await followUser(id)
        if (response?.success) {
          setMember(prev => ({
            ...prev,
            followers: [...(prev.followers || []), user?._id || user?.id]
          }))
        }
      }
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  if (loading) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <i className="fas fa-user-slash text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Member Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The member you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/community')} className="btn-primary">
            <i className="fas fa-arrow-left mr-2"></i> Back to Community
          </button>
        </div>
      </div>
    )
  }

  const initials = member.fullName
    ? member.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?'
  const memberType = member.userType === 'alumni' ? 'Alumni' : 'Student'
  const followersCount = Array.isArray(member.followers) ? member.followers.length : 0

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${member.fullName} - CUET ConnectX`,
        text: `Check out ${member.fullName}'s profile on CUET ConnectX`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 3000)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2">
          <i className="fas fa-check-circle"></i> Profile link copied to clipboard!
        </div>
      )}

      {/* Cover */}
      <div className="h-48 bg-gradient-to-r from-teal-800 via-teal-600 to-teal-800 relative overflow-hidden">
        {member.coverImage && (
          <img src={member.coverImage} alt="Cover" className="w-full h-full object-cover absolute inset-0" />
        )}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px'}}></div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {member.profileImage ? (
                  <img src={member.profileImage} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>

            {/* Info & Actions Row */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between w-full pt-2 sm:pt-4">
              <div>
                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white heading-font mb-2">{member.fullName}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    memberType === 'Student' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-teal-600 text-white'
                  }`}>
                    {memberType === 'Student' ? 'Current Student' : 'Alumni'}
                  </span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    Batch {member.batch}
                  </span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {member.departmentShort || member.department}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Student ID: {member.studentId}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 sm:mt-0">
                <button 
                  onClick={handleFollow}
                  className={`px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                    isFollowing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600' 
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <i className={`fas ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                  {isFollowing ? 'Following' : 'Follow'}
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

          {/* Followers */}
          <div className="mt-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{followersCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6 pb-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">About</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {member.about || 'No information provided.'}
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                {(member.contactEmail || member.email) && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                    <i className="fas fa-envelope text-teal-600 dark:text-teal-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${member.contactEmail || member.email}`} className="text-sm text-teal-600 dark:text-teal-400 hover:underline">{member.contactEmail || member.email}</a>
                  </div>
                </div>
                )}
                {member.address && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-teal-600 dark:text-teal-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{member.address}</p>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {member.skills && member.skills.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg text-sm font-medium border border-teal-200 dark:border-teal-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-briefcase text-teal-600 dark:text-teal-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Position</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{member.currentProfession || 'Not specified'}</p>
                  </div>
                </div>
                {member.previousProfession && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-history text-gray-500 dark:text-gray-400"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Previous Position</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{member.previousProfession}</p>
                    </div>
                  </div>
                )}
                {member.researchInterests && member.researchInterests.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-flask text-amber-600 dark:text-amber-400"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Research Interests</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.researchInterests.map((interest, idx) => (
                          <span key={idx} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Education */}
            {member.education && member.education.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Education</h3>
              <div className="space-y-4">
                {member.education.map((edu, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-graduation-cap text-teal-600 dark:text-teal-400"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">{edu.degree}</h4>
                      <p className="text-sm text-teal-600 dark:text-teal-400">{edu.institution}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Back to Community */}
            <div className="text-center pt-4">
              <button 
                onClick={() => navigate('/community')} 
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-arrow-left"></i> Back to Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberProfile
