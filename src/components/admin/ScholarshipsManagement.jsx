import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal';

const emptySchol = {
  title: '',
  organization: 'CUET Community',
  level: '',
  location: '',
  fundingType: '',
  duration: '',
  amount: '',
  eligibility: '',
  benefits: '',
  description: '',
  deadline: '',
  link: '',
  scholarshipImage: ''
};

function ScholarshipsManagement({ showToast }) {
  const [scholarships, setScholarships] = useState([]);
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
  const [form, setForm] = useState(emptySchol);

  const loadScholarships = useCallback(async (p = page, s = search, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminAPI.getScholarships({ page: p, limit: 10, search: s, status });
      setScholarships(res.scholarships || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      setStatusCounts(res.statusCounts || { pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      showToast(err.message || 'Failed to load scholarships', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, showToast]);

  useEffect(() => {
    const t = setTimeout(() => loadScholarships(page, search, statusFilter), 300);
    return () => clearTimeout(t);
  }, [page, search, statusFilter, loadScholarships]);

  const openCreate = () => { setEditId(null); setForm(emptySchol); setFormOpen(true); };
  const openEdit = (s) => {
    setEditId(s._id);
    setForm({
      title: s.title || '',
      organization: s.organization || 'CUET Community',
      level: s.level || '',
      location: s.location || '',
      fundingType: s.fundingType || '',
      duration: s.duration || '',
      amount: s.amount || '',
      eligibility: s.eligibility || '',
      benefits: s.benefits || '',
      description: s.description || '',
      deadline: s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : '',
      link: s.link || '',
      scholarshipImage: s.scholarshipImage || ''
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        scholarshipName: form.title,
        title: form.title,
        level: form.level,
        location: form.location,
        fundingType: form.fundingType,
        duration: form.duration,
        fundingDetails: form.amount,
        amount: form.amount,
        deadline: form.deadline,
        scholarshipLink: form.link,
        link: form.link,
        eligibilityCriteria: form.eligibility,
        eligibility: form.eligibility,
        benefits: form.benefits,
        description: form.description,
        organization: form.organization || 'CUET Community',
        scholarshipImage: form.scholarshipImage || ''
      };
      if (editId) {
        await adminAPI.updateScholarship(editId, payload);
        showToast('Scholarship updated');
      } else {
        await adminAPI.createScholarship(payload);
        showToast('Scholarship created');
      }
      setFormOpen(false);
      setForm(emptySchol);
      setEditId(null);
      loadScholarships(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || 'Failed to save scholarship', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminAPI.deleteScholarship(deleteTarget._id);
      showToast('Scholarship deleted');
      setDeleteTarget(null);
      loadScholarships(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (scholarship) => {
    setActionLoading(true);
    try {
      await adminAPI.approveScholarship(scholarship._id);
      showToast('Scholarship approved');
      loadScholarships(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || 'Approve failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (scholarship) => {
    setActionLoading(true);
    try {
      await adminAPI.rejectScholarship(scholarship._id);
      showToast('Scholarship rejected');
      loadScholarships(page, search, statusFilter);
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scholarships Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{pagination.total} scholarships total</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pending: {statusCounts.pending || 0}</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Approved: {statusCounts.approved || 0}</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">Rejected: {statusCounts.rejected || 0}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Search scholarships..."
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
            + Add Scholarship
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{editId ? 'Edit Scholarship Opportunity' : 'Create Scholarship Opportunity'}</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Scholarship Name *</label>
            <input
              required
              placeholder="Enter scholarship name"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Level *</label>
              <select
                required
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select level</option>
                <option>Undergraduate</option>
                <option>Master's</option>
                <option>PhD</option>
                <option>Master's, PhD</option>
                <option>Postdoc</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Location *</label>
              <input
                required
                placeholder="e.g., USA, UK"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Funding Type *</label>
              <select
                required
                value={form.fundingType}
                onChange={e => setForm({ ...form, fundingType: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select funding type</option>
                <option>Full</option>
                <option>Partial</option>
                <option>Tuition Only</option>
                <option>Stipend</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Duration *</label>
              <input
                required
                placeholder="e.g., 2-3 years"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Funding Details *</label>
            <textarea
              required
              rows={2}
              placeholder="Describe what the scholarship covers (tuition, stipend, travel, etc.)"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Scholarship Link *</label>
              <input
                required
                type="url"
                placeholder="https://example.com/scholarship"
                value={form.link}
                onChange={e => setForm({ ...form, link: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Eligibility Criteria *</label>
            <textarea
              required
              rows={2}
              placeholder="List eligibility requirements"
              value={form.eligibility}
              onChange={e => setForm({ ...form, eligibility: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Benefits *</label>
            <textarea
              required
              rows={2}
              placeholder="Describe the scholarship benefits"
              value={form.benefits}
              onChange={e => setForm({ ...form, benefits: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide additional details about the scholarship"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={actionLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {actionLoading ? 'Saving...' : editId ? 'Update' : 'Create'}
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
      ) : scholarships.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No scholarships found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Organization</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Deadline</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Posted By</th>
                <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {scholarships.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">
                    {s.scholarshipImage && <img src={s.scholarshipImage} alt="Scholarship" className="h-8 w-8 rounded object-cover mr-2 inline-block" />}
                    {s.title}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{s.organization}</td>
                  <td className="px-4 py-2.5 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {s.role === 'admin' ? 'Admin Post' : 'User Post'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : s.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                      {s.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{s.amount || '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{s.deadline ? new Date(s.deadline).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{s.postedBy?.fullName || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-right">
                    {s.status !== 'approved' && (
                      <button onClick={() => handleApprove(s)} className="mr-2 text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">Approve</button>
                    )}
                    {s.status !== 'rejected' && (
                      <button onClick={() => handleReject(s)} className="mr-2 text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400">Reject</button>
                    )}
                    <button onClick={() => openEdit(s)} className="mr-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">Edit</button>
                    <button onClick={() => setDeleteTarget(s)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400">Delete</button>
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
        title="Delete scholarship?"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </section>
  );
}

export default ScholarshipsManagement;
