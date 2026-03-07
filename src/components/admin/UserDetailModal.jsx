function UserDetailModal({ open, user, onClose }) {
  if (!open || !user) return null;

  const rows = [
    ['Full Name', user.fullName],
    ['Email', user.email],
    ['Student ID', user.studentId],
    ['Batch', user.batch],
    ['Department', user.department || user.departmentShort],
    ['Roll', user.roll],
    ['User Type', user.userType],
    ['Role', user.role],
    ['Status', user.status],
    ['Verified', user.isVerified ? 'Yes' : 'No'],
    ['Joined', user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-start gap-4">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{user.fullName}</h3>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Details Table */}
        <div className="mt-5 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center px-4 py-2.5 text-sm">
              <span className="w-32 shrink-0 font-medium text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-gray-900 dark:text-gray-100">{value || '—'}</span>
            </div>
          ))}
        </div>

        {/* Social Links */}
        {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Social Links</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(user.socialLinks).map(([key, url]) =>
                url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:border-gray-600 dark:text-blue-400 dark:hover:bg-gray-700"
                  >
                    {key}
                  </a>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;
