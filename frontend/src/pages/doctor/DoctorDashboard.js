import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import Loading from '../../components/ui/Loading';
import { FaTimes } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalPatients: 0,
    pendingReports: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');

  // Patient Quick View modal
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const handlePatientClick = (pat) => {
    setSelectedPatient({
      ...pat,
      recentVisits: [
        { date: '2024-06-01', reason: 'General Checkup', notes: 'All good.' },
        { date: '2024-05-15', reason: 'Flu Symptoms', notes: 'Prescribed medication.' },
      ],
      allergies: ['Penicillin'],
      medications: ['Aspirin'],
      labResults: [
        { test: 'Blood Test', result: 'Normal', date: '2024-05-20' },
        { test: 'Cholesterol', result: 'High', date: '2024-04-10' },
      ],
    });
    setShowPatientModal(true);
  };

  // Lab Requests mock data
  const [labRequests] = useState([
    { id: 1, patient: 'Jane Smith', test: 'Blood Test', date: '2024-06-10', status: 'pending' },
    { id: 2, patient: 'John Doe', test: 'X-Ray', date: '2024-06-09', status: 'completed' },
  ]);
  // Prescription form state
  const [prescription, setPrescription] = useState({ patient: '', medication: '', dosage: '', notes: '' });
  const [prescriptionSuccess, setPrescriptionSuccess] = useState('');

  // Analytics mock data
  const analyticsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    patientsSeen: [5, 7, 6, 8, 4, 3, 9],
    appointments: [8, 10, 7, 12, 6, 5, 11],
    pendingLabs: [2, 1, 3, 2, 0, 1, 2],
  };
  // Profile/Availability state
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '', specialty: '' });
  const [availability, setAvailability] = useState({ start: '09:00', end: '17:00' });
  const [profileSuccess, setProfileSuccess] = useState('');

  // Search/Filter states for appointments and patients
  const [appointmentsSearch, setAppointmentsSearch] = useState('');
  const [patientsSearch, setPatientsSearch] = useState('');

  // Search/Filter states for lab requests
  const [labRequestsSearch, setLabRequestsSearch] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch stats
      const statsRes = await api.get('/doctors/me/dashboard-stats');
      setStats(statsRes.data);
      // Fetch appointments
      const appointmentsRes = await api.get('/doctors/me/appointments');
      setAppointments(appointmentsRes.data.appointments);
      // Fetch patients
      const patientsRes = await api.get('/doctors/me/patients');
      setPatients(patientsRes.data.patients);
    } catch (err) {
      let msg = 'Failed to load dashboard data.';
      if (err.response && err.response.data && err.response.data.message) {
        msg += ' ' + err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (appointmentId) => {
    alert('Mark as completed feature coming soon!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  // Filter functions
  const filteredAppointments = appointments.filter(apt =>
    apt.patient_name.toLowerCase().includes(appointmentsSearch.toLowerCase()) ||
    apt.patient_email.toLowerCase().includes(appointmentsSearch.toLowerCase()) ||
    apt.reason.toLowerCase().includes(appointmentsSearch.toLowerCase())
  );

  const filteredPatients = patients.filter(pat =>
    pat.name.toLowerCase().includes(patientsSearch.toLowerCase()) ||
    pat.email.toLowerCase().includes(patientsSearch.toLowerCase()) ||
    pat.phone.toLowerCase().includes(patientsSearch.toLowerCase())
  );

  // Filter functions for lab requests
  const filteredLabRequests = labRequests.filter(req =>
    req.patient.toLowerCase().includes(labRequestsSearch.toLowerCase()) ||
    req.test.toLowerCase().includes(labRequestsSearch.toLowerCase()) ||
    req.date.toLowerCase().includes(labRequestsSearch.toLowerCase()) ||
    req.status.toLowerCase().includes(labRequestsSearch.toLowerCase())
  );

  // Placeholder functions for new actions
  const handleViewAppointment = (appointment) => {
    alert(`View appointment details for ID: ${appointment.id}`);
  };

  const handleRescheduleAppointment = (appointment) => {
    alert(`Reschedule appointment for ID: ${appointment.id}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loading size="large" color="#2563eb" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col md:flex-row">
      {/* Main Content */}
      <div className="flex-1">
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f3f4f6 60%, #e3e9ff 100%)',
          backgroundImage: `url('data:image/svg+xml;utf8,<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg"><g opacity="0.08"><circle cx="100" cy="100" r="60" fill="%2390cdf4"/><rect x="350" y="80" width="120" height="40" rx="20" fill="%23a7f3d0"/><rect x="200" y="400" width="80" height="80" rx="40" fill="%23fbbf24"/><rect x="400" y="300" width="60" height="60" rx="30" fill="%23f472b6"/><rect x="80" y="350" width="100" height="40" rx="20" fill="%2390cdf4"/></g></svg>')`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-800 dark:text-cyan-200 drop-shadow">Doctor Dashboard</h1>
              <p className="text-cyan-700 dark:text-cyan-100">Welcome back, Dr. {user?.name}</p>
            </div>
            {/* Profile Summary Card */}
            <div className="mb-8 flex flex-col sm:flex-row items-center bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700 p-6 gap-6">
              <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 via-cyan-100 to-green-100 dark:from-cyan-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center text-4xl font-bold text-blue-700 dark:text-cyan-200 shadow-lg">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'DR'}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-semibold text-blue-800 dark:text-cyan-200">Dr. {user?.name || 'Doctor Name'}</div>
                <div className="text-cyan-700 dark:text-cyan-100 mb-1">{profile.specialty || 'Specialty not set'}</div>
                <div className="text-gray-400 dark:text-gray-300 text-sm">{user?.email}</div>
                {profile.phone && <div className="text-gray-400 dark:text-gray-300 text-sm">{profile.phone}</div>}
              </div>
        </div>
            {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md"><p className="text-red-600 dark:text-red-200">{error}</p></div>}
        {/* Tabs */}
        <div className="mb-8">
              <nav className="flex space-x-2 bg-blue-50 dark:bg-gray-800 rounded-lg p-2 shadow-inner">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'appointments', name: 'Appointments' },
                  { id: 'patients', name: 'Patients' },
                  { id: 'lab', name: 'Lab Requests' },
                  { id: 'prescriptions', name: 'Prescriptions' },
                  { id: 'analytics', name: 'Analytics' },
                  { id: 'profile', name: 'Profile / Availability' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-blue-100 dark:focus:bg-cyan-600 dark:text-white ${
                  activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-400 text-white shadow'
                        : 'bg-transparent text-blue-700 dark:text-cyan-100 hover:bg-blue-100 dark:hover:bg-cyan-700'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Today's Appointments</h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-cyan-400">{stats.todaysAppointments}</p>
                  </div>
                </div>
              </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total Patients</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalPatients}</p>
                  </div>
                </div>
              </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Reports</h3>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.pendingReports}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Appointments */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Appointments</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{apt.patient_name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{apt.reason}</p>
                      </div>
                      <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(apt.appointment_date)}, {formatTime(apt.appointment_time)}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              apt.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                      {appointments.length === 0 && <div className="text-gray-500 dark:text-gray-400 text-center">No recent appointments.</div>}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">All Appointments</h2>
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 dark:focus:border-cyan-300 w-full md:w-64"
                    value={appointmentsSearch || ''}
                    onChange={e => setAppointmentsSearch(e.target.value)}
                  />
            </div>
            <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                    <tr key={apt.id}>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-cyan-200 font-bold text-sm">
                              {apt.patient_name ? apt.patient_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'PT'}
                            </span>
                            <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{apt.patient_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-300">{apt.patient_email}</div>
                            </div>
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(apt.appointment_date)} at {formatTime(apt.appointment_time)}
                      </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">{apt.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              apt.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                            <button
                              onClick={() => handleViewAppointment(apt)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-cyan-400 dark:hover:text-cyan-200"
                            >View</button>
                        {apt.status !== 'completed' && (
                              <>
                                <button
                                  onClick={() => handleRescheduleAppointment(apt)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-cyan-400 dark:hover:text-cyan-200"
                                >Reschedule</button>
                          <button
                            onClick={() => handleMarkCompleted(apt.id)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                                >Mark as Completed</button>
                              </>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No appointments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
            {/* Patients Tab (update row click) */}
        {activeTab === 'patients' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Patients</h2>
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 dark:focus:border-cyan-300 w-full md:w-64"
                    value={patientsSearch || ''}
                    onChange={e => setPatientsSearch(e.target.value)}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPatients.length > 0 ? filteredPatients.map((pat) => (
                        <tr key={pat.id} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900" onClick={() => handlePatientClick(pat)}>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-700 dark:text-green-200 font-bold text-sm">
                              {pat.name ? pat.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'PT'}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{pat.name}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{pat.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{pat.phone}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No patients found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Lab Requests Tab */}
            {activeTab === 'lab' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Lab Requests</h2>
                  <input
                    type="text"
                    placeholder="Search lab requests..."
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 dark:focus:border-cyan-300 w-full md:w-64"
                    value={labRequestsSearch || ''}
                    onChange={e => setLabRequestsSearch(e.target.value)}
                  />
            </div>
            <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Test</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLabRequests.length > 0 ? filteredLabRequests.map((req) => (
                        <tr key={req.id}>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-200 font-bold text-sm">
                              {req.patient ? req.patient.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'PT'}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{req.patient}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{req.test}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{req.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              req.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              req.status === 'reviewed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                    </tr>
                  )) : (
                    <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No lab requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg mx-auto">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Write Prescription</h2>
                </div>
                <form className="p-6 space-y-4" onSubmit={e => {
                  e.preventDefault();
                  setPrescriptionSuccess('Prescription sent successfully!');
                  setPrescription({ patient: '', medication: '', dosage: '', notes: '' });
                }}>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Patient Name</label>
                    <input type="text" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={prescription.patient} onChange={e => setPrescription(p => ({ ...p, patient: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Medication</label>
                    <input type="text" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={prescription.medication} onChange={e => setPrescription(p => ({ ...p, medication: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Dosage</label>
                    <input type="text" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={prescription.dosage} onChange={e => setPrescription(p => ({ ...p, dosage: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Notes</label>
                    <textarea className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={prescription.notes} onChange={e => setPrescription(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                  {prescriptionSuccess && <div className="text-green-600 dark:text-green-400 mb-2">{prescriptionSuccess}</div>}
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 w-full">Send Prescription</button>
                </form>
              </div>
            )}
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Patients Seen (This Week)</h3>
                    <Bar
                      data={{
                        labels: analyticsData.labels,
                        datasets: [
                          { label: 'Patients Seen', data: analyticsData.patientsSeen, backgroundColor: '#2563eb' },
                        ]
                      }}
                      options={{ responsive: true, plugins: { legend: { display: false } } }}
                      height={200}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Appointments (This Week)</h3>
                    <Line
                      data={{
                        labels: analyticsData.labels,
                        datasets: [
                          { label: 'Appointments', data: analyticsData.appointments, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.4 },
                        ]
                      }}
                      options={{ responsive: true, plugins: { legend: { display: false } } }}
                      height={200}
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Pending Lab Requests (This Week)</h3>
                  <Bar
                    data={{
                      labels: analyticsData.labels,
                      datasets: [
                        { label: 'Pending Labs', data: analyticsData.pendingLabs, backgroundColor: '#a21caf' },
                      ]
                    }}
                    options={{ responsive: true, plugins: { legend: { display: false } } }}
                    height={200}
                  />
                </div>
              </div>
            )}
            {/* Profile / Availability Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg mx-auto p-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile & Availability</h2>
                <form className="space-y-4" onSubmit={e => {
                  e.preventDefault();
                  setProfileSuccess('Profile updated successfully!');
                }}>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Name</label>
                    <input type="text" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Email</label>
                    <input type="email" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Phone</label>
                    <input type="text" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Specialty</label>
                    <input type="text" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={profile.specialty} onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Available From</label>
                      <input type="time" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={availability.start} onChange={e => setAvailability(a => ({ ...a, start: e.target.value }))} />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Available To</label>
                      <input type="time" className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full" value={availability.end} onChange={e => setAvailability(a => ({ ...a, end: e.target.value }))} />
                    </div>
                  </div>
                  {profileSuccess && <div className="text-green-600 dark:text-green-400 mb-2">{profileSuccess}</div>}
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 w-full">Save Changes</button>
                </form>
              </div>
            )}
            {/* Patient Quick View Modal */}
            {showPatientModal && selectedPatient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100" onClick={() => setShowPatientModal(false)}><FaTimes size={20} /></button>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Patient Details: {selectedPatient.name}</h3>
                  <div className="mb-2 text-gray-600 dark:text-gray-300">Email: {selectedPatient.email}</div>
                  <div className="mb-2 text-gray-600 dark:text-gray-300">Phone: {selectedPatient.phone}</div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Recent Visits</h4>
                    <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                      {selectedPatient.recentVisits.map((v, i) => (
                        <li key={i}>{v.date}: {v.reason} - {v.notes}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Allergies</h4>
                    <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                      {selectedPatient.allergies.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Medications</h4>
                    <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                      {selectedPatient.medications.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Lab Results</h4>
                    <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                      {selectedPatient.labResults.map((l, i) => (
                        <li key={i}>{l.date}: {l.test} - {l.result}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Notifications Panel */}
      {/* The old aside notifications panel is removed as per the edit hint. */}
    </div>
  );
};

export default DoctorDashboard; 