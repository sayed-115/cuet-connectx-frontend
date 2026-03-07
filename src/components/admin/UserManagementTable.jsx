function UserManagementTable({
  users,
  onView,
  onRoleChange,
  onStatusToggle,
  onApprove,
  onDeleteClick,
  actingUserId,
  loading
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No users found
      </div>
    );
  }

  const roleBadge = (r) => {
    const map = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      alumni: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      student: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return map[r] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Role</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
          {users.map((user) => {
            const isSelf = actingUserId === user._id || actingUserId === user.id;
            return (
              <tr key={user._id || user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.studentId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{user.email}</td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user, e.target.value)}
                    disabled={isSelf}
                    className={`rounded-lg border px-2 py-1 text-xs font-medium disabled:opacity-60 ${roleBadge(user.role)} border-transparent`}
                  >
                    <option value="student">student</option>
                    <option value="alumni">alumni</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.status === 'banned'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onView(user)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => onStatusToggle(user)}
                      className="rounded-lg border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-60 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
                    >
                      {user.status === 'banned' ? 'Unban' : 'Ban'}
                    </button>
                    {((user.role === 'alumni' || user.userType === 'alumni') && !user.isVerified) && (
                      <button
                        type="button"
                        onClick={() => onApprove(user)}
                        className="rounded-lg border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => onDeleteClick(user)}
                      className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagementTable;
