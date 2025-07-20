import axios from 'axios';

// Force API base URL to localhost backend
const API_BASE_URL = 'http://localhost:5000/api';
console.log('[API CONFIG] Using API base URL:', API_BASE_URL);
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: Log all API requests
api.interceptors.request.use(
  (config) => {
    console.log('[API REQUEST]', config.method?.toUpperCase(), config.baseURL + config.url, config.data || '');
    return config;
  },
  (error) => Promise.reject(error)
);

// Debug: Show a clear error if the backend is unreachable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      alert('Cannot reach backend at ' + API_BASE_URL + '. Please check your backend server and network settings.');
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Doctor API calls
export const doctorAPI = {
  getProfile: () => api.get('/doctors/profile'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
};

// Booking API calls
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getUserBookings: () => api.get('/bookings'),
  getDoctorBookings: () => api.get('/doctors/bookings'),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
};

// Lab API calls
export const labAPI = {
  createLabRequest: (requestData) => api.post('/lab/requests', requestData),
  getUserLabRequests: () => api.get('/lab/requests'),
  getLabRequestById: (id) => api.get(`/lab/requests/${id}`),
  updateLabRequest: (id, data) => api.put(`/lab/requests/${id}`, data),
  getAvailableLabTests: () => api.get('/lab/tests'),
  createBatchLabRequests: (data) => api.post('/lab/requests/batch', JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }),
};

// Notification API calls
export const notificationAPI = {
  getUserNotifications: (page = 1, limit = 10, unread_only = false) => 
    api.get('/notifications', { params: { page, limit, unread_only } }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  getNotificationCount: () => api.get('/notifications/count'),
  getNotificationSettings: () => api.get('/notifications/settings'),
  updateNotificationSettings: (settings) => api.put('/notifications/settings', settings),
};

export { api }; 