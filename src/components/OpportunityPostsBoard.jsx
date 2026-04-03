import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { postsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BaseCard from './BaseCard'

const INITIAL_FORM = {
  title: '',
  providerName: '',
  description: '',
  deadline: '',
}

const asTrimmed = (value) => String(value || '').trim()
const asLower = (value) => asTrimmed(value).toLowerCase()

const mergeOptions = (previousOptions, incomingValues) => {
  const next = new Set(previousOptions)
  incomingValues
    .map((value) => asTrimmed(value))
    .filter(Boolean)
    .forEach((value) => next.add(value))

  return Array.from(next).sort((a, b) => a.localeCompare(b))
}

const formatDate = (value) => {
  if (!value) return 'No deadline'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No deadline'
  return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const formatPostedTime = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Recently'

  const diffMs = Date.now() - parsed.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
  return `${Math.ceil(diffDays / 30)} months ago`
}

const roleBadgeClass = (role) => (
  role === 'admin'
    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
    : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
)

const statusBadgeClass = (status) => (
  status === 'approved'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    : status === 'rejected'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
)

const normalizePost = (post) => ({
  id: post._id,
  title: post.title,
  description: post.description,
  type: post.type,
  providerName: post.providerName,
  deadline: post.deadline,
  createdAt: post.createdAt,
  createdBy: post.createdBy || null,
  role: post.role || 'user',
  status: post.status || 'approved',
})

function OpportunityPostsBoard({
  postType,
  pageTitle,
  pageDescription,
  providerLabel,
  createButtonLabel,
  emptyStateMessage,
}) {
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [posts, setPosts] = useState([])
  const [providerOptions, setProviderOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [filters, setFilters] = useState({ search: '', providerName: '' })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 9 })
  const [status, setStatus] = useState({ type: '', message: '' })

  const currentUserId = String(user?._id || user?.id || '')

  const navigateToLogin = () => {
    navigate('/login', { state: { from: location } })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(asLower(filters.search))
    }, 300)

    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setStatus((prev) => (prev.type === 'error' ? { type: '', message: '' } : prev))

      const response = await postsAPI.getAll({
        type: postType,
        page,
        limit: pagination.limit,
        search: debouncedSearch,
        providerName: filters.providerName,
      })

      if (response.success) {
        const normalizedPosts = (response.posts || [])
          .map(normalizePost)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        setPosts(normalizedPosts)
        setProviderOptions((prev) => mergeOptions(prev, normalizedPosts.map((post) => post.providerName)))

        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.pagination,
          }))
        }
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to load posts.' })
    } finally {
      setLoading(false)
    }
  }, [postType, page, pagination.limit, debouncedSearch, filters.providerName])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const headingIcon = useMemo(() => (
    postType === 'job' ? 'fa-briefcase' : 'fa-graduation-cap'
  ), [postType])

  const openCreateModal = () => {
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }

    setEditingPost(null)
    setFormData(INITIAL_FORM)
    setShowFormModal(true)
    setStatus({ type: '', message: '' })
  }

  const openEditModal = (post) => {
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }

    if (String(post.createdBy?._id || post.createdBy) !== currentUserId) {
      return
    }

    const rawDeadline = post.deadline ? new Date(post.deadline) : null
    const formattedDeadline = rawDeadline && !Number.isNaN(rawDeadline.getTime())
      ? rawDeadline.toISOString().split('T')[0]
      : ''

    setEditingPost(post)
    setFormData({
      title: post.title || '',
      providerName: post.providerName || '',
      description: post.description || '',
      deadline: formattedDeadline,
    })
    setShowFormModal(true)
    setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isLoggedIn) {
      navigateToLogin()
      return
    }

    const title = asTrimmed(formData.title)
    const providerName = asTrimmed(formData.providerName)
    const description = asTrimmed(formData.description)

    if (!title || !providerName || !description) {
      setStatus({ type: 'error', message: 'Title, provider, and description are required.' })
      return
    }

    setSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const payload = {
        title,
        providerName,
        description,
        type: postType,
        deadline: formData.deadline ? formData.deadline : null,
      }

      if (editingPost) {
        await postsAPI.update(editingPost.id, payload)
        setStatus({ type: 'success', message: 'Post updated successfully.' })
      } else {
        await postsAPI.create(payload)
        setStatus({ type: 'success', message: 'Post created successfully.' })
        setPage(1)
      }

      setShowFormModal(false)
      setEditingPost(null)
      setFormData(INITIAL_FORM)
      await fetchPosts()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save post.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (post) => {
    if (!isLoggedIn) {
      navigateToLogin()
      return
    }

    const isOwner = String(post.createdBy?._id || post.createdBy) === currentUserId
    if (!isOwner) {
      return
    }

    const confirmed = window.confirm('Delete this post permanently?')
    if (!confirmed) {
      return
    }

    try {
      await postsAPI.delete(post.id)
      setStatus({ type: 'success', message: 'Post deleted successfully.' })

      const isLastItemOnPage = posts.length === 1
      if (isLastItemOnPage && page > 1) {
        setPage((prev) => prev - 1)
      } else {
        await fetchPosts()
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to delete post.' })
    }
  }

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">{pageTitle}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{pageDescription}</p>
          </div>

          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <i className="fas fa-plus"></i>
            {createButtonLabel}
          </button>
        </div>

        {status.message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              status.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-search"></i>
              </div>
              <input
                type="text"
                placeholder={`Search ${postType} posts...`}
                value={filters.search}
                onChange={(event) => {
                  setPage(1)
                  setFilters((prev) => ({ ...prev, search: event.target.value }))
                }}
                className="input-professional pl-12"
              />
            </div>

            <select
              value={filters.providerName}
              onChange={(event) => {
                setPage(1)
                setFilters((prev) => ({ ...prev, providerName: event.target.value }))
              }}
              className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Providers</option>
              {providerOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {showFormModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingPost ? 'Edit Post' : createButtonLabel}
                </h2>
                <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                    className="input-professional"
                    placeholder={postType === 'job' ? 'e.g., Frontend Developer' : 'e.g., Commonwealth Scholarship'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{providerLabel}</label>
                  <input
                    type="text"
                    required
                    value={formData.providerName}
                    onChange={(event) => setFormData((prev) => ({ ...prev, providerName: event.target.value }))}
                    className="input-professional"
                    placeholder={postType === 'job' ? 'e.g., Google' : 'e.g., Fulbright Program'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                    className="input-professional"
                    placeholder="Share key details, requirements, and eligibility..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline (optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(event) => setFormData((prev) => ({ ...prev, deadline: event.target.value }))}
                    className="input-professional"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 btn-primary disabled:opacity-50">
                    {submitting ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-14 text-gray-500 dark:text-gray-400">
            <i className={`fas ${headingIcon} text-4xl mb-4 opacity-50`}></i>
            <p>{emptyStateMessage}</p>
          </div>
        ) : (
          <>
            <div className="card-grid">
              {posts.map((post) => {
                const createdById = String(post.createdBy?._id || post.createdBy || '')
                const isOwner = createdById !== '' && createdById === currentUserId

                return (
                  <BaseCard key={post.id}>
                    <BaseCard.Header>
                      <div className={`card-icon ${post.type === 'job' ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
                        <i className={`fas ${post.type === 'job' ? 'fa-briefcase' : 'fa-graduation-cap'} text-base`}></i>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="card-tag card-tag-teal capitalize">{post.type}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadgeClass(post.role)}`}>
                          {post.role === 'admin' ? 'Admin Post' : 'User Post'}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                    </BaseCard.Header>

                    <BaseCard.Body>
                      <h3 className="card-title">{post.title}</h3>
                      <p className="card-subtitle">{post.providerName}</p>

                      <p className="card-description mb-3">{post.description}</p>

                      <div className="card-meta mb-1">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Deadline: {formatDate(post.deadline)}</span>
                      </div>
                      <div className="card-meta mb-1">
                        <i className="fas fa-clock"></i>
                        <span>Posted {formatPostedTime(post.createdAt)}</span>
                      </div>
                      <div className="card-meta">
                        <i className="fas fa-user-circle text-teal-500"></i>
                        <span>
                          Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{post.createdBy?.fullName || 'Unknown user'}</span>
                        </span>
                      </div>
                    </BaseCard.Body>

                    {isOwner && (
                      <BaseCard.Footer>
                        <button onClick={() => openEditModal(post)} className="card-btn-outline">Edit</button>
                        <button onClick={() => handleDelete(post)} className="card-btn-primary bg-red-600 hover:bg-red-700">Delete</button>
                      </BaseCard.Footer>
                    )}
                  </BaseCard>
                )
              })}
            </div>

            {pagination.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default OpportunityPostsBoard
