import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../services/api'
import BaseCard from '../components/BaseCard'

const INITIAL_FILTERS = {
  search: '',
  type: '',
  location: '',
  experience: '',
  department: '',
  batch: '',
  role: '',
}

function Community() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [members, setMembers] = useState([])
  const [batchOptions, setBatchOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const membersCacheRef = useRef(new Map())
  const { isLoggedIn, user, isFollowingMember, followUser, unfollowUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.toLowerCase().trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [filters.search])

  const activeFilters = useMemo(() => ({
    search: debouncedSearch,
    department: filters.department,
    batch: filters.batch,
    role: filters.role,
  }), [debouncedSearch, filters.department, filters.batch, filters.role])

  useEffect(() => {
    console.debug('[Community] selected filters', filters)
  }, [filters])

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      const currentUserStudentId = user?.studentId || ''
      const cacheKey = JSON.stringify({ ...activeFilters, currentUserStudentId })

      if (membersCacheRef.current.has(cacheKey)) {
        const cached = membersCacheRef.current.get(cacheKey)
        console.debug('[Community] cache hit', activeFilters)
        setMembers(cached)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.debug('[Community] API request params', activeFilters)
        const response = await usersAPI.getAll(activeFilters)
        if (response.success) {
          // Filter out current user and ensure unique student IDs
          const seenStudentIds = new Set()
          
          const formattedMembers = response.users
            .filter(u => {
              if (currentUserStudentId && u.studentId === currentUserStudentId) {
                return false;
              }
              if (seenStudentIds.has(u.studentId)) {
                return false;
              }
              seenStudentIds.add(u.studentId);
              return true;
            })
            .map(u => {
              const studentIdText = String(u.studentId || '')

              return {
              id: u._id,
              name: u.fullName,
              studentId: u.studentId,
              batch: u.batch || (studentIdText.length >= 2 ? `20${studentIdText.substring(0, 2)}` : 'Unknown'),
              department: u.departmentShort || 'CSE',
              profileImage: u.profileImage || null,
              initials: u.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
              type: (u.role || u.userType) === 'alumni' ? 'Alumni' : 'Student',
              bio: u.about || 'CUET community member',
              position: u.currentProfession || null,
              skills: u.skills || [],
              followersCount: Array.isArray(u.followers) ? u.followers.length : 0,
              }
            })

          const nextBatchOptions = Array.from(new Set(formattedMembers.map(m => m.batch))).sort()
          setBatchOptions(prev => Array.from(new Set([...prev, ...nextBatchOptions])).sort())
          console.debug('[Community] response count', formattedMembers.length)
          membersCacheRef.current.set(cacheKey, formattedMembers)
          setMembers(formattedMembers)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [activeFilters, user?.studentId])

  const memberTypes = [
    { label: 'All Members', value: '' },
    { label: 'Alumni', value: 'alumni' },
    { label: 'Student', value: 'student' },
  ]
  const departments = [
    { label: 'All Departments', value: '' },
    { label: 'CSE', value: 'cse' },
    { label: 'EEE', value: 'eee' },
    { label: 'ME', value: 'me' },
    { label: 'CE', value: 'ce' },
    { label: 'URP', value: 'urp' },
    { label: 'Arch', value: 'arch' },
    { label: 'PME', value: 'pme' },
    { label: 'ECE', value: 'ece' },
    { label: 'PHY', value: 'phy' },
    { label: 'CHEM', value: 'chem' },
    { label: 'MATH', value: 'math' },
    { label: 'HUM', value: 'hum' },
  ]
  const batches = ['All Batches', ...batchOptions]

  const handleFollow = async (memberId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    try {
      if (isFollowingMember(memberId)) {
        const response = await unfollowUser(memberId)
        if (response?.success) {
          setMembers(prev => prev.map(m =>
            m.id === memberId ? { ...m, followersCount: Math.max(0, m.followersCount - 1) } : m
          ))
        }
      } else {
        const response = await followUser(memberId)
        if (response?.success) {
          setMembers(prev => prev.map(m =>
            m.id === memberId ? { ...m, followersCount: m.followersCount + 1 } : m
          ))
        }
      }
    } catch (error) {
      console.error('Follow error:', error)
    }
  }

  const handleViewProfile = (memberId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    navigate(`/member/${memberId}`)
  }

  const filteredMembers = members

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="inline-block px-4 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-full mb-4">Network</span>
          <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">CUET Community</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Connect with students and alumni from CUET</p>
        </div>

        {/* Search & Filters */}
        <div className="card-professional p-6 mb-8">
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fas fa-search"></i>
            </div>
            <input
              type="text"
              placeholder="Search by name, role, or department..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input-professional pl-12"
            />
            {filters.search && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <select value={filters.role} onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {memberTypes.map(type => <option key={type.label} value={type.value}>{type.label}</option>)}
            </select>
            <select value={filters.department} onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {departments.map(dept => <option key={dept.label} value={dept.value}>{dept.label}</option>)}
            </select>
            <select value={filters.batch} onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value === 'All Batches' ? '' : e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {batches.map(batch => <option key={batch} value={batch === 'All Batches' ? '' : batch}>{batch === 'All Batches' ? batch : `Batch ${batch}`}</option>)}
            </select>
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
        <>
        <div className="card-grid">
          {filteredMembers.map(member => (
            <BaseCard key={member.id}>
              <BaseCard.Header>
                <div className="card-avatar">
                  {member.profileImage ? (
                    <img src={member.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-teal-700 dark:text-teal-400 font-bold text-sm">{member.initials}</span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  member.type === 'Student' 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
                    : 'bg-teal-600 text-white'
                }`}>
                  {member.type === 'Student' ? 'Current Student' : 'Alumni'}
                </span>
              </BaseCard.Header>

              <BaseCard.Body>
                <h3 className="card-title">{member.name}</h3>
                <p className="card-subtitle">ID: {member.studentId}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="card-tag card-tag-teal">
                    <i className="fas fa-calendar-alt text-[10px]"></i> Batch {member.batch}
                  </span>
                  <span className="card-tag card-tag-teal">
                    <i className="fas fa-map-marker-alt text-[10px]"></i> {member.department}
                  </span>
                </div>

                {member.type === 'Student' ? (
                  <p className="card-description mb-3">
                    {member.bio}
                  </p>
                ) : (
                  <p className="text-teal-600 dark:text-teal-400 text-sm mb-3 flex items-center gap-2">
                    <i className="fas fa-briefcase"></i> {member.position}
                  </p>
                )}

                {member.type === 'Alumni' && member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {member.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs border border-gray-200 dark:border-gray-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-meta">
                  <i className="fas fa-users"></i>
                  <span>{member.followersCount} followers</span>
                </div>
              </BaseCard.Body>

              <BaseCard.Footer>
                <button 
                  onClick={() => handleViewProfile(member.id)}
                  className="card-btn-outline"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => handleFollow(member.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    isFollowingMember(member.id)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <i className={`fas ${isFollowingMember(member.id) ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                  {isFollowingMember(member.id) ? 'Unfollow' : 'Follow'}
                </button>
              </BaseCard.Footer>
            </BaseCard>
          ))}
        </div>
        
        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <i className="fas fa-users text-4xl mb-4 opacity-50"></i>
            <p>No members found matching your criteria</p>
            <button onClick={() => setFilters(INITIAL_FILTERS)} className="mt-4 text-teal-600 hover:underline">Clear all filters</button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}

export default Community
