import { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal';

function CommunityModeration({ showToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadPosts = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const res = await adminAPI.getPosts({ page: p, limit: 10 });
      setPosts(res.data?.posts || []);
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      showToast(err.message || 'Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, showToast]);

  useEffect(() => { loadPosts(page); }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminAPI.deletePost(deleteTarget._id);
      showToast('Post deleted');
      setDeleteTarget(null);
      loadPosts(page);
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow-lg md:p-5 dark:bg-gray-800">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Community Moderation</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{pagination.total} posts total</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No posts found</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {post.author?.profileImage ? (
                    <img src={post.author.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      {post.author?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author?.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.author?.departmentShort} &middot; Batch {post.author?.batch} &middot; {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(post)}
                  className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  Delete
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{post.content}</p>
              {post.image && <img src={post.image} alt="" className="mt-2 max-h-40 rounded-lg object-cover" />}
              <div className="mt-2 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{post.likes?.length || 0} likes</span>
                <span>{post.comments?.length || 0} comments</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete post?"
        message="Delete this post permanently? This cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </section>
  );
}

export default CommunityModeration;
