import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  // Mock notifications and health tips
  const [notifications] = useState([
    { id: 1, message: 'Your appointment with Dr. Sarah is tomorrow at 3:00 PM.', type: 'reminder' },
    { id: 2, message: 'Lab results for your recent blood test are ready.', type: 'lab' },
    { id: 3, message: 'Don’t forget to take your medication today.', type: 'medication' },
  ]);
  const [healthTips] = useState([
    'Drink at least 8 glasses of water today.',
    'Take a 10-minute walk after meals.',
    'Remember to take your prescribed medication.',
    'Eat at least 5 servings of fruits and vegetables.',
    'Practice deep breathing for 5 minutes.',
  ]);
  const [tipIndex, setTipIndex] = useState(0);

  // Personalized greeting
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // Mock upcoming appointments
  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Sarah Johnson', type: 'General Checkup', date: 'Tomorrow', time: '3:00 PM', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Michael Chen', type: 'Cardiology Consultation', date: 'Dec 15', time: '10:00 AM', status: 'Pending' },
    { id: 3, doctor: 'Dr. Emily Smith', type: 'Dermatology', date: 'Dec 20', time: '1:00 PM', status: 'Confirmed' },
  ]);
  // Mock lab results
  const [labResults] = useState([
    { id: 1, test: 'Blood Test', result: 'Normal', date: 'Dec 1' },
    { id: 2, test: 'Cholesterol', result: 'High', date: 'Nov 20' },
    { id: 3, test: 'COVID-19', result: 'Negative', date: 'Nov 10' },
  ]);
  // Mock medications
  const [medications, setMedications] = useState([
    { id: 1, name: 'Aspirin', time: '8:00 AM', taken: false },
    { id: 2, name: 'Metformin', time: '12:00 PM', taken: false },
    { id: 3, name: 'Lisinopril', time: '8:00 PM', taken: false },
  ]);
  const handleMedicationToggle = (id) => {
    setMedications(meds => meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  // Rotate health tips every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [healthTips.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personalized Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-blue-800 dark:text-cyan-200 drop-shadow">{getGreeting()}, {user?.name?.split(' ')[0] || 'Patient'}!</h1>
        </div>
        {/* Profile Card & Health Tip */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700 p-4 w-full md:w-auto">
            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 via-cyan-100 to-green-100 dark:from-cyan-900 dark:via-gray-800 dark:to-gray-900 text-blue-700 dark:text-cyan-200 text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0) || 'P'}
            </span>
            <div>
              <div className="text-xl font-bold text-blue-800 dark:text-cyan-200">{user?.name}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">{user?.email}</div>
              <div className="mt-1">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${user?.subscription_status === 'active' ? 'bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>{user?.subscription_status === 'active' ? 'Premium' : 'Standard'}</span>
              </div>
            </div>
            <Link to="/patient/profile" className="ml-auto px-3 py-1 rounded bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-cyan-200 hover:bg-blue-100 dark:hover:bg-gray-700 text-sm font-semibold transition">Edit Profile</Link>
          </div>
          {/* Health Tips Card */}
          <div className="flex-1 bg-gradient-to-tr from-green-100 via-blue-50 to-white dark:from-cyan-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-green-100 dark:border-cyan-700 p-4 flex flex-col items-center justify-center min-w-[250px]">
            <div className="text-green-600 dark:text-green-300 text-2xl mb-2">💡</div>
            <div className="text-gray-800 dark:text-cyan-200 text-center font-medium">{healthTips[tipIndex]}</div>
            <div className="text-xs text-gray-400 dark:text-gray-300 mt-2">Health Tip</div>
          </div>
        </div>
        {/* Notifications Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 dark:text-cyan-200 mb-2">Notifications</h2>
          <div className="flex flex-wrap gap-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-400 flex items-center gap-2">
                {notif.type === 'reminder' && <span className="text-blue-500">🔔</span>}
                {notif.type === 'lab' && <span className="text-purple-500">🧪</span>}
                {notif.type === 'medication' && <span className="text-green-500">💊</span>}
                <span>{notif.message}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Medication Reminders */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 dark:text-cyan-200 mb-2">Today's Medications</h2>
          <div className="flex flex-wrap gap-3">
            {medications.map(med => (
              <label key={med.id} className={`flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2 text-sm border-l-4 ${med.taken ? 'border-green-400' : 'border-gray-300'}`}>
                <input type="checkbox" checked={med.taken} onChange={() => handleMedicationToggle(med.id)} />
                <span className={med.taken ? 'line-through text-gray-400' : ''}>{med.name} <span className="text-xs text-gray-500">({med.time})</span></span>
              </label>
            ))}
          </div>
        </div>
        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 dark:text-cyan-200 mb-2">Upcoming Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Doctor</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Type</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Date</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Time</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.id} className="border-t">
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-cyan-200">{app.doctor}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{app.type}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{app.date}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{app.time}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${app.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-200'}`}>{app.status}</span>
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold dark:text-cyan-200">Reschedule</button>
                      <button className="text-red-600 hover:text-red-800 text-xs font-semibold dark:text-red-200">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Lab Results Preview */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 dark:text-cyan-200 mb-2">Recent Lab Results</h2>
          <div className="flex flex-wrap gap-3">
            {labResults.map(lab => (
              <div key={lab.id} className="bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-l-4 border-purple-400 flex flex-col min-w-[180px]">
                <span className="font-semibold text-purple-700 dark:text-purple-300">{lab.test}</span>
                <span className="text-xs text-gray-500 dark:text-gray-300">{lab.date}</span>
                <span className="mt-1">Result: <span className={lab.result === 'Normal' || lab.result === 'Negative' ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}>{lab.result}</span></span>
              </div>
            ))}
            <Link to="/patient/lab-tests" className="px-4 py-2 rounded bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800 text-sm font-semibold shadow">View All Lab Reports</Link>
          </div>
        </div>
        {/* Contact Support Button */}
        <div className="mb-8 flex justify-end">
          <Link to="/patient/support" className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow">Contact Support</Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-xl shadow-lg p-6 backdrop-blur-md border border-blue-100 dark:border-cyan-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-cyan-900 text-blue-600 dark:text-cyan-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-cyan-200">Upcoming Appointments</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-cyan-200">2</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-xl shadow-lg p-6 backdrop-blur-md border border-green-100 dark:border-cyan-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-cyan-200">Completed Visits</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">15</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-xl shadow-lg p-6 backdrop-blur-md border border-purple-100 dark:border-cyan-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-cyan-200">Lab Reports</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">8</p>
              </div>
            </div>
          </div>
          {/* Wellness Card */}
          <div className="bg-gradient-to-br from-green-100 via-blue-50 to-white dark:from-cyan-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-green-200 dark:border-cyan-700 flex flex-col items-center justify-center">
            <svg className="w-10 h-10 text-green-400 dark:text-green-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4 0 2.21 1.79 4 4 4s4-1.79 4-4c0-2.21-1.79-4-4-4zm0 0V4m0 16v-4" />
            </svg>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Wellness Score</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">87</p>
            <p className="text-xs text-green-700 dark:text-green-300">Great! Keep up your healthy habits.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-lg shadow-md backdrop-blur-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-cyan-200">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link
                  to="/patient/book-appointment"
                  className="flex items-center p-4 bg-blue-50 dark:bg-gray-800 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 transition duration-200 shadow"
                >
                  <div className="p-2 bg-blue-100 dark:bg-cyan-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-cyan-200">Book Appointment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Schedule a consultation with a doctor</p>
                  </div>
                </Link>

                <Link
                  to="/patient/lab-tests"
                  className="flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition duration-200 shadow"
                >
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-cyan-200">Book Lab Test</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Schedule laboratory tests</p>
                  </div>
                </Link>

                <Link
                  to="/patient/health-records"
                  className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition duration-200 shadow cursor-pointer"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-cyan-200">View Health Records</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Access your medical history</p>
                  </div>
                </Link>
                <Link
                  to="/patient/download-summary"
                  className="flex items-center p-4 bg-cyan-50 dark:bg-cyan-900 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-800 transition duration-200 shadow"
                >
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                    <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-cyan-900 dark:text-cyan-200">Download Health Summary</h4>
                    <p className="text-sm text-cyan-600 dark:text-gray-300">Get a PDF of your health records</p>
                  </div>
                </Link>
                <Link
                  to="/patient/find-clinic"
                  className="flex items-center p-4 bg-pink-50 dark:bg-pink-900 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-800 transition duration-200 shadow"
                >
                  <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                    <svg className="w-6 h-6 text-pink-600 dark:text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 0011.314-11.314l-4.243-4.243a4 4 0 00-5.657 5.657l4.243 4.243z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-pink-900 dark:text-pink-200">Find Nearest Clinic</h4>
                    <p className="text-sm text-pink-600 dark:text-gray-300">Locate clinics near you</p>
                  </div>
                </Link>
                {user?.subscription_status === 'active' && (
                  <>
                    <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800 transition duration-200 shadow">
                      <div className="p-2 bg-yellow-200 dark:bg-yellow-900 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 4h-1v-4h-1m-4 4h-1v-4h-1" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-yellow-700 dark:text-yellow-200">Priority Booking</h4>
                        <p className="text-sm text-yellow-600 dark:text-gray-300">Get priority access to top doctors</p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-pink-50 dark:bg-pink-900 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-800 transition duration-200 shadow">
                      <div className="p-2 bg-pink-200 dark:bg-pink-900 rounded-lg">
                        <svg className="w-6 h-6 text-pink-600 dark:text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-pink-700 dark:text-pink-200">Direct Chat with Doctors</h4>
                        <p className="text-sm text-pink-600 dark:text-gray-300">Message doctors directly for quick advice</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-lg shadow-md backdrop-blur-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-cyan-200">Recent Appointments</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Example appointment card with avatar and status badge */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-cyan-900">
                      <svg className="w-6 h-6 text-blue-600 dark:text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0v4m0 4v-4" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-cyan-200">Dr. Sarah Johnson</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">General Checkup</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-cyan-200">Tomorrow, 3:00 PM</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-200">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 0v4m0 4v-4" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-cyan-200">Dr. Michael Chen</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Cardiology Consultation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-cyan-200">Dec 15, 10:00 AM</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Premium Support Card */}
        {user?.subscription_status === 'active' && (
          <div className="mt-8 bg-gradient-to-r from-yellow-100 via-yellow-50 to-white rounded-lg shadow p-6 flex items-center gap-6">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 4h-1v-4h-1m-4 4h-1v-4h-1" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-200 mb-1">Premium Support</h3>
              <p className="text-gray-700 dark:text-gray-300">You have access to 24/7 premium support. Contact us anytime for priority assistance and exclusive offers.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard; 