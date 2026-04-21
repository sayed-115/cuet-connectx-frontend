import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal';

const emptySchol = { title: '', organization: '', amount: '', eligibility: '', description: '', deadline: '', link: '', scholarshipImage: '' };

function ScholarshipsManagement({ showToast }) {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusCounts, setStatusCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptySchol);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadScholarships = useCallback(async (p = page, s = search, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await adminAPI.getScholarships({ page: p, limit: 10, search: s, status });
      setScholarships(res.data?.scholarships || []);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
      setStatusCounts(res.data?.statusCounts || { pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      showToast(err.message || 'Failed to load scholarships', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => loadScholarships(page, search, statusFilter), 300);
    return () => clearTimeout(t);
  }, [page, search, statusFilter]);

  const openCreate = () => { setEditId(null); setForm(emptySchol); setImageFile(null); setImagePreview(null); setFormOpen(true); };
  const openEdit = (s) => {
    setEditId(s._id);
    setForm({
      title: s.title || '',
      organization: s.organization || '',
      amount: s.amount || '',
      eligibility: s.eligibility || '',
      description: s.description || '',
      deadline: s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : '',
      link: s.link || '',
      scholarshipImage: s.scholarshipImage || ''
    });
    setImageFile(null);
    setImagePreview(s.scholarshipImage || null);
    setFormOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let scholarshipImageUrl = form.scholarshipImage || '';
      if (imageFile) {
        setUploading(true);
        const uploadRes = await adminAPI.uploadScholarshipImage(imageFile);
        scholarshipImageUrl = uploadRes.imageUrl;
        setUploading(false);
      }
      const payload = { ...form, scholarshipImage: scholarshipImageUrl };
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

  const handleModeration = async (scholarship, action) => {
    setActionLoading(true);
    try {
      if (action === 'approve') {
        await adminAPI.approveScholarship(scholarship._id);
        showToast('Scholarship approved');
      } else {
        await adminAPI.rejectScholarship(scholarship._id);
        showToast('Scholarship rejected');
      }

      loadScholarships(page, search, statusFilter);
    } catch (err) {
      showToast(err.message || `Failed to ${action} scholarship`, 'error');
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
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pending: {statusCounts.pending || 0}</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">Approved: {statusCounts.approved || 0}</span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">Rejected: {statusCounts.rejected || 0}</span>
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
            <option value="">All Status</option>
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
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{editId ? 'Edit Scholarship' : 'Create Scholarship'}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input required placeholder="Organization *" value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input placeholder="Deadline" type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            <input placeholder="Application Link" value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="col-span-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:col-span-2" />
          </div>
          <textarea placeholder="Eligibility" value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})} rows={2} className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Scholarship Image</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/30 dark:file:text-blue-400" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={actionLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {uploading ? 'Uploading image...' : actionLoading ? 'Saving...' : editId ? 'Update' : 'Create'}
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
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Deadline</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Post Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
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
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{s.amount || '—'}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{s.deadline ? new Date(s.deadline).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-2.5 text-sm">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {s.role === 'admin' ? 'Admin Post' : 'User Post'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      (s.status || 'approved') === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : (s.status || 'approved') === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>
                      {s.status || 'approved'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{s.postedBy?.fullName || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleModeration(s, 'approve')}
                      disabled={actionLoading || (s.status || 'approved') === 'approved'}
                      className="mr-2 text-sm text-green-600 hover:text-green-800 disabled:opacity-50 dark:text-green-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModeration(s, 'reject')}
                      disabled={actionLoading || (s.status || 'approved') === 'rejected'}
                      className="mr-2 text-sm text-amber-600 hover:text-amber-800 disabled:opacity-50 dark:text-amber-400"
                    >
                      Reject
                    </button>
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
