import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
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

const LEVEL_MATCHERS = [
  { value: 'undergraduate', keywords: ['undergraduate', 'undergrad', "bachelor's program", 'bachelor program', "bachelor's scholarship", 'honours scholarship', 'honors scholarship'] },
  { value: 'masters', keywords: ["master's", 'masters', 'master degree', 'msc', "master's scholarship"] },
  { value: 'phd', keywords: ['phd', 'doctorate', 'doctoral'] },
  { value: 'postdoc', keywords: ['postdoc', 'post-doc'] },
]

const LOCATION_MATCHERS = [
  { value: 'bangladesh', label: 'Bangladesh', keywords: ['bangladesh', 'dhaka', 'chittagong', 'cuet'] },
  { value: 'usa', label: 'USA', keywords: ['usa', 'u.s.a', 'united states', 'america', 'new york', 'california'] },
  { value: 'uk', label: 'UK', keywords: ['uk', 'u.k', 'united kingdom', 'england', 'scotland', 'wales', 'london'] },
  { value: 'europe', label: 'Europe', keywords: ['europe', 'eu', 'germany', 'france', 'italy', 'spain', 'netherlands', 'sweden'] },
  { value: 'asia', label: 'Asia', keywords: ['asia', 'japan', 'korea', 'china', 'singapore', 'malaysia', 'indonesia'] },
  { value: 'australia', label: 'Australia', keywords: ['australia', 'australian', 'sydney', 'melbourne'] },
]

const FUNDING_MATCHERS = [
  { value: 'full', label: 'Full', keywords: ['fully funded', 'full funding', 'full scholarship', 'full tuition'] },
  { value: 'tuition only', label: 'Tuition Only', keywords: ['tuition only', 'tuition waiver', 'tuition fee'] },
  { value: 'stipend', label: 'Stipend', keywords: ['stipend', 'living allowance', 'monthly allowance'] },
  { value: 'partial', label: 'Partial', keywords: ['partial', 'partially funded', 'co-funding'] },
]

const LOCATION_LABELS = LOCATION_MATCHERS.reduce((acc, item) => {
  acc[item.value] = item.label
  return acc
}, { international: 'International' })

const normalizeText = (value) => String(value || '').toLowerCase().trim()
const SCHOLARSHIPS_CACHE_KEY = 'all-scholarships'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function includesKeyword(text, keyword) {
  const normalizedText = normalizeText(text)
  const normalizedKeyword = normalizeText(keyword)
  if (!normalizedKeyword) return false

  if (normalizedKeyword.length <= 3) {
    const rx = new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`, 'i')
    return rx.test(normalizedText)
  }

  return normalizedText.includes(normalizedKeyword)
}

function detectLevelTags(text) {
  const tags = LEVEL_MATCHERS
    .filter((item) => item.keywords.some((keyword) => includesKeyword(text, keyword)))
    .map((item) => item.value)

  if (tags.length === 0) return ['masters', 'phd']
  return Array.from(new Set(tags))
}

function levelLabelFromTags(tags = []) {
  if (tags.includes('undergraduate') && tags.length === 1) return 'Undergraduate'
  if (tags.includes('postdoc') && tags.length === 1) return 'Postdoc'
  if (tags.includes('masters') && tags.includes('phd')) return "Master's, PhD"
  if (tags.includes('phd')) return 'PhD'
  if (tags.includes('masters')) return "Master's"
  return "Master's, PhD"
}

function detectLocationTags(text) {
  const tags = LOCATION_MATCHERS
    .filter((item) => item.keywords.some((keyword) => includesKeyword(text, keyword)))
    .map((item) => item.value)

  if (tags.length === 0) return ['international']
  return Array.from(new Set(tags))
}

function locationLabelFromTags(tags = []) {
  return LOCATION_LABELS[tags[0]] || 'International'
}

function detectFunding(text, explicitType = '') {
  const explicit = normalizeText(explicitType)
  if (explicit) {
    if (explicit.includes('full')) return { value: 'full', label: 'Full' }
    if (explicit.includes('tuition')) return { value: 'tuition only', label: 'Tuition Only' }
    if (explicit.includes('stipend')) return { value: 'stipend', label: 'Stipend' }
    if (explicit.includes('partial')) return { value: 'partial', label: 'Partial' }
  }

  const match = FUNDING_MATCHERS.find((item) =>
    item.keywords.some((keyword) => includesKeyword(text, keyword))
  )
  return match ? { value: match.value, label: match.label } : { value: 'partial', label: 'Partial' }
}

function mapLevelSelectionToTags(levelValue = '') {
  const normalized = normalizeText(levelValue)
  if (!normalized) return []
  if (normalized.includes('undergraduate')) return ['undergraduate']
  if (normalized.includes('postdoc')) return ['postdoc']
  if (normalized.includes('phd') && normalized.includes('master')) return ['masters', 'phd']
  if (normalized.includes('phd')) return ['phd']
  if (normalized.includes('master')) return ['masters']
  return detectLevelTags(normalized)
}

function toScholarshipViewModel(scholarship) {
  const levelSourceText = normalizeText([
    scholarship.title,
    scholarship.description,
  ].filter(Boolean).join(' '))

  const searchText = normalizeText([
    scholarship.title,
    scholarship.organization,
    scholarship.description,
    scholarship.eligibility,
    scholarship.amount,
  ].filter(Boolean).join(' '))

  const levelTags = detectLevelTags(levelSourceText)
  const locationTags = detectLocationTags(searchText)
  const funding = detectFunding(searchText)
  const postedByRole = normalizeText(scholarship.postedBy?.role || scholarship.postedBy?.userType || 'alumni')

  return {
    id: scholarship._id,
    name: scholarship.title,
    level: levelLabelFromTags(levelTags),
    location: locationLabelFromTags(locationTags),
    fundingType: funding.label,
    fundingValue: funding.value,
    duration: '1-4 years',
    fundingDetails: scholarship.amount || 'Varies',
    deadline: scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open',
    link: scholarship.link || '#',
    eligibility: scholarship.eligibility || 'See official website for details',
    benefits: scholarship.amount || 'Funding available',
    description: scholarship.description || scholarship.title,
    organization: scholarship.organization,
    postedBy: scholarship.postedBy
      ? {
        name: scholarship.postedBy.fullName,
        type: (scholarship.postedBy.role || scholarship.postedBy.userType || 'Alumni').replace(/^./, (c) => c.toUpperCase())
      }
      : { name: 'CUET Alumni', type: 'Alumni' },
    postedByRole,
    searchText,
    levelTags,
    locationTags,
  }
}

function Scholarships() {
  const [savedScholarships, setSavedScholarships] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [showPostModal, setShowPostModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
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
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const scholarshipsCacheRef = useRef(new Map())
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.debug('[Scholarships] selected filters', filters)
  }, [filters])

  const fetchScholarships = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && scholarshipsCacheRef.current.has(SCHOLARSHIPS_CACHE_KEY)) {
      const cached = scholarshipsCacheRef.current.get(SCHOLARSHIPS_CACHE_KEY)
      console.debug('[Scholarships] cache hit (all-scholarships)')
      setScholarships(cached)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.debug('[Scholarships] API request params', { limit: 200 })
      const response = await scholarshipsAPI.getAll({ limit: 200 })
      if (response.success) {
        const formattedScholarships = response.scholarships.map((s) => toScholarshipViewModel(s))

        console.debug('[Scholarships] response count', formattedScholarships.length)
        scholarshipsCacheRef.current.set(SCHOLARSHIPS_CACHE_KEY, formattedScholarships)
        setScholarships(formattedScholarships)
      } else {
        scholarshipsCacheRef.current.set(SCHOLARSHIPS_CACHE_KEY, [])
        setScholarships([])
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch scholarships from API
  useEffect(() => {
    fetchScholarships()
  }, [fetchScholarships])

  const levels = [
    { label: 'All Levels', value: '' },
    { label: 'Undergraduate', value: 'undergraduate' },
    { label: "Master's", value: 'masters' },
    { label: 'PhD', value: 'phd' },
    { label: 'Postdoc', value: 'postdoc' },
  ]
  const locations = [
    { label: 'All Locations', value: '' },
    { label: 'Bangladesh', value: 'bangladesh' },
    { label: 'USA', value: 'usa' },
    { label: 'UK', value: 'uk' },
    { label: 'Europe', value: 'europe' },
    { label: 'Asia', value: 'asia' },
    { label: 'Australia', value: 'australia' },
  ]
  const fundingTypes = [
    { label: 'Funding Type', value: '' },
    { label: 'Full', value: 'full' },
    { label: 'Partial', value: 'partial' },
    { label: 'Tuition Only', value: 'tuition only' },
    { label: 'Stipend', value: 'stipend' },
  ]

  const handleSaveScholarship = (scholarshipId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (savedScholarships.includes(scholarshipId)) {
      setSavedScholarships(savedScholarships.filter(id => id !== scholarshipId))
    } else {
      setSavedScholarships([...savedScholarships, scholarshipId])
    }
  }

  const handlePostScholarship = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setPosting(true)
    setPostError('')

    try {
      const description = [
        newScholarship.description?.trim(),
        newScholarship.benefits ? `Benefits: ${newScholarship.benefits.trim()}` : '',
        newScholarship.duration ? `Duration: ${newScholarship.duration.trim()}` : '',
        newScholarship.fundingType ? `Funding Type: ${newScholarship.fundingType.trim()}` : '',
        newScholarship.location ? `Location: ${newScholarship.location.trim()}` : '',
        newScholarship.level ? `Level: ${newScholarship.level.trim()}` : '',
      ].filter(Boolean).join('\n')

      const eligibility = [
        newScholarship.eligibility?.trim(),
        newScholarship.level ? `Preferred level: ${newScholarship.level.trim()}` : '',
      ].filter(Boolean).join('\n')

      const payload = {
        title: newScholarship.name.trim(),
        organization: user?.fullName ? `${user.fullName} (CUET Alumni)` : 'CUET Alumni Network',
        amount: newScholarship.fundingDetails.trim(),
        eligibility,
        description,
        deadline: newScholarship.deadline || undefined,
        link: newScholarship.link.trim(),
      }

      await scholarshipsAPI.create(payload)
      scholarshipsCacheRef.current.delete(SCHOLARSHIPS_CACHE_KEY)
      await fetchScholarships(true)

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
      setShowPostModal(false)
    } catch (error) {
      console.error('Error posting scholarship:', error)
      setPostError(error?.message || 'Failed to post scholarship. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const filteredScholarships = useMemo(() => {
    const search = normalizeText(filters.search)
    const type = normalizeText(filters.type)
    const location = normalizeText(filters.location)
    const experience = normalizeText(filters.experience)
    const role = normalizeText(filters.role)

    return scholarships.filter((scholarship) => {
      if (search && !scholarship.searchText.includes(search)) return false
      if (type && scholarship.fundingValue !== type) return false
      if (location && !scholarship.locationTags.includes(location)) return false
      if (experience && !scholarship.levelTags.includes(experience)) return false
      if (role && scholarship.postedByRole !== role) return false
      return true
    })
  }, [scholarships, filters.search, filters.type, filters.location, filters.experience, filters.role])

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
                navigate('/login')
                return
              }
              setPostError('')
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Post a Scholarship Opportunity</h2>
                <button onClick={() => { setPostError(''); setShowPostModal(false) }} className="text-gray-400 hover:text-gray-600">
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
                {postError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{postError}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setPostError(''); setShowPostModal(false) }} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" disabled={posting} className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed">{posting ? 'Posting...' : 'Post Scholarship'}</button>
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
                  <div className="flex gap-3">
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
