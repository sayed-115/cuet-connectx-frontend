import { useCallback, useEffect, useMemo, useState } from 'react'
import { postsAPI } from '../../services/api'

const INITIAL_FORM = {
  title: '',
  providerName: '',
  description: '',
  type: 'job',
  deadline: '',
}

const asTrimmed = (value) => String(value || '').trim()

const normalizePost = (post) => ({
  id: post._id,
  title: post.title,
  description: post.description,
  type: post.type,
  providerName: post.providerName,
  deadline: post.deadline,
  role: post.role,
  status: post.status,
  createdAt: post.createdAt,
  createdBy: post.createdBy,
})

const formatDate = (value) => {
  if (!value) return 'No deadline'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'No deadline'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function PostsManagement({ showToast }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await postsAPI.getAll({
        includeAll: true,
        page,
        limit: pagination.limit,
        search,
        type: typeFilter,
        status: statusFilter,
      })

      if (response.success) {
        const normalized = (response.posts || []).map(normalizePost)
        setPosts(normalized)
        if (response.pagination) {
          setPagination((prev) => ({ ...prev, ...response.pagination }))
        }
      }
    } catch (error) {
      showToast(error.message || 'Failed to load posts', 'error')
    } finally {
      setLoading(false)
    }
  }, [page, pagination.limit, search, typeFilter, statusFilter, showToast])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadPosts])

  const groupedPosts = useMemo(() => {
    const grouped = {
      pending: [],
      approved: [],
      rejected: [],
    }

    posts.forEach((post) => {
      if (grouped[post.status]) {
        grouped[post.status].push(post)
      }
    })

    return grouped
  }, [posts])

  const openCreateModal = () => {
    setEditingPost(null)
    setFormData(INITIAL_FORM)
    setShowModal(true)
  }

  const openEditModal = (post) => {
    const dateValue = post.deadline ? new Date(post.deadline) : null
    const deadline = dateValue && !Number.isNaN(dateValue.getTime()) ? dateValue.toISOString().split('T')[0] : ''

    setEditingPost(post)
    setFormData({
      title: post.title,
      providerName: post.providerName,
      description: post.description,
      type: post.type,
      deadline,
    })
    setShowModal(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const title = asTrimmed(formData.title)
    const providerName = asTrimmed(formData.providerName)
    const description = asTrimmed(formData.description)

    if (!title || !providerName || !description) {
      showToast('Title, provider, and description are required', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title,
        providerName,
        description,
        type: formData.type,
        deadline: formData.deadline ? formData.deadline : null,
      }

      if (editingPost) {
        await postsAPI.update(editingPost.id, payload)
        showToast('Post updated successfully')
      } else {
        await postsAPI.create(payload)
        showToast('Post created successfully')
      }

      setShowModal(false)
      setEditingPost(null)
      setFormData(INITIAL_FORM)
      await loadPosts()
    } catch (error) {
      showToast(error.message || 'Failed to save post', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete ${post.title}?`)) {
      return
    }

    try {
      await postsAPI.delete(post.id)
      showToast('Post deleted successfully')
      await loadPosts()
    } catch (error) {
      showToast(error.message || 'Failed to delete post', 'error')
    }
  }

  const handleApprove = async (post) => {
    try {
      await postsAPI.approve(post.id)
      showToast('Post approved successfully')
      await loadPosts()
    } catch (error) {
      showToast(error.message || 'Failed to approve post', 'error')
    }
  }

  const handleReject = async (post) => {
    try {
      await postsAPI.reject(post.id)
      showToast('Post rejected successfully')
      await loadPosts()
    } catch (error) {
      showToast(error.message || 'Failed to reject post', 'error')
    }
  }

  const renderRoleBadge = (role) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
      role === 'admin'
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
        : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
    }`}>
      {role === 'admin' ? 'Admin Post' : 'User Post'}
    </span>
  )

  const renderStatusBadge = (status) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
      status === 'approved'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
        : status === 'rejected'
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    }`}>
      {status}
    </span>
  )

  const statusSections = [
    { key: 'pending', label: 'Pending Posts', items: groupedPosts.pending },
    { key: 'approved', label: 'Approved Posts', items: groupedPosts.approved },
    { key: 'rejected', label: 'Rejected Posts', items: groupedPosts.rejected },
  ]

  return (
    <section className="rounded-xl bg-white p-4 shadow-lg md:p-5 dark:bg-gray-800">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Posts Moderation</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{pagination.total} posts total</p>
        </div>

        <button onClick={openCreateModal} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
          + Create Post (Admin)
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(event) => { setPage(1); setSearch(event.target.value) }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />

        <select
          value={typeFilter}
          onChange={(event) => { setPage(1); setTypeFilter(event.target.value) }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="job">Job</option>
          <option value="scholarship">Scholarship</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => { setPage(1); setStatusFilter(event.target.value) }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          onClick={() => {
            setSearch('')
            setTypeFilter('')
            setStatusFilter('')
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Clear Filters
        </button>
      </div>

      {showModal && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{editingPost ? 'Edit Post' : 'Create Admin Post'}</h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Title"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              <input
                type="text"
                required
                placeholder="Company / Provider"
                value={formData.providerName}
                onChange={(event) => setFormData((prev) => ({ ...prev, providerName: event.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              <select
                value={formData.type}
                onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="job">Job</option>
                <option value="scholarship">Scholarship</option>
              </select>

              <input
                type="date"
                value={formData.deadline}
                onChange={(event) => setFormData((prev) => ({ ...prev, deadline: event.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <textarea
              rows={4}
              required
              placeholder="Description"
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
              </button>
              <button type="button" onClick={() => { setShowModal(false); setEditingPost(null); setFormData(INITIAL_FORM) }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No posts found</p>
      ) : (
        <div className="space-y-6">
          {statusSections.map((section) => (
            <div key={section.key}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {section.label} ({section.items.length})
              </h3>

              {section.items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">No posts in this group</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Provider</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Post Info</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {section.items.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">{post.title}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 capitalize">{post.type}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{post.providerName}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {renderRoleBadge(post.role)}
                              <span className="text-xs text-gray-500 dark:text-gray-400">By {post.createdBy?.fullName || 'Unknown'} · {formatDate(post.deadline)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">{renderStatusBadge(post.status)}</td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openEditModal(post)} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">Edit</button>
                              {post.status !== 'approved' && (
                                <button onClick={() => handleApprove(post)} className="text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">Approve</button>
                              )}
                              {post.status !== 'rejected' && (
                                <button onClick={() => handleReject(post)} className="text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400">Reject</button>
                              )}
                              <button onClick={() => handleDelete(post)} className="text-sm text-rose-600 hover:text-rose-800 dark:text-rose-400">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Page {pagination.page} of {pagination.pages}</span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
            disabled={pagination.page >= pagination.pages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}

export default PostsManagement
