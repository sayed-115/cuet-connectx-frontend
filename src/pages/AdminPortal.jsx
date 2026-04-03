import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, usersAPI } from '../services/api';
import Pagination from '../components/admin/Pagination';
import ConfirmModal from '../components/admin/ConfirmModal';
import Toast from '../components/admin/Toast';
import UserManagementTable from '../components/admin/UserManagementTable';
import UserDetailModal from '../components/admin/UserDetailModal';
import JobsManagement from '../components/admin/JobsManagement';
import ScholarshipsManagement from '../components/admin/ScholarshipsManagement';
import CommunityModeration from '../components/admin/CommunityModeration';

const initialStats = {
  totalUsers: 0,
  totalAlumni: 0,
  totalStudents: 0,
  totalBannedUsers: 0,
  totalAdmins: 0,
  totalJobs: 0,
  totalScholarships: 0,
  totalPosts: 0,
};

function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── state ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(initialStats);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ── stats cards ──────────────────────────────────────────
  const statsCards = useMemo(
    () => [
      {
        title: 'Total Users',
        value: dashboard.totalUsers,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
      },
      {
        title: 'Alumni',
        value: dashboard.totalAlumni,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        ),
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
      },
      {
        title: 'Students',
        value: dashboard.totalStudents,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ),
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
      },
      {
        title: 'Banned',
        value: dashboard.totalBannedUsers,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
        bg: 'bg-rose-50 dark:bg-rose-900/30',
        text: 'text-rose-700 dark:text-rose-300',
      },
      {
        title: 'Jobs',
        value: dashboard.totalJobs,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
          </svg>
        ),
        bg: 'bg-indigo-50 dark:bg-indigo-900/30',
        text: 'text-indigo-700 dark:text-indigo-300',
      },
      {
        title: 'Scholarships',
        value: dashboard.totalScholarships,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bg: 'bg-teal-50 dark:bg-teal-900/30',
        text: 'text-teal-700 dark:text-teal-300',
      },
      {
        title: 'Posts',
        value: dashboard.totalPosts,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        ),
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
      },
    ],
    [dashboard]
  );

  // ── helpers ──────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
  };

  const adminInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  const formatRoleLabel = (roleValue) =>
    String(roleValue || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  // ── API calls ────────────────────────────────────────────
  const loadDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboard(response.data);
      setRecentRegistrations(response.data.recentRegistrations || []);
    } catch (error) {
      showToast(error.message || 'Failed to load dashboard', 'error');
    }
  };

  const loadUsers = async (nextPage = page, nextSearch = search, nextRole = role) => {
    setTableLoading(true);
    try {
      const response = await adminAPI.getUsers({
        page: nextPage,
        limit: 10,
        search: nextSearch,
        role: nextRole,
      });
      const nextUsers = response.data.users || [];
      setUsers(nextUsers);

      const nextRoleOptions = Array.from(
        new Set(
          nextUsers
            .map((entry) => String(entry.role || entry.userType || '').toLowerCase().trim())
            .filter(Boolean)
        )
      ).sort();

      setRoleOptions((prev) => Array.from(new Set([...prev, ...nextRoleOptions])).sort());
      setPagination(response.data.pagination || { page: 1, pages: 1, total: 0, limit: 10 });
    } catch (error) {
      showToast(error.message || 'Failed to load users', 'error');
    } finally {
      setTableLoading(false);
    }
  };

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await usersAPI.getProfile();
      if (response.success) {
        setProfileData(response.user);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── lifecycle ────────────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      try {
        await Promise.all([loadDashboard(), loadUsers(1, '', '')]);
      } catch (error) {
        showToast(error.message || 'Failed to load admin data', 'error');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(page, search, role), 300);
    return () => clearTimeout(timer);
  }, [page, search, role]);

  useEffect(() => {
    if (activeTab === 'profile' && !profileData) {
      loadProfile();
    }
  }, [activeTab]);

  // ── action handlers ──────────────────────────────────────
  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    setActionLoading(true);
    try {
      const response = await adminAPI.updateRole(targetUser._id, newRole);
      showToast(response.message || 'Role updated');
      await Promise.all([loadDashboard(), loadUsers(page, search, role)]);
    } catch (error) {
      showToast(error.message || 'Role update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (targetUser) => {
    const nextStatus = targetUser.status === 'banned' ? 'active' : 'banned';
    setActionLoading(true);
    try {
      const response = await adminAPI.updateStatus(targetUser._id, nextStatus);
      showToast(response.message || 'Status updated');
      await Promise.all([loadDashboard(), loadUsers(page, search, role)]);
    } catch (error) {
      showToast(error.message || 'Status update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = async (targetUser) => {
    try {
      const response = await adminAPI.getUserById(targetUser._id);
      setViewTarget(response.data?.user || targetUser);
    } catch (error) {
      showToast(error.message || 'Failed to load user details', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const response = await adminAPI.deleteUser(deleteTarget._id);
      showToast(response.message || 'User deleted');
      setDeleteTarget(null);
      await Promise.all([loadDashboard(), loadUsers(page, search, role)]);
    } catch (error) {
      showToast(error.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (targetUser) => {
    setActionLoading(true);
    try {
      const response = await adminAPI.approveAlumni(targetUser._id);
      showToast(response.message || 'Alumni approved');
      await loadUsers(page, search, role);
    } catch (error) {
      showToast(error.message || 'Approval failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── sidebar nav items ────────────────────────────────────
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'community',
      label: 'Community',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  // Tab labels for topbar breadcrumb
  const tabLabels = { dashboard: 'Dashboard', users: 'Users', jobs: 'Jobs', scholarships: 'Scholarships', community: 'Community', profile: 'Profile' };

  // ── loading screen ───────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  // ── render ───────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* ── Fixed Sidebar ──────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform dark:border-gray-700 dark:bg-gray-800 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5 dark:border-gray-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-bold text-white">
            CX
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-gray-900 dark:text-white">CUET ConnectX</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Menu</p>
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-3 dark:border-gray-700">
          <Link
            to="/"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to Website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Area (offset by sidebar) ──────────────── */}
      <div className="flex flex-1 flex-col md:ml-64">

        {/* ── Topbar ──────────────────────────────────── */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 dark:border-gray-700 dark:bg-gray-800">
          {/* Left: mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{tabLabels[activeTab]}</h2>
              <p className="hidden text-xs text-gray-500 sm:block dark:text-gray-400">CUET ConnectX Administration</p>
            </div>
          </div>

          {/* Right: admin profile + logout */}
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 sm:flex dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              View Site
            </Link>
            <button
              type="button"
              onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-teal-500/30" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 ring-2 ring-teal-500/30 dark:bg-teal-900 dark:text-teal-300">
                  {adminInitials}
                </div>
              )}
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName || 'Admin'}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">{user?.email || 'admin'}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* ── Dashboard Tab ───────────────────────── */}
            {activeTab === 'dashboard' && (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statsCards.map((card) => (
                    <div key={card.title} className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                        </div>
                        <div className={`rounded-lg p-2.5 ${card.bg} ${card.text}`}>{card.icon}</div>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Registrations</h2>
                  {recentRegistrations.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent registrations</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Role</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {recentRegistrations.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-2.5 text-sm">
                                <div className="flex items-center gap-2">
                                  {u.profileImage ? (
                                    <img src={u.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" />
                                  ) : (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-600 dark:bg-teal-900 dark:text-teal-300">
                                      {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-900 dark:text-white">{u.fullName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                              <td className="px-4 py-2.5 text-sm">
                                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                                {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ── Users Tab ───────────────────────────── */}
            {activeTab === 'users' && (
              <section className="rounded-xl bg-white p-4 shadow-sm md:p-5 dark:bg-gray-800">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pagination.total} users total</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      placeholder="Search name, email, ID..."
                      value={search}
                      onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                    <select
                      value={role}
                      onChange={(e) => { setPage(1); setRole(e.target.value); }}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Roles</option>
                      {roleOptions.map((roleOption) => (
                        <option key={roleOption} value={roleOption}>{formatRoleLabel(roleOption)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <UserManagementTable
                  users={users}
                  onView={handleView}
                  onRoleChange={handleRoleChange}
                  onStatusToggle={handleStatusToggle}
                  onApprove={handleApprove}
                  onDeleteClick={setDeleteTarget}
                  actingUserId={user?.id || user?._id}
                  loading={tableLoading || actionLoading}
                />

                <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
              </section>
            )}

            {/* ── Jobs Tab ────────────────────────────── */}
            {activeTab === 'jobs' && <JobsManagement showToast={showToast} />}

            {/* ── Scholarships Tab ────────────────────── */}
            {activeTab === 'scholarships' && <ScholarshipsManagement showToast={showToast} />}

            {/* ── Community Tab ───────────────────────── */}
            {activeTab === 'community' && <CommunityModeration showToast={showToast} />}

            {/* ── Profile Tab ────────────────────────── */}
            {activeTab === 'profile' && (
              <section className="space-y-6">
                {profileLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                  </div>
                ) : (
                  <>
                    {/* Profile Header Card */}
                    <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
                      <div className="h-32 rounded-t-xl bg-linear-to-r from-teal-500 to-teal-700"></div>
                      <div className="relative px-6 pb-6">
                        <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                          {(profileData?.profileImage || user?.profileImage) ? (
                            <img
                              src={profileData?.profileImage || user?.profileImage}
                              alt=""
                              className="h-24 w-24 rounded-xl border-4 border-white object-cover shadow-lg dark:border-gray-800"
                            />
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-4 border-white bg-teal-100 text-2xl font-bold text-teal-700 shadow-lg dark:border-gray-800 dark:bg-teal-900 dark:text-teal-300">
                              {adminInitials}
                            </div>
                          )}
                          <div className="flex-1 pt-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                              {profileData?.fullName || user?.fullName || 'Admin'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {profileData?.email || user?.email} &middot; {profileData?.role || user?.role || 'admin'}
                            </p>
                          </div>
                          <Link
                            to="/profile"
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                          >
                            Edit Full Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Profile Details Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Account Info</h3>
                        <dl className="space-y-3">
                          {[
                            ['Name', profileData?.fullName || user?.fullName],
                            ['Email', profileData?.email || user?.email],
                            ['Student ID', profileData?.studentId || user?.studentId],
                            ['Role', profileData?.role || user?.role],
                            ['Department', profileData?.department || user?.department],
                            ['Batch', profileData?.batch || user?.batch],
                            ['Status', profileData?.status || user?.status || 'active'],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between">
                              <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                              <dd className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Details</h3>
                        <dl className="space-y-3">
                          {[
                            ['About', profileData?.about],
                            ['Profession', profileData?.currentProfession],
                            ['Phone', profileData?.phone],
                            ['Address', profileData?.address],
                            ['Joined', profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-start justify-between gap-4">
                              <dt className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                              <dd className="text-right text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</dd>
                            </div>
                          ))}
                        </dl>
                        {(profileData?.skills?.length > 0) && (
                          <div className="mt-4">
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {profileData.skills.map(s => (
                                <span key={s} className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

          </div>
        </main>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete user?"
        message={`Are you sure you want to permanently delete ${deleteTarget?.fullName || 'this user'}? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
      <UserDetailModal
        open={Boolean(viewTarget)}
        user={viewTarget}
        onClose={() => setViewTarget(null)}
      />
      <Toast toast={toast} />
    </div>
  );
}

export default AdminPortal;
