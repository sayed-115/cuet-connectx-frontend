import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { scholarshipsAPI } from '../services/api'
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

const normalizeOptionValue = (value) => String(value || '').trim().toLowerCase()

const buildOptionsFromValues = (values) => {
  const optionMap = new Map()

  values.forEach((value) => {
    const label = String(value || '').trim()
    if (!label) return

    const normalized = normalizeOptionValue(label)
    if (!optionMap.has(normalized)) {
      optionMap.set(normalized, label)
    }
  })

  return Array.from(optionMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }))
}

const mergeDynamicOptions = (previousOptions, incomingOptions) => {
  const optionMap = new Map(previousOptions.map((option) => [option.value, option.label]))

  incomingOptions.forEach((option) => {
    if (!optionMap.has(option.value)) {
      optionMap.set(option.value, option.label)
    }
  })

  return Array.from(optionMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }))
}

const getScholarshipLevels = (scholarship) => {
  const searchableText = `${scholarship.title || ''} ${scholarship.description || ''} ${scholarship.eligibility || ''}`.toLowerCase()
  const levelLabels = []

  if (/\b(undergraduate|bachelor|bsc|bs|honou?rs|honors)\b/.test(searchableText)) {
    levelLabels.push('Undergraduate')
  }
  if (/\b(master|msc|ms)\b/.test(searchableText)) {
    levelLabels.push("Master's")
  }
  if (/\b(phd|doctorate|doctoral)\b/.test(searchableText)) {
    levelLabels.push('PhD')
  }
  if (/\b(postdoc|post-doc)\b/.test(searchableText)) {
    levelLabels.push('Postdoc')
  }

  return levelLabels.length > 0 ? levelLabels : ["Master's"]
}

const getScholarshipLocation = (scholarship) => {
  const searchableText = `${scholarship.title || ''} ${scholarship.description || ''} ${scholarship.eligibility || ''} ${scholarship.organization || ''}`.toLowerCase()

  if (/\b(bangladesh|dhaka|chittagong|cuet)\b/.test(searchableText)) {
    return 'Bangladesh'
  }

  if (/\b(usa|united states)\b/.test(searchableText)) {
    return 'USA'
  }

  if (/\b(uk|united kingdom|england)\b/.test(searchableText)) {
    return 'UK'
  }

  if (/\beurope\b/.test(searchableText)) {
    return 'Europe'
  }

  if (/\basia\b/.test(searchableText)) {
    return 'Asia'
  }

  if (/\baustralia\b/.test(searchableText)) {
    return 'Australia'
  }

  return 'International'
}

const getScholarshipFundingType = (scholarship) => {
  const searchableText = `${scholarship.amount || ''} ${scholarship.description || ''}`.toLowerCase()

  if (searchableText.includes('full')) {
    return 'Full'
  }
  if (searchableText.includes('tuition')) {
    return 'Tuition Only'
  }
  if (searchableText.includes('stipend')) {
    return 'Stipend'
  }

  return 'Partial'
}

function Scholarships() {
  const [savedScholarships, setSavedScholarships] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [levelOptions, setLevelOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [fundingTypeOptions, setFundingTypeOptions] = useState([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [editingScholarshipId, setEditingScholarshipId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [newScholarship, setNewScholarship] = useState({ 
    name: '', 
    level: '', 
    location: '', 
    fundingType: '', 
    duration: '',
    fundingDetails: '', 
    deadline: '', 
    link: '',
    eligibility: '',
    benefits: '',
    description: '' 
  })
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  const scholarshipsCacheRef = useRef(new Map())
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const currentUserId = String(user?._id || user?.id || '')

  const getPostRoleLabel = (role) => (String(role || '').toLowerCase() === 'admin' ? 'Admin Post' : 'User Post')

  const getStatusMeta = (status) => {
    const normalized = String(status || 'approved').toLowerCase()
    if (normalized === 'pending') {
      return { label: 'Pending', className: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' }
    }
    if (normalized === 'rejected') {
      return { label: 'Rejected', className: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' }
    }
    return { label: 'Approved', className: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' }
  }

  const navigateToLogin = () => {
    navigate('/login', { state: { from: location } })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.toLowerCase().trim())
    }, 300)

    return () => clearTimeout(timer)
  }, [filters.search])

  const activeFilters = useMemo(() => ({
    search: debouncedSearch,
    type: filters.type,
    location: filters.location,
    experience: filters.experience,
    role: filters.role,
  }), [debouncedSearch, filters.type, filters.location, filters.experience, filters.role])

  useEffect(() => {
    console.debug('[Scholarships] selected filters', filters)
  }, [filters])

  // Fetch scholarships from API
  useEffect(() => {
    const fetchScholarships = async () => {
      const cacheKey = JSON.stringify(activeFilters)
      if (scholarshipsCacheRef.current.has(cacheKey)) {
        const cached = scholarshipsCacheRef.current.get(cacheKey)
        console.debug('[Scholarships] cache hit', activeFilters)
        setScholarships(cached)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.debug('[Scholarships] API request params', activeFilters)
        const [publicResponse, ownResponse] = await Promise.all([
          scholarshipsAPI.getAll(activeFilters),
          isLoggedIn ? scholarshipsAPI.getMine(activeFilters) : Promise.resolve({ success: true, scholarships: [] }),
        ])

        if (publicResponse.success) {
          const mergedScholarships = [...(publicResponse.scholarships || [])]
          const knownIds = new Set(mergedScholarships.map((entry) => String(entry._id)))

          if (ownResponse?.success) {
            (ownResponse.scholarships || []).forEach((entry) => {
              const scholarshipId = String(entry._id)
              if (!knownIds.has(scholarshipId)) {
                mergedScholarships.push(entry)
                knownIds.add(scholarshipId)
              }
            })
          }

          const formattedScholarships = mergedScholarships.map((s) => {
            const detectedLevels = getScholarshipLevels(s)
            const postRole = String(s.role || 'user').toLowerCase()
            const postStatus = String(s.status || 'approved').toLowerCase()
            const ownerId = String(s.createdBy || s.postedBy?._id || '')

            return {
            levels: detectedLevels,
            id: s._id,
            name: s.title,
            level: detectedLevels.join(', '),
            location: getScholarshipLocation(s),
            fundingType: getScholarshipFundingType(s),
            duration: '1-4 years',
            fundingDetails: s.amount || 'Varies',
            deadline: s.deadline ? new Date(s.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open',
            link: s.link || '#',
            eligibility: s.eligibility || 'See official website for details',
            benefits: s.amount || 'Full funding available',
            description: s.description || s.title,
            organization: s.organization,
            role: postRole,
            status: postStatus,
            ownerId,
            canEditOwn: Boolean(currentUserId) && ownerId === currentUserId,
            canManage: Boolean(currentUserId) && (String(user?.role || '').toLowerCase() === 'admin' || ownerId === currentUserId),
            postedBy: s.postedBy
              ? {
                name: s.postedBy.fullName,
                type: (s.postedBy.role || s.postedBy.userType || 'Alumni').replace(/^./, (c) => c.toUpperCase())
              }
              : { name: 'CUET Alumni', type: 'Alumni' }
            }
          })

          console.debug('[Scholarships] response count', formattedScholarships.length)
          const nextLevelOptions = buildOptionsFromValues(formattedScholarships.flatMap((scholarship) => scholarship.levels || []))
          const nextLocationOptions = buildOptionsFromValues(formattedScholarships.map((scholarship) => scholarship.location))
          const nextFundingTypeOptions = buildOptionsFromValues(formattedScholarships.map((scholarship) => scholarship.fundingType))

          setLevelOptions(prev => mergeDynamicOptions(prev, nextLevelOptions))
          setLocationOptions(prev => mergeDynamicOptions(prev, nextLocationOptions))
          setFundingTypeOptions(prev => mergeDynamicOptions(prev, nextFundingTypeOptions))
          scholarshipsCacheRef.current.set(cacheKey, formattedScholarships)
          setScholarships(formattedScholarships)
        }
      } catch (error) {
        console.error('Error fetching scholarships:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchScholarships()
  }, [activeFilters, currentUserId, isLoggedIn, refreshKey, user?.role])

  const levels = [{ label: 'All Levels', value: '' }, ...levelOptions]
  const locations = [{ label: 'All Locations', value: '' }, ...locationOptions]
  const fundingTypes = [{ label: 'Funding Type', value: '' }, ...fundingTypeOptions]

  const handleSaveScholarship = (scholarshipId) => {
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }
    if (savedScholarships.includes(scholarshipId)) {
      setSavedScholarships(savedScholarships.filter(id => id !== scholarshipId))
    } else {
      setSavedScholarships([...savedScholarships, scholarshipId])
    }
  }

  const resetScholarshipForm = () => {
    setNewScholarship({
      name: '',
      level: '',
      location: '',
      fundingType: '',
      duration: '',
      fundingDetails: '',
      deadline: '',
      link: '',
      eligibility: '',
      benefits: '',
      description: ''
    })
    setEditingScholarshipId(null)
  }

  const handlePostScholarship = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }

    const payload = {
      scholarshipName: newScholarship.name,
      title: newScholarship.name,
      level: newScholarship.level,
      location: newScholarship.location,
      fundingType: newScholarship.fundingType,
      duration: newScholarship.duration,
      fundingDetails: newScholarship.fundingDetails,
      amount: newScholarship.fundingDetails,
      deadline: newScholarship.deadline,
      scholarshipLink: newScholarship.link,
      link: newScholarship.link,
      eligibilityCriteria: newScholarship.eligibility,
      eligibility: newScholarship.eligibility,
      benefits: newScholarship.benefits,
      description: newScholarship.description,
      organization: newScholarship.organization || 'CUET Community',
    }

    try {
      setSubmitting(true)

      const response = editingScholarshipId
        ? await scholarshipsAPI.update(editingScholarshipId, payload)
        : await scholarshipsAPI.create(payload)

      scholarshipsCacheRef.current.clear()
      setRefreshKey(prev => prev + 1)
      setShowPostModal(false)
      setShowDetailModal(null)
      resetScholarshipForm()

      const updatedStatus = String(response?.scholarship?.status || 'approved').toLowerCase()
      if (!editingScholarshipId && updatedStatus === 'pending') {
        window.alert('Scholarship submitted successfully. It is pending admin approval.')
      } else if (editingScholarshipId && String(user?.role || '').toLowerCase() !== 'admin') {
        window.alert('Scholarship updated successfully and sent for re-approval.')
      }
    } catch (error) {
      window.alert(error.message || 'Failed to save scholarship. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditScholarship = (scholarship) => {
    if (!scholarship?.canEditOwn) return

    const parsedDeadline = scholarship.deadline && scholarship.deadline !== 'Open' ? new Date(scholarship.deadline) : null
    const safeDeadline = parsedDeadline && !Number.isNaN(parsedDeadline.getTime())
      ? parsedDeadline.toISOString().split('T')[0]
      : ''

    setEditingScholarshipId(scholarship.id)
    setNewScholarship({
      name: scholarship.name || '',
      level: scholarship.level || '',
      location: scholarship.location || '',
      fundingType: scholarship.fundingType || '',
      duration: scholarship.duration || '',
      fundingDetails: scholarship.fundingDetails || '',
      deadline: safeDeadline,
      link: scholarship.link || '',
      eligibility: scholarship.eligibility || '',
      benefits: scholarship.benefits || '',
      description: scholarship.description || '',
      organization: scholarship.organization || ''
    })
    setShowDetailModal(null)
    setShowPostModal(true)
  }

  const handleDeleteScholarship = async (scholarship) => {
    if (!scholarship?.canManage) return

    const confirmed = window.confirm(`Delete scholarship "${scholarship.name}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      await scholarshipsAPI.delete(scholarship.id)
      scholarshipsCacheRef.current.clear()
      setRefreshKey(prev => prev + 1)
      setShowDetailModal(null)
      window.alert('Scholarship deleted successfully.')
    } catch (error) {
      window.alert(error.message || 'Failed to delete scholarship.')
    }
  }

  const filteredScholarships = scholarships

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">Scholarship Opportunities</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Discover funding opportunities for your academic journey</p>
            {scholarships.map(s => s.scholarshipImage && <img key={s.id} src={s.scholarshipImage} alt="Scholarship" className="h-12 w-12 rounded object-cover mr-2 inline-block" />)}
          </div>
          <button 
            onClick={() => {
              if (!isLoggedIn) {
                navigateToLogin()
                return
              }
              resetScholarshipForm()
              setShowPostModal(true)
            }}
            className="mt-4 md:mt-0 btn-primary flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Post a Scholarship
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fas fa-search"></i>
            </div>
            <input
              type="text"
              placeholder="Search scholarships by name, keywords..."
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
            <select value={filters.experience} onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {levels.map(l => <option key={l.label} value={l.value}>{l.label}</option>)}
            </select>
            <select value={filters.location} onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {locations.map(loc => <option key={loc.label} value={loc.value}>{loc.label}</option>)}
            </select>
            <select value={filters.type} onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {fundingTypes.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={filters.role === 'alumni'}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.checked ? 'alumni' : '' }))}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Posted by Alumni
            </label>
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Post Scholarship Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingScholarshipId ? 'Edit Scholarship Opportunity' : 'Post a Scholarship Opportunity'}</h2>
                <button onClick={() => { setShowPostModal(false); resetScholarshipForm() }} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handlePostScholarship} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Name *</label>
                  <input type="text" required value={newScholarship.name} onChange={(e) => setNewScholarship({...newScholarship, name: e.target.value})} className="input-professional" placeholder="Enter scholarship name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level *</label>
                    <select required value={newScholarship.level} onChange={(e) => setNewScholarship({...newScholarship, level: e.target.value})} className="input-professional">
                      <option value="">Select level</option>
                      <option>Undergraduate</option>
                      <option>Master's</option>
                      <option>PhD</option>
                      <option>Master's, PhD</option>
                      <option>Postdoc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                    <input type="text" required value={newScholarship.location} onChange={(e) => setNewScholarship({...newScholarship, location: e.target.value})} className="input-professional" placeholder="e.g., USA, UK" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Type *</label>
                    <select required value={newScholarship.fundingType} onChange={(e) => setNewScholarship({...newScholarship, fundingType: e.target.value})} className="input-professional">
                      <option value="">Select funding type</option>
                      <option>Full</option>
                      <option>Partial</option>
                      <option>Tuition Only</option>
                      <option>Stipend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration *</label>
                    <input type="text" required value={newScholarship.duration} onChange={(e) => setNewScholarship({...newScholarship, duration: e.target.value})} className="input-professional" placeholder="e.g., 2-3 years" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Details *</label>
                  <textarea rows={2} required value={newScholarship.fundingDetails} onChange={(e) => setNewScholarship({...newScholarship, fundingDetails: e.target.value})} className="input-professional" placeholder="Describe what the scholarship covers (tuition, stipend, travel, etc.)"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline *</label>
                    <input type="date" required value={newScholarship.deadline} onChange={(e) => setNewScholarship({...newScholarship, deadline: e.target.value})} className="input-professional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Link *</label>
                    <input type="url" required value={newScholarship.link} onChange={(e) => setNewScholarship({...newScholarship, link: e.target.value})} className="input-professional" placeholder="https://example.com/scholarship" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eligibility Criteria *</label>
                  <textarea rows={2} required value={newScholarship.eligibility} onChange={(e) => setNewScholarship({...newScholarship, eligibility: e.target.value})} className="input-professional" placeholder="List eligibility requirements"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits *</label>
                  <textarea rows={2} required value={newScholarship.benefits} onChange={(e) => setNewScholarship({...newScholarship, benefits: e.target.value})} className="input-professional" placeholder="Describe the scholarship benefits"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea rows={3} required value={newScholarship.description} onChange={(e) => setNewScholarship({...newScholarship, description: e.target.value})} className="input-professional" placeholder="Provide additional details about the scholarship"></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowPostModal(false); resetScholarshipForm() }} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60">
                    {submitting ? 'Saving...' : editingScholarshipId ? 'Update Scholarship' : 'Post Scholarship'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                    showDetailModal.fundingType === 'Full' 
                      ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400' 
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  }`}>
                    {showDetailModal.fundingType === 'Full' ? 'Fully Funded' : 'Partially Funded'}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{showDetailModal.name}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-xs font-semibold">
                      {getPostRoleLabel(showDetailModal.role)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusMeta(showDetailModal.status).className}`}>
                      {getStatusMeta(showDetailModal.status).label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium flex items-center gap-1">
                    <i className="fas fa-graduation-cap text-xs"></i> {showDetailModal.level}
                  </span>
                  <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium flex items-center gap-1">
                    <i className="fas fa-map-marker-alt text-xs"></i> {showDetailModal.location}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{showDetailModal.description}</p>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-teal-500 mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Funding</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{showDetailModal.fundingDetails}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-calendar text-amber-500 mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{showDetailModal.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-clock text-teal-500 mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{showDetailModal.duration}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Eligibility</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{showDetailModal.eligibility}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Benefits</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{showDetailModal.benefits}</p>
                </div>
                <div className="pt-4 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-teal-500"></i>
                    Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{showDetailModal.postedBy.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {showDetailModal.canEditOwn && (
                      <button onClick={() => openEditScholarship(showDetailModal)} className="btn-secondary">Edit</button>
                    )}
                    {showDetailModal.canManage && (
                      <button onClick={() => handleDeleteScholarship(showDetailModal)} className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/30">Delete</button>
                    )}
                    <button onClick={() => setShowDetailModal(null)} className="flex-1 btn-secondary">Close</button>
                    <a 
                      href={showDetailModal.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      Learn More <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
        <>
        {/* Scholarship Cards */}
        <div className="card-grid">
          {filteredScholarships.map(scholarship => (
            <BaseCard key={scholarship.id}>
              <BaseCard.Header>
                <div className={`card-icon ${scholarship.fundingType === 'Full' ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
                  <i className="fas fa-graduation-cap text-base"></i>
                </div>
                <button 
                  onClick={() => handleSaveScholarship(scholarship.id)}
                  className={`p-1.5 transition-colors ${savedScholarships.includes(scholarship.id) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  <i className={`${savedScholarships.includes(scholarship.id) ? 'fas' : 'far'} fa-bookmark text-lg`}></i>
                </button>
              </BaseCard.Header>

              <BaseCard.Body>
                <h3 className="card-title">{scholarship.name}</h3>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`card-tag ${scholarship.fundingType === 'Full' ? 'card-tag-teal' : 'card-tag-amber'}`}>
                    {scholarship.fundingType === 'Full' ? 'Fully Funded' : 'Partially Funded'}
                  </span>
                  <span className="card-tag card-tag-teal">
                    <i className="fas fa-graduation-cap text-[10px]"></i> {scholarship.level}
                  </span>
                  <span className="card-tag card-tag-amber">
                    <i className="fas fa-map-marker-alt text-[10px]"></i> {scholarship.location}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-semibold">
                    {getPostRoleLabel(scholarship.role)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusMeta(scholarship.status).className}`}>
                    {getStatusMeta(scholarship.status).label}
                  </span>
                </div>

                <p className="card-description mb-4">
                  {scholarship.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check-circle text-teal-500 w-4"></i>
                    <span className="text-gray-500 dark:text-gray-400">Funding</span>
                    <span className="ml-auto font-medium text-gray-700 dark:text-gray-300 text-xs">{scholarship.fundingDetails}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-calendar text-amber-500 w-4"></i>
                    <span className="text-gray-500 dark:text-gray-400">Deadline</span>
                    <span className="ml-auto font-medium text-amber-600 dark:text-amber-400 text-xs">{scholarship.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fas fa-clock text-teal-500 w-4"></i>
                    <span className="text-gray-500 dark:text-gray-400">Duration</span>
                    <span className="ml-auto font-medium text-gray-700 dark:text-gray-300 text-xs">{scholarship.duration}</span>
                  </div>
                </div>

                <div className="card-meta">
                  <div className="w-5 h-5 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-teal-600 dark:text-teal-400 text-[10px]"></i>
                  </div>
                  <span>Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{scholarship.postedBy.name}</span></span>
                </div>
              </BaseCard.Body>

              <BaseCard.Footer>
                <button 
                  onClick={() => setShowDetailModal(scholarship)}
                  className="card-btn-outline"
                >
                  View Details
                </button>
                <a 
                  href={scholarship.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-btn-primary"
                >
                  Learn More <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </BaseCard.Footer>
            </BaseCard>
          ))}
        </div>
        
        {filteredScholarships.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
            <p>No scholarships found matching your criteria</p>
            <button onClick={() => setFilters(INITIAL_FILTERS)} className="mt-4 text-teal-600 hover:underline">Clear all filters</button>
          </div>
        )}
      </>
      )}
      </div>
    </div>
  )
}

export default Scholarships
