// API Service for CUET-ConnectX
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // Handle empty responses
  let data = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    // Handle 401 Unauthorized - auto logout
    if (response.status === 401) {
      const isExpired = data.expired === true;
      if (isExpired || data.message?.includes('expired')) {
        handleLogout();
      }
      throw new ApiError(data.message || 'Session expired. Please login again.', 401, isExpired);
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new ApiError(data.message || 'You are not authorized to perform this action.', 403);
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
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users${queryString ? '?' + queryString : ''}`);
  },
  getById: (id) => apiCall(`/users/${id}`),
  update: (id, data) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  follow: (id) => apiCall(`/users/${id}/follow`, {
    method: 'POST',
  }),
  unfollow: (id) => apiCall(`/users/${id}/unfollow`, {
    method: 'POST',
  }),
};

// Jobs API
export const jobsAPI = {
  getAll: () => apiCall('/jobs'),
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
};

// Scholarships API
export const scholarshipsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
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

export default { authAPI, usersAPI, jobsAPI, scholarshipsAPI, postsAPI };

