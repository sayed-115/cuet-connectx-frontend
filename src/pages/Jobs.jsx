import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jobsAPI } from '../services/api'
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

const EMPTY_JOB_FORM = {
  title: '',
  company: '',
  location: '',
  type: '',
  experience: '',
  deadline: '',
  requirements: '',
  responsibilities: '',
  applicationLink: '',
}

const parseListField = (value) =>
  String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

const getTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

const toCompactSalaryPart = (amount) => {
  if (!Number.isFinite(amount)) return ''
  if (amount >= 1000) {
    const value = Math.round((amount / 1000) * 10) / 10
    return `${value % 1 === 0 ? value.toFixed(0) : value}k`
  }
  return String(Math.round(amount))
}

const getSalaryText = (salary = {}) => {
  const min = Number(salary?.min)
  const max = Number(salary?.max)
  const currency = String(salary?.currency || 'BDT').toUpperCase()
  const symbol = currency === 'BDT' ? '৳' : `${currency} `

  if (Number.isFinite(min) && Number.isFinite(max)) {
    return `${symbol}${toCompactSalaryPart(min)} - ${symbol}${toCompactSalaryPart(max)} / month`
  }

  if (Number.isFinite(min)) {
    return `${symbol}${toCompactSalaryPart(min)}+ / month`
  }

  if (Number.isFinite(max)) {
    return `Up to ${symbol}${toCompactSalaryPart(max)} / month`
  }

  return 'Competitive salary'
}

const toDateInputValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

const firstLine = (text = '') => String(text).split(/\r?\n/)[0].trim()

const toJobViewModel = (job) => {
  const postedBy = job.postedBy || job.createdBy || {}
  const owner = job.createdBy || job.postedBy || null
  const ownerId = owner?._id || owner || null

  const skills = Array.isArray(job.skills)
    ? job.skills.filter(Boolean).slice(0, 5)
    : []

  const shortDescription =
    String(job.shortDescription || '').trim() ||
    firstLine(job.description) ||
    (Array.isArray(job.requirements) ? job.requirements[0] : '') ||
    'Explore this role and apply with your updated profile.'

  const location = String(job.location || '').trim() || 'Remote'
  const type = String(job.type || '').trim() || 'Full-time'
  const workMode = String(job.workMode || '').trim() || (location.toLowerCase().includes('remote') ? 'Remote' : 'On-site')
  const status = String(job.status || 'approved').toLowerCase()
  const postRole = String(job.role || (postedBy.role === 'admin' ? 'admin' : 'user')).toLowerCase() === 'admin' ? 'admin' : 'user'

  return {
    id: job._id,
    ownerId: ownerId ? String(ownerId) : '',
    title: job.title,
    company: job.company,
    location,
    type,
    workMode,
    posted: getTimeAgo(job.createdAt),
    salary: getSalaryText(job.salary),
    experience: job.experience || 'Entry Level',
    deadline: job.applicationDeadline
      ? new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Open',
    deadlineInput: toDateInputValue(job.applicationDeadline),
    postedBy: {
      name: postedBy.fullName || 'CUET Community',
      role: postedBy.role || postedBy.userType || 'user',
      batch: postedBy.batch,
      profileImage: postedBy.profileImage,
    },
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
    skills,
    applicationLink: job.applyLink || '#',
    shortDescription,
    status,
    postRole,
    createdAt: job.createdAt,
  }
}

function Jobs() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [appliedJobs, setAppliedJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [newJob, setNewJob] = useState(EMPTY_JOB_FORM)
  const [editingJobId, setEditingJobId] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [postingJob, setPostingJob] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState('')
  const [postJobError, setPostJobError] = useState('')
  const [formNotice, setFormNotice] = useState({ type: '', message: '' })
  const [refreshNonce, setRefreshNonce] = useState(0)
  const jobsCacheRef = useRef(new Map())

  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const currentUserId = String(user?._id || user?.id || '')
  const isAdmin = user?.role === 'admin'

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
    const fetchJobs = async () => {
      const cacheKey = JSON.stringify(activeFilters)
      if (jobsCacheRef.current.has(cacheKey)) {
        setJobs(jobsCacheRef.current.get(cacheKey))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await jobsAPI.getAll(activeFilters)
        if (response.success) {
          const formattedJobs = response.jobs.map((job) => toJobViewModel(job))
          jobsCacheRef.current.set(cacheKey, formattedJobs)
          setJobs(formattedJobs)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [activeFilters, refreshNonce])

  const resetForm = () => {
    setEditingJobId(null)
    setNewJob(EMPTY_JOB_FORM)
    setPostJobError('')
  }

  const openCreateModal = () => {
    resetForm()
    setShowPostModal(true)
  }

  const redirectToLogin = () => {
    navigate('/login', { state: { from: location } })
  }

  const canManageJob = (job) => {
    if (!isLoggedIn || !currentUserId) return false
    return isAdmin || String(job.ownerId) === currentUserId
  }

  const handleApply = (jobId) => {
    if (!isLoggedIn) {
      redirectToLogin()
      return
    }

    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs((prev) => [...prev, jobId])
    }
  }

  const handleSaveJob = (jobId) => {
    if (!isLoggedIn) {
      redirectToLogin()
      return
    }

    if (savedJobs.includes(jobId)) {
      setSavedJobs((prev) => prev.filter((id) => id !== jobId))
    } else {
      setSavedJobs((prev) => [...prev, jobId])
    }
  }

  const handleEditJob = (job) => {
    if (!canManageJob(job)) return

    setEditingJobId(job.id)
    setPostJobError('')
    setNewJob({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || '',
      experience: job.experience || '',
      deadline: job.deadlineInput || '',
      requirements: (job.requirements || []).join('\n'),
      responsibilities: (job.responsibilities || []).join('\n'),
      applicationLink: job.applicationLink && job.applicationLink !== '#' ? job.applicationLink : '',
    })

    setShowPostModal(true)
  }

  const handleDeleteJob = async (job) => {
    if (!canManageJob(job)) return

    const confirmed = window.confirm(`Delete "${job.title}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      setDeletingJobId(job.id)
      setFormNotice({ type: '', message: '' })
      await jobsAPI.delete(job.id)
      jobsCacheRef.current.clear()
      setRefreshNonce((prev) => prev + 1)
      setFormNotice({ type: 'success', message: 'Job deleted successfully.' })
    } catch (error) {
      setFormNotice({ type: 'error', message: error?.message || 'Failed to delete job.' })
    } finally {
      setDeletingJobId('')
    }
  }

  const handlePostJob = async (e) => {
    e.preventDefault()

    if (!isLoggedIn) {
      redirectToLogin()
      return
    }

    try {
      setPostingJob(true)
      setPostJobError('')

      const requirements = parseListField(newJob.requirements)
      const responsibilities = parseListField(newJob.responsibilities)
      const description =
        newJob.responsibilities.trim() ||
        newJob.requirements.trim() ||
        `${newJob.title.trim()} at ${newJob.company.trim()}`

      if (!description) {
        setPostJobError('Please provide at least requirements or responsibilities.')
        return
      }

      const payload = {
        title: newJob.title.trim(),
        company: newJob.company.trim(),
        location: newJob.location.trim(),
        type: newJob.type || 'Full-time',
        experience: newJob.experience || 'Entry Level',
        description,
        requirements,
        responsibilities,
        deadline: newJob.deadline || null,
        applyLink: newJob.applicationLink.trim(),
      }

      if (editingJobId) {
        await jobsAPI.update(editingJobId, payload)
      } else {
        await jobsAPI.create(payload)
      }

      jobsCacheRef.current.clear()
      setRefreshNonce((prev) => prev + 1)
      setFormNotice({
        type: 'success',
        message: editingJobId
          ? 'Job updated successfully.'
          : 'Job submitted successfully.',
      })

      resetForm()
      setShowPostModal(false)
    } catch (error) {
      setPostJobError(error?.message || 'Failed to save job. Please try again.')
    } finally {
      setPostingJob(false)
    }
  }

  const jobTypes = [
    { label: 'All Job Types', value: '' },
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
    { label: 'Remote', value: 'remote' },
  ]

  const locations = [
    { label: 'All Locations', value: '' },
    { label: 'Remote', value: 'remote' },
    { label: 'Dhaka', value: 'dhaka' },
    { label: 'Chittagong', value: 'chittagong' },
    { label: 'San Francisco', value: 'san francisco' },
    { label: 'New York', value: 'new york' },
    { label: 'London', value: 'london' },
  ]

  const experienceLevels = [
    { label: 'Experience Level', value: '' },
    { label: 'Entry Level', value: 'entry level' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Senior Level', value: 'senior level' },
    { label: 'Lead/Manager', value: 'lead/manager' },
  ]

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">Job Opportunities</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Explore career opportunities shared by the CUET community</p>
          </div>
          <button
            onClick={() => (isLoggedIn ? openCreateModal() : redirectToLogin())}
            className="btn-primary flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Post a Job
          </button>
        </div>

        {formNotice.message && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm border ${
            formNotice.type === 'success'
              ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
          }`}>
            {formNotice.message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fas fa-search"></i>
            </div>
            <input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="input-professional pl-12"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {jobTypes.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
            </select>
            <select value={filters.location} onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {locations.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
            </select>
            <select value={filters.experience} onChange={(e) => setFilters((prev) => ({ ...prev, experience: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {experienceLevels.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={filters.role === 'alumni'}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.checked ? 'alumni' : '' }))}
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

        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingJobId ? 'Edit Job Opportunity' : 'Post a Job Opportunity'}
                </h2>
                <button
                  onClick={() => {
                    setShowPostModal(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handlePostJob} className="space-y-4">
                {postJobError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300">
                    {postJobError}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                    <input type="text" required value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} className="input-professional" placeholder="Enter company name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Role/Title *</label>
                    <input type="text" required value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="input-professional" placeholder="e.g., Software Engineer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                    <input type="text" required value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="input-professional" placeholder="e.g., Dhaka, Remote" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type *</label>
                    <select required value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })} className="input-professional">
                      <option value="">Select job type</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                      <option>Remote</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Level *</label>
                    <select required value={newJob.experience} onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })} className="input-professional">
                      <option value="">Select experience level</option>
                      <option>Entry Level</option>
                      <option>Intermediate</option>
                      <option>Senior Level</option>
                      <option>Lead/Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline *</label>
                    <input type="date" required value={newJob.deadline} onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })} className="input-professional" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements *</label>
                  <textarea rows={3} required value={newJob.requirements} onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })} className="input-professional" placeholder="List the required qualifications and skills"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibilities *</label>
                  <textarea rows={3} required value={newJob.responsibilities} onChange={(e) => setNewJob({ ...newJob, responsibilities: e.target.value })} className="input-professional" placeholder="Describe the job responsibilities"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Link *</label>
                  <input type="url" required value={newJob.applicationLink} onChange={(e) => setNewJob({ ...newJob, applicationLink: e.target.value })} className="input-professional" placeholder="https://example.com/apply" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL where applicants can apply for this position</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowPostModal(false); resetForm() }} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" disabled={postingJob} className="flex-1 btn-primary disabled:opacity-70 disabled:cursor-not-allowed">
                    {postingJob ? 'Saving...' : editingJobId ? 'Update Job' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Job Details</h2>
                <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{showDetailModal.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{showDetailModal.company}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className="card-tag card-tag-teal"><i className="fas fa-briefcase text-[10px]"></i> {showDetailModal.type}</span>
                <span className="card-tag card-tag-teal"><i className="fas fa-house text-[10px]"></i> {showDetailModal.workMode}</span>
                <span className="card-tag card-tag-amber"><i className="fas fa-chart-line text-[10px]"></i> {showDetailModal.experience}</span>
                <span className={`card-tag ${showDetailModal.status === 'approved' ? 'card-tag-green' : showDetailModal.status === 'rejected' ? 'card-tag-amber' : 'card-tag-teal'}`}>
                  {showDetailModal.status}
                </span>
              </div>

              <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400"><i className="fas fa-money-bill-wave mr-2 text-teal-500"></i>Salary</span>
                  <span className="font-medium text-gray-800 dark:text-white">{showDetailModal.salary}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400"><i className="fas fa-map-marker-alt mr-2 text-amber-500"></i>Location</span>
                  <span className="font-medium text-gray-800 dark:text-white">{showDetailModal.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400"><i className="fas fa-calendar mr-2 text-teal-500"></i>Deadline</span>
                  <span className="font-medium text-gray-800 dark:text-white">{showDetailModal.deadline}</span>
                </div>
              </div>

              {showDetailModal.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Core Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {showDetailModal.skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Requirements</h4>
                <ul className="space-y-2">
                  {(showDetailModal.requirements.length > 0 ? showDetailModal.requirements : ['No requirements specified']).map((req, idx) => (
                    <li key={`${req}-${idx}`} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-teal-500 mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Responsibilities</h4>
                <ul className="space-y-2">
                  {(showDetailModal.responsibilities.length > 0 ? showDetailModal.responsibilities : ['See job description']).map((resp, idx) => (
                    <li key={`${resp}-${idx}`} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-teal-500 mt-1">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Posted By</h4>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{showDetailModal.postedBy.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Posted {showDetailModal.posted}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowDetailModal(null)} className="flex-1 btn-secondary">Close</button>
                <a
                  href={showDetailModal.applicationLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Apply Now <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="card-grid">
              {jobs.map((job) => {
                const canManage = canManageJob(job)
                const isApplied = appliedJobs.includes(job.id)

                return (
                  <BaseCard key={job.id} className="hover:-translate-y-1 transition-transform duration-300">
                    <BaseCard.Header>
                      <div className="card-icon bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                        <i className="fas fa-briefcase text-base"></i>
                      </div>
                      <button
                        onClick={() => handleSaveJob(job.id)}
                        className={`p-1.5 transition-colors ${savedJobs.includes(job.id) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-300 hover:text-gray-500'}`}
                      >
                        <i className={`${savedJobs.includes(job.id) ? 'fas' : 'far'} fa-bookmark text-lg`}></i>
                      </button>
                    </BaseCard.Header>

                    <BaseCard.Body>
                      <h3 className="card-title">{job.title}</h3>
                      <p className="card-subtitle">{job.company}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <i className="fas fa-money-bill-wave text-teal-500"></i>
                            Salary
                          </span>
                          <span className="font-medium text-gray-800 dark:text-white text-xs">{job.salary}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <i className="fas fa-map-marker-alt text-amber-500"></i>
                            Location
                          </span>
                          <span className="font-medium text-gray-800 dark:text-white text-xs">{job.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="card-tag card-tag-teal">{job.type}</span>
                        <span className="card-tag card-tag-teal">{job.workMode}</span>
                        <span className="card-tag card-tag-amber">{job.experience}</span>
                      </div>

                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {job.skills.map((skill) => (
                            <span key={skill} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="card-description line-clamp-1 mb-3">
                        {job.shortDescription}
                      </p>

                      <div className="space-y-1.5 mb-3">
                        <div className="card-meta">
                          <i className="fas fa-calendar-day text-amber-500"></i>
                          <span>Deadline: {job.deadline}</span>
                        </div>
                        <div className="card-meta">
                          <i className="far fa-clock"></i>
                          <span>Posted {job.posted}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {job.postRole === 'admin' ? 'Admin Post' : 'User Post'}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                          job.status === 'approved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : job.status === 'rejected'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="card-meta mb-1">
                        <i className="fas fa-user-circle text-teal-500"></i>
                        <span>Posted by</span>
                        <span className="font-medium text-teal-600 dark:text-teal-400">{job.postedBy.name}</span>
                      </div>

                      {canManage && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => handleEditJob(job)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            disabled={deletingJobId === job.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-60"
                          >
                            {deletingJobId === job.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </BaseCard.Body>

                    <BaseCard.Footer>
                      <button
                        onClick={() => setShowDetailModal(job)}
                        className="card-btn-outline"
                      >
                        View Details
                      </button>
                      <a
                        href={job.applicationLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => {
                          if (!isLoggedIn) {
                            event.preventDefault()
                            redirectToLogin()
                            return
                          }
                          handleApply(job.id)
                        }}
                        className="card-btn-primary"
                      >
                        {isApplied ? 'Applied' : 'Apply Now'} <i className="fas fa-external-link-alt text-xs"></i>
                      </a>
                    </BaseCard.Footer>
                  </BaseCard>
                )
              })}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
                <p>No jobs found matching your criteria</p>
                <button onClick={() => setFilters(INITIAL_FILTERS)} className="mt-4 text-teal-600 hover:underline">Clear all filters</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Jobs
