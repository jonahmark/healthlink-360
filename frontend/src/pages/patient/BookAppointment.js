import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch available doctors from API
    setDoctors([
      { id: 1, name: 'Dr. Sarah Johnson', specialization: 'General Medicine' },
      { id: 2, name: 'Dr. Michael Chen', specialization: 'Cardiology' },
      { id: 3, name: 'Dr. Emily Davis', specialization: 'Pediatrics' }
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Book appointment via API
    setTimeout(() => {
      setLoading(false);
      navigate('/patient/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-cyan-200 drop-shadow">Book Appointment</h1>
          <p className="text-cyan-700 dark:text-cyan-100">Schedule a consultation with a healthcare provider</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700">
          <div className="px-6 py-4 border-b border-blue-100 dark:border-cyan-700">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-cyan-200">Appointment Details</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Select Doctor</label>
              <select
                id="doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                required
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialization}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Preferred Date</label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Preferred Time</label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                  required
                >
                  <option value="">Select time...</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Reason for Visit</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                placeholder="Please describe your symptoms or reason for the appointment..."
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/patient/dashboard')}
                className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white font-medium py-2 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg transition"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 