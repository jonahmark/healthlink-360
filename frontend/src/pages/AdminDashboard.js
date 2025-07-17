import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaUserMd, FaCalendarAlt, FaFlask, FaBell, FaChartBar, FaCog, FaTachometerAlt, FaSearch, FaUserSlash } from 'react-icons/fa';
import { adminAPI } from '../utils/adminApi';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import toast, { Toaster } from 'react-hot-toast';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const sidebarLinks = [
  { name: 'Dashboard', icon: <FaTachometerAlt /> },
  { name: 'Users', icon: <FaUser /> },
  { name: 'Doctors', icon: <FaUserMd /> },
  { name: 'Appointments', icon: <FaCalendarAlt /> },
  { name: 'Lab Tests', icon: <FaFlask /> },
  { name: 'Notifications', icon: <FaBell /> },
  { name: 'Reports', icon: <FaChartBar /> },
  { name: 'Settings', icon: <FaCog /> },
];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deactivating, setDeactivating] = useState(null);
  const [stats, setStats] = useState([
    { label: 'Total Users', value: 0, icon: <FaUser className="text-blue-500" /> },
    { label: 'Doctors', value: 0, icon: <FaUserMd className="text-green-500" /> },
    { label: 'Appointments', value: 0, icon: <FaCalendarAlt className="text-purple-500" /> },
    { label: 'Lab Tests', value: 0, icon: <FaFlask className="text-yellow-500" /> },
  ]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState('');
  const [doctorAction, setDoctorAction] = useState(null); // id of doctor being acted on
  const [bookings, setBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingAction, setBookingAction] = useState(null); // id+action
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const rescheduleDateRef = useRef();
  const rescheduleTimeRef = useRef();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [labRequests, setLabRequests] = useState([]);
  const [labSearch, setLabSearch] = useState('');
  const [labLoading, setLabLoading] = useState(false);
  const [labError, setLabError] = useState('');
  const [labAction, setLabAction] = useState(null); // id+action
  const [selectedLab, setSelectedLab] = useState(null);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [growthData, setGrowthData] = useState({ labels: [], users: [], doctors: [], appointments: [] });
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    if (activeSection === 'Users') fetchUsers();
    if (activeSection === 'Doctors') fetchDoctors();
    if (activeSection === 'Appointments') fetchBookings();
    if (activeSection === 'Lab Tests') fetchLabRequests();
    if (activeSection === 'Notifications') fetchNotifications();
    // eslint-disable-next-line
  }, [activeSection]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminAPI.getStats();
      const { stats: backendStats, roleDistribution: roles, growth } = res.data;
      
      setStats([
        { label: 'Total Users', value: backendStats.totalUsers, icon: <FaUser className="text-blue-500" /> },
        { label: 'Doctors', value: backendStats.totalDoctors, icon: <FaUserMd className="text-green-500" /> },
        { label: 'Appointments', value: backendStats.totalBookings, icon: <FaCalendarAlt className="text-purple-500" /> },
        { label: 'Lab Tests', value: backendStats.totalLabRequests, icon: <FaFlask className="text-yellow-500" /> },
      ]);
      setRoleDistribution(roles || []);
      setGrowthData(growth || { labels: [], users: [], doctors: [], appointments: [] });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    setDoctorLoading(true);
    setDoctorError('');
    try {
      const res = await adminAPI.getDoctors();
      setDoctors(res.data.doctors || []);
    } catch (err) {
      setDoctorError('Failed to fetch doctors.');
    } finally {
      setDoctorLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await adminAPI.getBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      setBookingError('Failed to fetch appointments.');
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchLabRequests = async () => {
    setLabLoading(true);
    setLabError('');
    try {
      const res = await adminAPI.getLabRequests();
      setLabRequests(res.data.labRequests || []);
    } catch (err) {
      setLabError('Failed to fetch lab requests.');
    } finally {
      setLabLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const res = await adminAPI.getNotifications({ page: 1, limit: 20 });
      setNotifications(res.data.notifications || []);
    } catch (err) {
      setNotificationsError('Failed to fetch notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    setDeactivating(userId);
    try {
      await adminAPI.deactivateUser(userId);
      setUsers(users => users.map(u => u.id === userId ? { ...u, status: 'inactive' } : u));
      toast.success('User deactivated successfully!');
    } catch (err) {
      toast.error('Failed to deactivate user.');
    } finally {
      setDeactivating(null);
    }
  };

  const handleDoctorAction = async (id, action) => {
    setDoctorAction(id + action);
    try {
      if (action === 'approve') await adminAPI.approveDoctor(id);
      if (action === 'reject') await adminAPI.rejectDoctor(id);
      if (action === 'deactivate') await adminAPI.deactivateDoctor(id);
      if (action === 'activate') await adminAPI.activateDoctor(id);
      setDoctors(doctors => doctors.map(d => d.id === id ? { ...d, status: action === 'approve' || action === 'activate' ? 'approved' : action === 'reject' ? 'rejected' : 'inactive' } : d));
      toast.success('Doctor action updated successfully!');
    } catch (err) {
      toast.error('Failed to update doctor.');
    } finally {
      setDoctorAction(null);
    }
  };

  const handleBookingAction = async (id, action) => {
    setBookingAction(id + action);
    try {
      if (action === 'approve') await adminAPI.approveBooking(id);
      if (action === 'cancel') await adminAPI.cancelBooking(id);
      setBookings(bookings => bookings.map(b => b.id === id ? { ...b, status: action === 'approve' ? 'confirmed' : 'cancelled' } : b));
      toast.success('Appointment action updated successfully!');
    } catch (err) {
      toast.error('Failed to update appointment.');
    } finally {
      setBookingAction(null);
    }
  };

  const handleReschedule = (booking) => {
    setRescheduleBooking(booking);
    setShowReschedule(true);
  };

  const submitReschedule = async () => {
    const id = rescheduleBooking.id;
    const appointment_date = rescheduleDateRef.current?.value || '';
    const appointment_time = rescheduleTimeRef.current?.value || '';
    setBookingAction(id + 'reschedule');
    try {
      await adminAPI.rescheduleBooking(id, appointment_date, appointment_time);
      setBookings(bookings => bookings.map(b => b.id === id ? { ...b, appointment_date, appointment_time, status: 'rescheduled' } : b));
      setShowReschedule(false);
      setRescheduleBooking(null);
      toast.success('Appointment rescheduled successfully!');
    } catch (err) {
      toast.error('Failed to reschedule appointment.');
    } finally {
      setBookingAction(null);
    }
  };

  const handleLabAction = async (id, action) => {
    setLabAction(id + action);
    try {
      if (action === 'approve') await adminAPI.approveLabRequest(id);
      if (action === 'complete') await adminAPI.completeLabRequest(id);
      if (action === 'reject') await adminAPI.rejectLabRequest(id);
      setLabRequests(labRequests => labRequests.map(l => l.id === id ? { ...l, status: action === 'approve' ? 'approved' : action === 'complete' ? 'completed' : 'rejected' } : l));
      toast.success('Lab request action updated successfully!');
    } catch (err) {
      toast.error('Failed to update lab request.');
    } finally {
      setLabAction(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.email.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.status.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.patient_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.doctor_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.status.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const filteredLabRequests = labRequests.filter(l =>
    l.patient_name.toLowerCase().includes(labSearch.toLowerCase()) ||
    l.test_name.toLowerCase().includes(labSearch.toLowerCase()) ||
    l.status.toLowerCase().includes(labSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold text-blue-700 border-b border-gray-200 dark:border-gray-800">HealthLink 360</div>
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map(link => (
            <button
              key={link.name}
              className={`flex items-center w-full px-4 py-2 rounded-lg text-gray-700 dark:text-cyan-200 hover:bg-blue-100 dark:hover:bg-cyan-800 transition ${activeSection === link.name ? 'bg-blue-50 dark:bg-cyan-900 font-semibold' : ''}`}
              onClick={() => setActiveSection(link.name)}
            >
              <span className="mr-3 text-lg">{link.icon}</span> {link.name}
              </button>
            ))}
          </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center">
              <div className="text-3xl mr-4">{stat.icon}</div>
          <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stat.value.toLocaleString()}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
                  </div>
                ))}
        </div>

        {/* Section Content */}
        {activeSection === 'Dashboard' && (
                  <div>
            <h2 className="text-xl font-bold mb-4">Quick Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-semibold mb-2">User/Doctor/Appointments Growth</h3>
                {statsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <Line
                    data={{
                      labels: growthData.labels || [],
                      datasets: [
                        { label: 'Users', data: growthData.users || [], borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', tension: 0.4 },
                        { label: 'Doctors', data: growthData.doctors || [], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.4 },
                        { label: 'Appointments', data: growthData.appointments || [], borderColor: '#a21caf', backgroundColor: 'rgba(162,28,175,0.1)', tension: 0.4 },
                      ]
                    }}
                    options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: false } } }}
                    height={200}
                  />
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="font-semibold mb-2">Role Distribution</h3>
                {statsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                  </div>
                ) : (
                  <Pie
                    data={{
                      labels: roleDistribution.map(r => r.role),
                      datasets: [
                        {
                          data: roleDistribution.map(r => r.count),
                          backgroundColor: ['#2563eb', '#22c55e', '#a21caf', '#f59e42'],
                        }
                      ]
                    }}
                    options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                    height={200}
                  />
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">Recent Users</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(users || []).slice(0, 5).map((user, index) => (
                      <tr key={user.id || user._id || String(index)}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{user.status || 'N/A'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeSection === 'Users' && (
          <div>
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loading && <span className="text-blue-500 ml-4">Loading...</span>}
              {error && <span className="text-red-500 ml-4">{error}</span>}
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                    {(filteredUsers || []).map(user => (
                      <tr key={user.id || user._id || String(user.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{user.status || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {user.status === 'active' && (
                            <button
                              className="text-red-500 hover:text-red-700 flex items-center"
                              onClick={() => handleDeactivate(user.id || user._id)}
                              disabled={deactivating === user.id || deactivating === user._id}
                            >
                              <FaUserSlash className="mr-1" />
                              {deactivating === user.id ? 'Deactivating...' : 'Deactivate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </div>
        )}
        {activeSection === 'Doctors' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Doctor Management</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={doctorSearch}
                  onChange={e => setDoctorSearch(e.target.value)}
                />
              </div>
              {doctorLoading && <span className="text-blue-500 ml-4">Loading...</span>}
              {doctorError && <span className="text-red-500 ml-4">{doctorError}</span>}
            </div>
            {doctorLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                    {(filteredDoctors || []).map(doctor => (
                      <tr key={doctor.id || doctor._id || String(doctor.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">{doctor.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{doctor.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{doctor.specialty || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.status === 'approved' ? 'bg-green-100 text-green-800' : doctor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : doctor.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-600'}`}>{doctor.status || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {doctor.status === 'pending' && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-800 font-semibold"
                                onClick={() => handleDoctorAction(doctor.id || doctor._id, 'approve')}
                                disabled={doctorAction === doctor.id + 'approve' || doctorAction === doctor._id + 'approve'}
                              >
                                {doctorAction === doctor.id + 'approve' || doctorAction === doctor._id + 'approve' ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 font-semibold"
                                onClick={() => handleDoctorAction(doctor.id || doctor._id, 'reject')}
                                disabled={doctorAction === doctor.id + 'reject' || doctorAction === doctor._id + 'reject'}
                              >
                                {doctorAction === doctor.id + 'reject' || doctorAction === doctor._id + 'reject' ? 'Rejecting...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {doctor.status === 'approved' && (
                            <button
                              className="text-gray-500 hover:text-gray-700 font-semibold"
                              onClick={() => handleDoctorAction(doctor.id || doctor._id, 'deactivate')}
                              disabled={doctorAction === doctor.id + 'deactivate' || doctorAction === doctor._id + 'deactivate'}
                            >
                              {doctorAction === doctor.id + 'deactivate' || doctorAction === doctor._id + 'deactivate' ? 'Deactivating...' : 'Deactivate'}
                            </button>
                          )}
                          {doctor.status === 'inactive' && (
                            <button
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                              onClick={() => handleDoctorAction(doctor.id || doctor._id, 'activate')}
                              disabled={doctorAction === doctor.id + 'activate' || doctorAction === doctor._id + 'activate'}
                            >
                              {doctorAction === doctor.id + 'activate' || doctorAction === doctor._id + 'activate' ? 'Activating...' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeSection === 'Appointments' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Appointments Management</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                />
              </div>
              {bookingLoading && <span className="text-blue-500 ml-4">Loading...</span>}
              {bookingError && <span className="text-red-500 ml-4">{bookingError}</span>}
            </div>
            {bookingLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                    {(filteredBookings || []).map(booking => (
                      <tr key={booking.id || booking._id || String(booking.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.patient_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.doctor_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.appointment_date || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{booking.appointment_time || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : booking.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>{booking.status || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-800 font-semibold"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View Details
                          </button>
                          {booking.status === 'confirmed' && (
                            <button
                              className="text-red-600 hover:text-red-800 font-semibold"
                              onClick={() => handleBookingAction(booking.id || booking._id, 'cancel')}
                              disabled={bookingAction === booking.id + 'cancel' || bookingAction === booking._id + 'cancel'}
                            >
                              {bookingAction === booking.id + 'cancel' || bookingAction === booking._id + 'cancel' ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                          {booking.status === 'rescheduled' && (
                            <button
                              className="text-green-600 hover:text-green-800 font-semibold"
                              onClick={() => handleBookingAction(booking.id || booking._id, 'approve')}
                              disabled={bookingAction === booking.id + 'approve' || bookingAction === booking._id + 'approve'}
                            >
                              {bookingAction === booking.id + 'approve' || bookingAction === booking._id + 'approve' ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'rescheduled') && (
                            <button
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                              onClick={() => handleReschedule(booking)}
                            >
                              Reschedule
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Reschedule Modal */}
            {showReschedule && rescheduleBooking && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4">Reschedule Appointment</h3>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">New Date</label>
                    <input
                      type="date"
                      defaultValue={rescheduleBooking.appointment_date || ''}
                      ref={rescheduleDateRef}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">New Time</label>
                    <input
                      type="time"
                      defaultValue={rescheduleBooking.appointment_time || ''}
                      ref={rescheduleTimeRef}
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setShowReschedule(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                      onClick={submitReschedule}
                      disabled={bookingAction === rescheduleBooking.id + 'reschedule'}
                    >
                      {bookingAction === rescheduleBooking.id + 'reschedule' ? 'Rescheduling...' : 'Reschedule'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === 'Lab Tests' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Lab Tests Management</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search lab tests..."
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  value={labSearch}
                  onChange={e => setLabSearch(e.target.value)}
                />
              </div>
              {labLoading && <span className="text-blue-500 ml-4">Loading...</span>}
              {labError && <span className="text-red-500 ml-4">{labError}</span>}
            </div>
            {labLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                    {(filteredLabRequests || []).map(lab => (
                      <tr key={lab.id || lab._id || String(lab.id)}>
                        <td className="px-6 py-4 whitespace-nowrap">{lab.patient_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{lab.test_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{lab.request_date || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lab.status === 'approved' ? 'bg-green-100 text-green-800' : lab.status === 'completed' ? 'bg-blue-100 text-blue-800' : lab.status === 'rejected' ? 'bg-red-100 text-red-800' : lab.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>{lab.status || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-800 font-semibold"
                            onClick={() => setSelectedLab(lab)}
                          >
                            View Details
                          </button>
                          {lab.status === 'pending' && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-800 font-semibold"
                                onClick={() => handleLabAction(lab.id || lab._id, 'approve')}
                                disabled={labAction === lab.id + 'approve' || labAction === lab._id + 'approve'}
                              >
                                {labAction === lab.id + 'approve' || labAction === lab._id + 'approve' ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 font-semibold"
                                onClick={() => handleLabAction(lab.id || lab._id, 'reject')}
                                disabled={labAction === lab.id + 'reject' || labAction === lab._id + 'reject'}
                              >
                                {labAction === lab.id + 'reject' || labAction === lab._id + 'reject' ? 'Rejecting...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {lab.status === 'approved' && (
                            <button
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                              onClick={() => handleLabAction(lab.id || lab._id, 'complete')}
                              disabled={labAction === lab.id + 'complete' || labAction === lab._id + 'complete'}
                            >
                              {labAction === lab.id + 'complete' || labAction === lab._id + 'complete' ? 'Completing...' : 'Mark as Completed'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Lab Test Details Modal */}
            {selectedLab && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4">Lab Test Details</h3>
                  <div className="mb-2"><b>Patient:</b> {selectedLab.patient_name || 'N/A'} ({selectedLab.patient_email || ''})</div>
                  <div className="mb-2"><b>Test:</b> {selectedLab.test_name || 'N/A'}</div>
                  <div className="mb-2"><b>Date:</b> {selectedLab.request_date || 'N/A'}</div>
                  <div className="mb-2"><b>Status:</b> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedLab.status === 'approved' ? 'bg-green-100 text-green-800' : selectedLab.status === 'completed' ? 'bg-blue-100 text-blue-800' : selectedLab.status === 'rejected' ? 'bg-red-100 text-red-800' : selectedLab.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>{selectedLab.status || 'N/A'}</span></div>
                  {selectedLab.notes && <div className="mb-2"><b>Notes:</b> {selectedLab.notes || 'N/A'}</div>}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedLab.status === 'pending' && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-800 font-semibold"
                          onClick={() => { handleLabAction(selectedLab.id || selectedLab._id, 'approve'); setSelectedLab(null); }}
                          disabled={labAction === selectedLab.id + 'approve' || labAction === selectedLab._id + 'approve'}
                        >
                          {labAction === selectedLab.id + 'approve' || labAction === selectedLab._id + 'approve' ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 font-semibold"
                          onClick={() => { handleLabAction(selectedLab.id || selectedLab._id, 'reject'); setSelectedLab(null); }}
                          disabled={labAction === selectedLab.id + 'reject' || labAction === selectedLab._id + 'reject'}
                        >
                          {labAction === selectedLab.id + 'reject' || labAction === selectedLab._id + 'reject' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {selectedLab.status === 'approved' && (
                      <button
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                        onClick={() => { handleLabAction(selectedLab.id || selectedLab._id, 'complete'); setSelectedLab(null); }}
                        disabled={labAction === selectedLab.id + 'complete' || labAction === selectedLab._id + 'complete'}
                      >
                        {labAction === selectedLab.id + 'complete' || labAction === selectedLab._id + 'complete' ? 'Completing...' : 'Mark as Completed'}
                      </button>
                    )}
                    <button
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 ml-auto"
                      onClick={() => setSelectedLab(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeSection === 'Notifications' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              {notificationsLoading ? (
                <div className="flex items-center justify-center h-32 text-blue-500">Loading...</div>
              ) : notificationsError ? (
                <div className="text-red-500">{notificationsError}</div>
              ) : notifications.length === 0 ? (
                <div className="text-gray-500">No notifications to display.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notif) => (
                    <li key={notif.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className={`font-medium ${notif.is_read ? 'text-gray-400' : 'text-gray-800'}`}>{notif.title || notif.message}</div>
                        <div className="text-xs text-gray-400">{notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <button
                            className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold hover:bg-blue-200"
                            onClick={async () => {
                              try {
                                await adminAPI.markNotificationAsRead(notif.id);
                                setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
                                toast.success('Notification marked as read');
                              } catch {
                                toast.error('Failed to mark as read');
                              }
                            }}
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold hover:bg-red-200"
                          onClick={async () => {
                            try {
                              await adminAPI.deleteNotification(notif.id);
                              setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                              toast.success('Notification deleted');
                            } catch {
                              toast.error('Failed to delete notification');
                            }
                          }}
                        >
                          Delete
                        </button>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${notif.type === 'success' ? 'bg-green-100 text-green-800' : notif.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>{notif.type || 'info'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {/* Reports Section Placeholder */}
        {activeSection === 'Reports' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Reports</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
              <span className="text-6xl text-gray-300 mb-4"><FaChartBar /></span>
              <p className="text-lg text-gray-600 mb-2">Reports and analytics will be available here soon.</p>
              <p className="text-gray-400">This section will provide downloadable and visual reports for users, doctors, appointments, and lab tests.</p>
            </div>
          </div>
        )}
        {/* Settings Section Placeholder */}
        {activeSection === 'Settings' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px] mb-8">
              <span className="text-6xl text-gray-300 mb-4"><FaCog /></span>
              <p className="text-lg text-gray-600 mb-2">Settings management will be available here soon.</p>
              <p className="text-gray-400">This section will allow you to configure system preferences, admin accounts, and other platform settings.</p>
            </div>
            {/* Change Password Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 max-w-md mx-auto w-full">
              <h3 className="text-lg font-bold mb-4">Change Password</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPasswordSuccess('');
                if (!currentPassword || !newPassword || !confirmPassword) {
                  setPasswordError('All fields are required.');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setPasswordError('New passwords do not match.');
                  return;
                }
                setPasswordLoading(true);
                setPasswordError('');
                try {
                  await adminAPI.changePassword(currentPassword, newPassword);
                  setPasswordSuccess('Password changed successfully!');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                } catch (err) {
                  setPasswordError(err?.response?.data?.message || 'Failed to change password.');
                } finally {
                  setPasswordLoading(false);
                }
              }}>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Current Password</label>
                  <input type="password" className="border border-gray-300 rounded px-3 py-2 w-full" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">New Password</label>
                  <input type="password" className="border border-gray-300 rounded px-3 py-2 w-full" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Confirm New Password</label>
                  <input type="password" className="border border-gray-300 rounded px-3 py-2 w-full" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                {passwordError && <div className="text-red-500 mb-2">{passwordError}</div>}
                {passwordSuccess && <div className="text-green-600 mb-2">{passwordSuccess}</div>}
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 w-full" disabled={passwordLoading}>
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Add similar blocks for Analytics, etc. */}
      </main>
      {selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Appointment Details</h3>
            <div className="mb-2"><b>Patient:</b> {selectedBooking.patient_name || 'N/A'} ({selectedBooking.patient_email || ''})</div>
            <div className="mb-2"><b>Doctor:</b> {selectedBooking.doctor_name || 'N/A'} ({selectedBooking.doctor_specialty || ''})</div>
            <div className="mb-2"><b>Date:</b> {selectedBooking.appointment_date || 'N/A'}</div>
            <div className="mb-2"><b>Time:</b> {selectedBooking.appointment_time || 'N/A'}</div>
            <div className="mb-2"><b>Status:</b> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' : selectedBooking.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>{selectedBooking.status || 'N/A'}</span></div>
            {selectedBooking.reason && <div className="mb-2"><b>Reason:</b> {selectedBooking.reason || 'N/A'}</div>}
            {selectedBooking.notes && <div className="mb-2"><b>Notes:</b> {selectedBooking.notes || 'N/A'}</div>}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedBooking.status === 'confirmed' && (
                <button
                  className="text-red-600 hover:text-red-800 font-semibold"
                  onClick={() => { handleBookingAction(selectedBooking.id || selectedBooking._id, 'cancel'); setSelectedBooking(null); }}
                  disabled={bookingAction === selectedBooking.id + 'cancel' || bookingAction === selectedBooking._id + 'cancel'}
                >
                  {bookingAction === selectedBooking.id + 'cancel' || bookingAction === selectedBooking._id + 'cancel' ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
              {selectedBooking.status === 'rescheduled' && (
                <button
                  className="text-green-600 hover:text-green-800 font-semibold"
                  onClick={() => { handleBookingAction(selectedBooking.id || selectedBooking._id, 'approve'); setSelectedBooking(null); }}
                  disabled={bookingAction === selectedBooking.id + 'approve' || bookingAction === selectedBooking._id + 'approve'}
                >
                  {bookingAction === selectedBooking.id + 'approve' || bookingAction === selectedBooking._id + 'approve' ? 'Approving...' : 'Approve'}
                </button>
              )}
              {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'rescheduled') && (
                <button
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                  onClick={() => { setRescheduleBooking(selectedBooking); setShowReschedule(true); setSelectedBooking(null); }}
                >
                  Reschedule
                </button>
              )}
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 ml-auto"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default AdminDashboard; 