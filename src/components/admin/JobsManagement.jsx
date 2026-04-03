import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal';

const emptyJob = {
  company: '',
  title: '',
  location: '',
  type: '',
  experience: '',
  deadline: '',
  requirements: '',
  responsibilities: '',
  applicationLink: ''
};

function JobsManagement({ showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyJob);

  const loadJobs = useCallback(async (p = page, s = search, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminAPI.getJobs({ page: p, limit: 10, search: s, status });
      setJobs(res.jobs || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      setStatusCounts(res.statusCounts || { pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      showToast(err.message || 'Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, showToast]);

  useEffect(() => {
    const t = setTimeout(() => loadJobs(page, search, statusFilter), 300);
    return () => clearTimeout(t);
  }, [page, search, statusFilter, loadJobs]);

  const openCreate = () => { setEditId(null); setForm(emptyJob); setFormOpen(true); };
  const openEdit = (job) => {
    setEditId(job._id);
    setForm({
      company: job.company || '',
      title: job.title || '',
      location: job.location || '',
      type: job.type || '',
      experience: job.experience || '',
      deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      requirements: (job.requirements || []).join('\n'),
      responsibilities: (job.responsibilities || []).join('\n'),
      applicationLink: job.applyLink || ''
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const requirementsList = String(form.requirements || '')
        .split(/\r?\n|,/) 
        .map((entry) => entry.trim())
        .filter(Boolean);

      const responsibilitiesList = String(form.responsibilities || '')
        .split(/\r?\n|,/) 
        .map((entry) => entry.trim())
        .filter(Boolean);

      const payload = {
        company: form.company,
        title: form.title,
        location: form.location,
        type: form.type,
        experience: form.experience,
        deadline: form.deadline,
        requirements: requirementsList,
        responsibilities: responsibilitiesList,
        description: responsibilitiesList.join('. ') || requirementsList.join('. ') || `${form.title} at ${form.company}`,
        applicationLink: form.applicationLink,
        applyLink: form.applicationLink,
      };
      if (editId) {
        await adminAPI.updateJob(editId, payload);
        showToast('Job updated');
      } else {
        await adminAPI.createJob(payload);
        showToast('Job created');
      }
      setFormOpen(false);
      setForm(emptyJob);
      setEditId(null);
      loadJobs(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || 'Failed to save job', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminAPI.deleteJob(deleteTarget._id);
      showToast('Job deleted');
      setDeleteTarget(null);
      loadJobs(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (job) => {
    setActionLoading(true);
    try {
      await adminAPI.approveJob(job._id);
      showToast('Job approved');
      loadJobs(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || 'Approve failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (job) => {
    setActionLoading(true);
    try {
      await adminAPI.rejectJob(job._id);
      showToast('Job rejected');
      loadJobs(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || 'Reject failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow-lg md:p-5 dark:bg-gray-800">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Jobs Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{pagination.total} jobs total</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pending: {statusCounts.pending || 0}</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Approved: {statusCounts.approved || 0}</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">Rejected: {statusCounts.rejected || 0}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={openCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + Add Job
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{editId ? 'Edit Job Opportunity' : 'Post a Job Opportunity'}</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name *</label>
              <input
                required
                placeholder="Enter company name"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Job Role/Title *</label>
              <input
                required
                placeholder="e.g., Software Engineer"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Location *</label>
              <input
                required
                placeholder="e.g., Dhaka, Remote"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Job Type *</label>
              <select
                required
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select job type</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Remote</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Experience Level *</label>
              <select
                required
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select experience level</option>
                <option>Entry Level</option>
                <option>Intermediate</option>
                <option>Senior Level</option>
                <option>Lead/Manager</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Application Deadline *</label>
              <input
                required
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Requirements *</label>
            <textarea
              rows={3}
              required
              placeholder="List the required qualifications and skills"
              value={form.requirements}
              onChange={e => setForm({ ...form, requirements: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Responsibilities *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe the job responsibilities"
              value={form.responsibilities}
              onChange={e => setForm({ ...form, responsibilities: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Application Link *</label>
            <input
              type="url"
              required
              placeholder="https://example.com/apply"
              value={form.applicationLink}
              onChange={e => setForm({ ...form, applicationLink: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">URL where applicants can apply for this position</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={actionLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {actionLoading ? 'Saving...' : editId ? 'Update Job' : 'Post Job'}
            </button>
            <button type="button" onClick={() => { setFormOpen(false); setEditId(null); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>
      ) : jobs.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No jobs found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Company</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Posted By</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {jobs.map(job => (
                <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">
                    {job.jobImage && <img src={job.jobImage} alt="Job" className="h-8 w-8 rounded object-cover mr-2 inline-block" />}
                    {job.title}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{job.company}</td>
                  <td className="px-4 py-2.5 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {job.role === 'admin' ? 'Admin Post' : 'User Post'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : job.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                      {job.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{job.type}</span></td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{job.postedBy?.fullName || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    {job.status !== 'approved' && (
                      <button onClick={() => handleApprove(job)} className="mr-2 text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">Approve</button>
                    )}
                    {job.status !== 'rejected' && (
                      <button onClick={() => handleReject(job)} className="mr-2 text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400">Reject</button>
                    )}
                    <button onClick={() => openEdit(job)} className="mr-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">Edit</button>
                    <button onClick={() => setDeleteTarget(job)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete job?"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </section>
  );
}

export default JobsManagement;
