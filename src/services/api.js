// API Service for CUET-ConnectX
const RENDER_API_URL = 'https://cuet-connectx-backend.onrender.com/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const fallbackApiUrls = import.meta.env.DEV
  ? [LOCAL_API_URL]
  : [RENDER_API_URL];

const apiUrls = Array.from(new Set([
  configuredApiUrl,
  ...fallbackApiUrls,
].filter(Boolean)));

if (apiUrls.length === 0) {
  apiUrls.push(LOCAL_API_URL);
}

let activeApiUrl = apiUrls[0];

function getApiUrlsInPriorityOrder() {
  return [activeApiUrl, ...apiUrls.filter((url) => url !== activeApiUrl)];
}

async function fetchWithApiFallback(endpoint, config) {
  let lastError = null;
  const orderedApiUrls = getApiUrlsInPriorityOrder();

  for (const baseUrl of orderedApiUrls) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, config);

      if (baseUrl !== activeApiUrl) {
        console.warn(`[API] Switched API base URL to: ${baseUrl}`);
        activeApiUrl = baseUrl;
      }

      return response;
    } catch (err) {
      lastError = err;
      if (import.meta.env.DEV) {
        console.warn(`[API] Network error on ${baseUrl}${endpoint}. Trying next candidate.`);
      }
    }
  }

  throw lastError || new Error('All API endpoints are unreachable.');
}

function normalizeFilterValue(value) {
  if (typeof value === 'string') return value.toLowerCase().trim();
  if (typeof value === 'number') return String(value);
  return value;
}

function cleanQueryParams(params = {}) {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const normalized = normalizeFilterValue(value);
    if (normalized === '') return;
    cleaned[key] = normalized;
  });
  return cleaned;
}

if (!configuredApiUrl) {
  console.warn(`[API] VITE_API_URL is not set. Using fallback API URLs: ${apiUrls.join(', ')}`);
}

if (import.meta.env.PROD && apiUrls.some((url) => /localhost/i.test(url))) {
  console.error('[API] Production build is pointing to localhost. Set VITE_API_URL to your deployed backend URL.');
}

if (import.meta.env.DEV) {
  console.debug(`[API] Candidate API URLs: ${apiUrls.join(', ')}`);
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, status, expired = false) {
    super(message);
    this.status = status;
    this.expired = expired;
    this.name = 'ApiError';
  }
}

// Logout handler - clears auth state
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  // Dispatch custom event for auth context to listen to
  window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'session_expired' } }));
};

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const method = options.method || 'GET';
  if (import.meta.env.DEV) {
    console.debug(`[API] ${method} ${endpoint}`);
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetchWithApiFallback(endpoint, config);
  } catch (err) {
    throw new ApiError(
      'Unable to connect to the server. Please check your internet connection and try again.',
      0
    );
  }
  
  // Handle empty responses
  let data = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (import.meta.env.DEV) {
    console.debug('[API] Response', {
      method,
      endpoint,
      apiBaseUrl: activeApiUrl,
      status: response.status,
      ok: response.ok,
    });
  }

  if (!response.ok) {
    // Handle 401 Unauthorized - auto logout
    if (response.status === 401) {
      const isExpired = data.expired === true;
      if (isExpired || data.message?.includes('expired') || data.message?.includes('Password recently changed')) {
        handleLogout();
      }
      throw new ApiError(data.message || 'Session expired. Please login again.', 401, isExpired);
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      const err = new ApiError(data.message || 'You are not authorized to perform this action.', 403);
      if (data.needsVerification) err.needsVerification = true;
      if (data.email) err.email = data.email;
      throw err;
    }
    
    throw new ApiError(data.message || 'Something went wrong', response.status);
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getMe: () => apiCall('/auth/me'),

  verifyEmail: (token) => apiCall(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email) => apiCall('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  forgotPassword: (data) => apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  resetPassword: (token, newPassword) => apiCall('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => {
    const cleaned = cleanQueryParams(params);
    if (import.meta.env.DEV) {
      console.debug('[usersAPI] params', cleaned);
    }
    const queryString = new URLSearchParams(cleaned).toString();
    return apiCall(`/users${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiCall(`/users/${id}`),
  changePassword: (currentPassword, newPassword) => apiCall('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
  getProfile: () => apiCall('/users/profile'),
  updateProfile: (data) => apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  uploadImage: async (formData) => {
    const token = localStorage.getItem('token');
    let response;
    try {
      response = await fetchWithApiFallback('/users/profile/image', {
        method: 'PUT',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
    } catch (err) {
      throw new ApiError('Unable to connect to the server. Please try again.', 0);
    }
    const data = await response.json();
    if (!response.ok) throw new ApiError(data.message || 'Upload failed', response.status);
    return data;
  },
  update: (id, data) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  follow: (id) => apiCall(`/users/${id}/follow`, {
    method: 'POST',
  }),
  unfollow: (id) => apiCall(`/users/${id}/follow`, {
    method: 'DELETE',
  }),
};

// Jobs API
export const jobsAPI = {
  getAll: (params = {}) => {
    const cleaned = cleanQueryParams(params);
    if (import.meta.env.DEV) {
      console.debug('[jobsAPI] params', cleaned);
    }
    const queryString = new URLSearchParams(cleaned).toString();
    return apiCall(`/jobs${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiCall(`/jobs/${id}`),
  create: (data) => apiCall('/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/jobs/${id}`, {
    method: 'DELETE',
  }),
  approve: (id) => apiCall(`/jobs/${id}/approve`, {
    method: 'PUT',
  }),
  reject: (id) => apiCall(`/jobs/${id}/reject`, {
    method: 'PUT',
  }),
};

// Scholarships API
export const scholarshipsAPI = {
  getAll: (params = {}) => {
    const cleaned = cleanQueryParams(params);
    if (import.meta.env.DEV) {
      console.debug('[scholarshipsAPI] params', cleaned);
    }
    const queryString = new URLSearchParams(cleaned).toString();
    return apiCall(`/scholarships${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiCall(`/scholarships/${id}`),
  create: (data) => apiCall('/scholarships', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/scholarships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/scholarships/${id}`, {
    method: 'DELETE',
  }),
  approve: (id) => apiCall(`/scholarships/${id}/approve`, {
    method: 'PUT',
  }),
  reject: (id) => apiCall(`/scholarships/${id}/reject`, {
    method: 'PUT',
  }),
};

// Posts API
export const postsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/posts${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiCall(`/posts/${id}`),
  create: (data) => apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  uploadImage: (file) => uploadFile('/posts/upload-image', file),
  like: (id) => apiCall(`/posts/${id}/like`, {
    method: 'POST',
  }),
  comment: (id, text) => apiCall(`/posts/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  deleteComment: (postId, commentId) => apiCall(`/posts/${postId}/comment/${commentId}`, {
    method: 'DELETE',
  }),
  delete: (id) => apiCall(`/posts/${id}`, {
    method: 'DELETE',
  }),
};

// Helper: upload a file via FormData to an endpoint (no JSON content-type)
async function uploadFile(endpoint, file, fieldName = 'image') {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append(fieldName, file);
  let response;
  try {
    response = await fetchWithApiFallback(endpoint, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    });
  } catch (err) {
    throw new ApiError('Unable to connect to the server. Please try again.', 0);
  }
  const data = await response.json();
  if (!response.ok) throw new ApiError(data.message || 'Upload failed', response.status);
  return data;
}

// Admin API
export const adminAPI = {
  getDashboard: () => apiCall('/admin/dashboard'),
  getStats: () => apiCall('/admin/stats'),
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/users${queryString ? '?' + queryString : ''}`);
  },
  getUserById: (id) => apiCall(`/admin/users/${id}`),
  updateRole: (id, role) => apiCall(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  updateStatus: (id, status) => apiCall(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  deleteUser: (id) => apiCall(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
  approveAlumni: (id) => apiCall(`/admin/users/${id}/approve`, {
    method: 'PUT',
  }),
  // Image uploads (Cloudinary)
  uploadJobImage: (file) => uploadFile('/admin/upload/job-image', file),
  uploadScholarshipImage: (file) => uploadFile('/admin/upload/scholarship-image', file),
  uploadPostImage: (file) => uploadFile('/admin/upload/post-image', file),
  // Jobs
  getJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/jobs${queryString ? '?' + queryString : ''}`);
  },
  createJob: (data) => apiCall('/admin/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateJob: (id, data) => apiCall(`/admin/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteJob: (id) => apiCall(`/admin/jobs/${id}`, {
    method: 'DELETE',
  }),
  approveJob: (id) => apiCall(`/admin/jobs/${id}/approve`, {
    method: 'PUT',
  }),
  rejectJob: (id) => apiCall(`/admin/jobs/${id}/reject`, {
    method: 'PUT',
  }),
  // Scholarships
  getScholarships: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/scholarships${queryString ? '?' + queryString : ''}`);
  },
  createScholarship: (data) => apiCall('/admin/scholarships', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateScholarship: (id, data) => apiCall(`/admin/scholarships/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteScholarship: (id) => apiCall(`/admin/scholarships/${id}`, {
    method: 'DELETE',
  }),
  approveScholarship: (id) => apiCall(`/admin/scholarships/${id}/approve`, {
    method: 'PUT',
  }),
  rejectScholarship: (id) => apiCall(`/admin/scholarships/${id}/reject`, {
    method: 'PUT',
  }),
  // Community
  getPosts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/community${queryString ? '?' + queryString : ''}`);
  },
  deletePost: (id) => apiCall(`/admin/community/${id}`, {
    method: 'DELETE',
  }),
};

export default { authAPI, usersAPI, jobsAPI, scholarshipsAPI, postsAPI, adminAPI };

