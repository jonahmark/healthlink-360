import { api } from './api';

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  deactivateUser: (userId) => api.patch(`/admin/users/${userId}/deactivate`),
  activateUser: (userId) => api.patch(`/admin/users/${userId}/activate`),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
  getBookings: () => api.get('/admin/bookings'),
  getLabRequests: () => api.get('/admin/lab-requests'),

  // Doctor management
  getDoctors: () => api.get('/admin/doctors'),
  approveDoctor: (doctorId) => api.patch(`/admin/doctors/${doctorId}/approve`),
  rejectDoctor: (doctorId) => api.patch(`/admin/doctors/${doctorId}/reject`),
  deactivateDoctor: (doctorId) => api.patch(`/admin/doctors/${doctorId}/deactivate`),
  activateDoctor: (doctorId) => api.patch(`/admin/doctors/${doctorId}/activate`),

  // Appointment management
  approveBooking: (bookingId) => api.patch(`/admin/bookings/${bookingId}/approve`),
  cancelBooking: (bookingId) => api.patch(`/admin/bookings/${bookingId}/cancel`),
  rescheduleBooking: (bookingId, appointment_date, appointment_time) => api.patch(`/admin/bookings/${bookingId}/reschedule`, { appointment_date, appointment_time }),

  // Lab request management
  approveLabRequest: (id) => api.patch(`/admin/lab-requests/${id}/approve`),
  completeLabRequest: (id) => api.patch(`/admin/lab-requests/${id}/complete`),
  rejectLabRequest: (id) => api.patch(`/admin/lab-requests/${id}/reject`),

  // Notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}; 