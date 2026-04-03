import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
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

function Jobs() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [appliedJobs, setAppliedJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [jobTypeOptions, setJobTypeOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [experienceOptions, setExperienceOptions] = useState([])
  const [showPostModal, setShowPostModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', type: '', experience: '', deadline: '', requirements: '', responsibilities: '', applicationLink: '' })
  const [editingJobId, setEditingJobId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const jobsCacheRef = useRef(new Map())
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'

  const clearJobsCache = () => {
    jobsCacheRef.current.clear()
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
    console.debug('[Jobs] selected filters', filters)
  }, [filters])

  // Fetch jobs from API with combined filters
  useEffect(() => {
    const fetchJobs = async () => {
      const cacheKey = JSON.stringify(activeFilters)
      if (jobsCacheRef.current.has(cacheKey)) {
        const cached = jobsCacheRef.current.get(cacheKey)
        console.debug('[Jobs] cache hit', activeFilters)
        setJobs(cached)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.debug('[Jobs] API request params', activeFilters)
        const response = await jobsAPI.getAll(activeFilters)
        if (response.success) {
          const formattedJobs = response.jobs.map(job => ({
            id: job._id,
            ownerId: job.createdBy?._id || job.createdBy || job.postedBy?._id || job.postedBy,
            title: job.title,
            company: job.company,
            location: job.location || 'Remote',
            type: job.type || 'Full-time',
            posted: getTimeAgo(job.createdAt),
            salary: job.salary ? `${job.salary.currency} ${job.salary.min?.toLocaleString()}-${job.salary.max?.toLocaleString()}` : 'Competitive',
            experience: job.experience || 'Entry Level',
            deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open',
            rawDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
            status: job.status || 'approved',
            role: job.role || 'user',
            postedByAlumni: (job.postedBy?.role || job.postedBy?.userType || '').toLowerCase() === 'alumni',
            postedBy: job.postedBy ? { 
              name: job.postedBy.fullName, 
              type: (job.postedBy.role || job.postedBy.userType || 'Alumni').replace(/^./, (c) => c.toUpperCase()), 
              batch: job.postedBy.batch,
              position: `${job.postedBy.currentPosition || ''} at ${job.postedBy.company || ''}`
            } : { name: 'CUET Alumni', type: 'Alumni' },
            requirements: job.requirements || [],
            responsibilities: job.responsibilities || [],
            skills: job.skills || [],
            description: job.description || '',
            applicationLink: job.applyLink || '#',
            icon: 'fa-briefcase',
            iconColor: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'
          }))

          console.debug('[Jobs] response count', formattedJobs.length)
          const nextJobTypeOptions = buildOptionsFromValues(formattedJobs.map(job => job.type))
          const nextLocationOptions = buildOptionsFromValues(formattedJobs.map(job => job.location))
          const nextExperienceOptions = buildOptionsFromValues(formattedJobs.map(job => job.experience))

          setJobTypeOptions(prev => mergeDynamicOptions(prev, nextJobTypeOptions))
          setLocationOptions(prev => mergeDynamicOptions(prev, nextLocationOptions))
          setExperienceOptions(prev => mergeDynamicOptions(prev, nextExperienceOptions))
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
  }, [activeFilters])

  // Helper function to get time ago
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

  const jobTypes = [{ label: 'All Job Types', value: '' }, ...jobTypeOptions]
  const locations = [{ label: 'All Locations', value: '' }, ...locationOptions]
  const experienceLevels = [{ label: 'Experience Level', value: '' }, ...experienceOptions]

  const handleApply = (jobId) => {
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }
    setAppliedJobs([...appliedJobs, jobId])
  }

  const handleSaveJob = (jobId) => {
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId))
    } else {
      setSavedJobs([...savedJobs, jobId])
    }
  }

  const canManageJob = (job) => {
    if (!job) return false
    if (isAdmin) return true
    const authUserId = String(user?._id || user?.id || '')
    return Boolean(authUserId) && String(job.ownerId || '') === authUserId
  }

  const openCreateModal = () => {
    setEditingJobId(null)
    setNewJob({ title: '', company: '', location: '', type: '', experience: '', deadline: '', requirements: '', responsibilities: '', applicationLink: '' })
    setSubmitMessage('')
    setShowPostModal(true)
  }

  const openEditModal = (job) => {
    if (!canManageJob(job)) return
    setEditingJobId(job.id)
    setNewJob({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      experience: job.experience || '',
      deadline: job.rawDeadline || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join(', ') : '',
      applicationLink: job.applicationLink || '',
    })
    setSubmitMessage('')
    setShowPostModal(true)
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }
    setSubmitting(true)
    setSubmitMessage('')
    try {
      const requirements = newJob.requirements
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      let successText = ''

      const payload = {
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        type: newJob.type,
        requirements,
        description: newJob.responsibilities || newJob.requirements,
        deadline: newJob.deadline,
        applyLink: newJob.applicationLink,
      }

      if (editingJobId) {
        await jobsAPI.update(editingJobId, payload)
        successText = 'Job updated successfully.'
        setSubmitMessage(successText)
      } else {
        const createRes = await jobsAPI.create(payload)
        if (createRes?.job?.status === 'pending') {
          successText = 'Job submitted for admin approval.'
        } else {
          successText = 'Job posted successfully.'
        }
        setSubmitMessage(successText)
      }

      clearJobsCache()
      const refreshed = await jobsAPI.getAll(activeFilters)
      if (refreshed.success) {
        const refreshedJobs = refreshed.jobs.map(job => ({
          id: job._id,
          ownerId: job.createdBy?._id || job.createdBy || job.postedBy?._id || job.postedBy,
          title: job.title,
          company: job.company,
          location: job.location || 'Remote',
          type: job.type || 'Full-time',
          posted: getTimeAgo(job.createdAt),
          salary: job.salary ? `${job.salary.currency} ${job.salary.min?.toLocaleString()}-${job.salary.max?.toLocaleString()}` : 'Competitive',
          experience: job.experience || 'Entry Level',
          deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open',
          rawDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
          status: job.status || 'approved',
          role: job.role || 'user',
          postedByAlumni: (job.postedBy?.role || job.postedBy?.userType || '').toLowerCase() === 'alumni',
          postedBy: job.postedBy
            ? {
                name: job.postedBy.fullName,
                type: (job.postedBy.role || job.postedBy.userType || 'Alumni').replace(/^./, (c) => c.toUpperCase()),
                batch: job.postedBy.batch,
                position: `${job.postedBy.currentPosition || ''} at ${job.postedBy.company || ''}`,
              }
            : { name: 'CUET Alumni', type: 'Alumni' },
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          skills: job.skills || [],
          description: job.description || '',
          applicationLink: job.applyLink || '#',
          icon: 'fa-briefcase',
          iconColor: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400',
        }))
        setJobs(refreshedJobs)
      }

      setEditingJobId(null)
      setNewJob({ title: '', company: '', location: '', type: '', experience: '', deadline: '', requirements: '', responsibilities: '', applicationLink: '' })
      setShowPostModal(false)
      if (successText) {
        window.alert(successText)
      }
    } catch (error) {
      setSubmitMessage(error.message || 'Failed to submit job.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteJob = async (job) => {
    if (!canManageJob(job)) return
    if (!window.confirm(`Delete job "${job.title}"? This action cannot be undone.`)) return

    try {
      await jobsAPI.delete(job.id)
      clearJobsCache()
      setJobs((prev) => prev.filter((entry) => entry.id !== job.id))
      if (showDetailModal?.id === job.id) {
        setShowDetailModal(null)
      }
    } catch (error) {
      window.alert(error.message || 'Failed to delete job.')
    }
  }

  const filteredJobs = jobs

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">Job Opportunities</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Explore career opportunities shared by the CUET community</p>
            {jobs.map(job => job.jobImage && <img key={job.id} src={job.jobImage} alt="Job" className="h-12 w-12 rounded object-cover mr-2 inline-block" />)}
          </div>
          <button 
            onClick={() => isLoggedIn ? openCreateModal() : navigateToLogin()}
            className="mt-4 md:mt-0 btn-primary flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Post a Job
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
              placeholder="Search jobs by title, company, or keywords..."
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
            <select value={filters.type} onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {jobTypes.map(type => <option key={type.label} value={type.value}>{type.label}</option>)}
            </select>
            <select value={filters.location} onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {locations.map(loc => <option key={loc.label} value={loc.value}>{loc.label}</option>)}
            </select>
            <select value={filters.experience} onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {experienceLevels.map(exp => <option key={exp.label} value={exp.value}>{exp.label}</option>)}
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

        {/* Post Job Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingJobId ? 'Edit Job Opportunity' : 'Post a Job Opportunity'}</h2>
                <button onClick={() => { setShowPostModal(false); setEditingJobId(null); }} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                    <input type="text" required value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} className="input-professional" placeholder="Enter company name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Role/Title *</label>
                    <input type="text" required value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} className="input-professional" placeholder="e.g., Software Engineer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                    <input type="text" required value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} className="input-professional" placeholder="e.g., Dhaka, Remote" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type *</label>
                    <select required value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})} className="input-professional">
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
                    <select required value={newJob.experience} onChange={(e) => setNewJob({...newJob, experience: e.target.value})} className="input-professional">
                      <option value="">Select experience level</option>
                      <option>Entry Level</option>
                      <option>Intermediate</option>
                      <option>Senior Level</option>
                      <option>Lead/Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline *</label>
                    <input type="date" required value={newJob.deadline} onChange={(e) => setNewJob({...newJob, deadline: e.target.value})} className="input-professional" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements *</label>
                  <textarea rows={3} required value={newJob.requirements} onChange={(e) => setNewJob({...newJob, requirements: e.target.value})} className="input-professional" placeholder="List the required qualifications and skills"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibilities *</label>
                  <textarea rows={3} required value={newJob.responsibilities} onChange={(e) => setNewJob({...newJob, responsibilities: e.target.value})} className="input-professional" placeholder="Describe the job responsibilities"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Link *</label>
                  <input type="url" required value={newJob.applicationLink} onChange={(e) => setNewJob({...newJob, applicationLink: e.target.value})} className="input-professional" placeholder="https://example.com/apply" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL where applicants can apply for this position</p>
                </div>
                {submitMessage && (
                  <p className={`text-sm ${submitMessage.toLowerCase().includes('failed') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {submitMessage}
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowPostModal(false); setEditingJobId(null); }} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-60">{submitting ? 'Saving...' : editingJobId ? 'Update Job' : 'Post Job'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Job Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Job Details</h2>
                <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Title & Company */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{showDetailModal.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{showDetailModal.company}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${showDetailModal.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {showDetailModal.role === 'admin' ? 'Admin Post' : 'User Post'}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${showDetailModal.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : showDetailModal.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                    {showDetailModal.status || 'pending'}
                  </span>
                </div>
              </div>

              {/* Job Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-info-circle text-gray-400"></i> Job Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Job Type:</span>
                    <p className="text-teal-600 dark:text-teal-400 font-medium">{showDetailModal.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                    <p className="text-teal-600 dark:text-teal-400 font-medium">{showDetailModal.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{showDetailModal.experience}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{showDetailModal.deadline || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-list text-gray-400"></i> Requirements
                </h4>
                <ul className="space-y-2">
                  {(showDetailModal.requirements && Array.isArray(showDetailModal.requirements) ? showDetailModal.requirements : [showDetailModal.description || 'No requirements specified']).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-teal-500 mt-1">*</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-list text-gray-400"></i> Responsibilities
                </h4>
                <ul className="space-y-2">
                  {(showDetailModal.responsibilities && Array.isArray(showDetailModal.responsibilities) ? showDetailModal.responsibilities : ['See job description']).map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-teal-500 mt-1">*</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Posted By */}
              <div className="mb-6 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-user text-gray-400"></i> Posted By
                </h4>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 dark:text-white">{showDetailModal.postedBy.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">{showDetailModal.postedBy.type}, Batch {showDetailModal.postedBy.batch}</p>
                  <p className="text-gray-500 dark:text-gray-400">{showDetailModal.postedBy.position || ''}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={() => setShowDetailModal(null)} className="flex-1 btn-secondary">Close</button>
                {canManageJob(showDetailModal) && (
                  <button onClick={() => { setShowDetailModal(null); openEditModal(showDetailModal); }} className="flex-1 btn-secondary">Edit</button>
                )}
                {canManageJob(showDetailModal) && (
                  <button onClick={() => handleDeleteJob(showDetailModal)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-colors">Delete</button>
                )}
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

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
        <>
        {/* Job Cards */}
        <div className="card-grid">
          {filteredJobs.map(job => (
            <BaseCard key={job.id}>
              <BaseCard.Header>
                <div className={`card-icon ${job.iconColor}`}>
                  <i className={`fas ${job.icon} text-base`}></i>
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

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="card-tag card-tag-teal">
                    <i className="fas fa-briefcase text-[10px]"></i> {job.type}
                  </span>
                  <span className="card-tag card-tag-teal">
                    <i className="fas fa-map-marker-alt text-[10px]"></i> {job.location.split(',')[0]}
                  </span>
                  <span className="card-tag card-tag-teal">
                    <i className="fas fa-star text-[10px]"></i> {job.experience.split(' (')[0]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {job.role === 'admin' ? 'Admin Post' : 'User Post'}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : job.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                    {job.status || 'pending'}
                  </span>
                </div>

                <p className="card-description line-clamp-3 mb-4">
                  {Array.isArray(job.requirements) ? job.requirements.slice(0, 2).join('. ') + '.' : job.description}
                </p>

                <div className="card-meta mb-1">
                  <i className="fas fa-user-circle text-teal-500"></i>
                  <span>Posted by</span>
                  <span className="font-medium text-teal-600 dark:text-teal-400">{job.postedBy.name}</span>
                  <span className="text-gray-400 dark:text-gray-500">({job.postedBy.type}, Batch {job.postedBy.batch})</span>
                </div>
                <div className="card-meta">
                  <i className="far fa-clock"></i>
                  <span>Posted {job.posted}</span>
                </div>
              </BaseCard.Body>

              <BaseCard.Footer>
                <button 
                  onClick={() => setShowDetailModal(job)}
                  className="card-btn-outline"
                >
                  View Details
                </button>
                {canManageJob(job) && (
                  <button
                    onClick={() => openEditModal(job)}
                    className="card-btn-outline"
                  >
                    Edit
                  </button>
                )}
                {canManageJob(job) && (
                  <button
                    onClick={() => handleDeleteJob(job)}
                    className="card-btn-outline text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/40 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                )}
                <a 
                  href={job.applicationLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-btn-primary"
                >
                  Apply Now <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </BaseCard.Footer>
            </BaseCard>
          ))}
        </div>
        
        {filteredJobs.length === 0 && !loading && (
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
