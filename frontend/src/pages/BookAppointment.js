import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Loading from '../components/ui/Loading';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
    '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00'
  ];

  // Fetch available doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctors');
        setDoctors(response.data.doctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/bookings', {
        doctor_id: formData.doctorId,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        reason: formData.reason,
        notes: formData.notes
      });

      console.log('Appointment booked:', response.data);
      
      // Reset form
      setFormData({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        notes: ''
      });
      
      alert('Appointment booked successfully! You will receive a confirmation shortly.');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const formatTimeSlot = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="large" color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700 p-8">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-cyan-200 mb-6 drop-shadow">Book an Appointment</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
              <p className="text-red-600 dark:text-red-200">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-cyan-200 mb-2">Select Doctor</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200 dark:border-cyan-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                required
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialty}</option>
                ))}
              </select>
            </div>
            {/* Appointment Date */}
            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-cyan-200 mb-2">Appointment Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200 dark:border-cyan-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {/* Appointment Time */}
            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-cyan-200 mb-2">Appointment Time</label>
              <select
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-blue-200 dark:border-cyan-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                required
              >
                <option value="">Choose a time...</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{formatTimeSlot(time)}</option>
                ))}
              </select>
            </div>
            {/* Reason for Visit */}
            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-cyan-200 mb-2">Reason for Visit</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g., General checkup, follow-up, specific symptoms"
                className="w-full px-4 py-3 border border-blue-200 dark:border-cyan-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                required
              />
            </div>
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-blue-700 dark:text-cyan-200 mb-2">Additional Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional information you'd like to share with the doctor..."
                className="w-full px-4 py-3 border border-blue-200 dark:border-cyan-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
              />
            </div>
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center shadow-lg transition"
              >
                {submitting ? (<><Loading size="small" color="white" /><span className="ml-2">Booking...</span></>) : ('Book Appointment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 