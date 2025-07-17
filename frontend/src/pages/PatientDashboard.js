import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import Loading from '../components/ui/Loading';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedAppointments: 0,
    labResults: 0,
    healthScore: 85
  });
  const [appointments, setAppointments] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  // Health tips feature
  const healthTips = [
    'Drink at least 8 glasses of water daily.',
    'Take a 10-minute walk after meals.',
    'Eat at least 5 servings of fruits and vegetables.',
    'Practice deep breathing for 5 minutes.',
    'Get 7-8 hours of sleep every night.',
    'Wash your hands regularly to prevent infections.',
    'Take your prescribed medication on time.',
    'Limit sugary drinks and snacks.',
    'Schedule regular checkups with your doctor.',
    'Protect your mental health: take breaks and relax.'
  ];
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch patient dashboard data from the new patient-specific endpoint
      const response = await api.get('/patients/stats');
      const { stats: dashboardStats, appointments, labRequests, notifications } = response.data;
      
      setStats(dashboardStats);
      setAppointments(appointments);
      setLabRequests(labRequests);
      setNotifications(notifications);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'book-appointment':
        navigate('/book-appointment');
        break;
      case 'lab-tests':
        navigate('/lab-tests');
        break;
      case 'view-records':
        setActiveTab('records');
        break;
      case 'chat-support':
        // This could open a chat modal or navigate to chat page
        alert('Chat support feature coming soon!');
        break;
      default:
        break;
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/patients/appointments/${appointmentId}/cancel`);
        alert('Appointment cancelled successfully');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  const handleRescheduleAppointment = (appointmentId) => {
    // This could open a modal for rescheduling
    alert('Reschedule feature coming soon!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="large" color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'appointments', name: 'Appointments' },
              { id: 'lab-results', name: 'Lab Results' },
              { id: 'records', name: 'Health Records' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
                  </div>
                </div>
            </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Lab Results</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.labResults}</p>
                  </div>
                </div>
            </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Health Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.healthScore}</p>
                  </div>
                </div>
            </div>
          </div>
            {/* Health Tips Card */}
            <div className="mb-8 flex justify-center">
              <div className="bg-gradient-to-tr from-green-100 via-blue-50 to-white dark:from-cyan-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-green-100 dark:border-cyan-700 p-6 flex flex-col items-center max-w-xl w-full">
                <div className="text-green-600 dark:text-green-300 text-2xl mb-2">💡</div>
                <div className="text-gray-800 dark:text-cyan-200 text-center font-medium text-lg">{healthTips[tipIndex]}</div>
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-2">Health Tip</div>
              </div>
            </div>

          {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => handleQuickAction('book-appointment')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
                >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium">Book Appointment</div>
              </button>
              
                <button 
                  onClick={() => handleQuickAction('lab-tests')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
                >
                <div className="text-2xl mb-2">🔬</div>
                <div className="font-medium">Request Lab Test</div>
              </button>
              
                <button 
                  onClick={() => handleQuickAction('view-records')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
                >
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium">View Records</div>
              </button>
              
                <button 
                  onClick={() => handleQuickAction('chat-support')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
                >
                <div className="text-2xl mb-2">💬</div>
                <div className="font-medium">Chat Support</div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm">📢</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
                    </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
                <button
                  onClick={() => handleQuickAction('book-appointment')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Book New Appointment
                </button>
                    </div>
                  </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.doctor_name}</div>
                          <div className="text-sm text-gray-500">{appointment.doctor_specialty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {appointment.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {appointment.status === 'confirmed' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRescheduleAppointment(appointment.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Reschedule
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No appointments found. Book your first appointment!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
                  </div>
                </div>
        )}

        {/* Lab Results Tab */}
        {activeTab === 'lab-results' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Lab Results</h2>
                <button
                  onClick={() => handleQuickAction('lab-tests')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Request New Test
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {labRequests.length > 0 ? (
                    labRequests.map((labRequest) => (
                      <tr key={labRequest.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {labRequest.test_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(labRequest.request_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            labRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                            labRequest.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            labRequest.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {labRequest.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          UGX {parseFloat(labRequest.test_price).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No lab requests found. Request your first lab test!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
                      </div>
                    </div>
        )}

        {/* Health Records Tab */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{user?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
              {/* Health Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Health Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health Score:</span>
                    <span className="font-medium text-green-600">{stats.healthScore}/100</span>
                      </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Appointments:</span>
                    <span className="font-medium">{appointments.length}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lab Tests:</span>
                    <span className="font-medium">{labRequests.length}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status:</span>
                    <span className="font-medium capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard; 