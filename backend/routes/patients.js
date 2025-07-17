const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/db');

// Get patient dashboard statistics
router.get('/stats', authenticateToken, requireRole(['user', 'premium']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's appointments
    const [appointments] = await db.execute(`
      SELECT b.id, b.appointment_date, b.appointment_time, b.status, b.reason,
             d.name as doctor_name, d.specialty as doctor_specialty
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      WHERE b.user_id = ?
      ORDER BY b.appointment_date DESC
    `, [userId]);

    // Get user's lab requests
    const [labRequests] = await db.execute(`
      SELECT lr.id, lr.request_date, lr.status, lr.created_at,
             lt.name as test_name, lt.price as test_price
      FROM lab_requests lr
      JOIN lab_tests lt ON lr.test_id = lt.id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `, [userId]);

    // Get user's notifications
    const [notifications] = await db.execute(`
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    // Calculate stats
    const upcomingAppointments = appointments.filter(apt => 
      apt.status === 'confirmed' && new Date(apt.appointment_date) > new Date()
    ).length;

    const completedAppointments = appointments.filter(apt => 
      apt.status === 'completed'
    ).length;

    const labResults = labRequests.filter(lab => 
      lab.status === 'completed'
    ).length;

    // Calculate health score (this could be based on various factors)
    const healthScore = Math.min(100, Math.max(50, 
      50 + (completedAppointments * 5) + (labResults * 3)
    ));

    res.json({
      stats: {
        upcomingAppointments,
        completedAppointments,
        labResults,
        healthScore: Math.round(healthScore)
      },
      appointments,
      labRequests,
      notifications
    });

  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ message: 'Failed to fetch patient statistics' });
  }
});

// Get patient's appointments
router.get('/appointments', authenticateToken, requireRole(['user', 'premium']), async (req, res) => {
  try {
    const userId = req.user.id;

    const [appointments] = await db.execute(`
      SELECT b.id, b.appointment_date, b.appointment_time, b.reason, b.notes, b.status, b.created_at,
             d.name as doctor_name, d.specialty as doctor_specialty, d.consultation_fee
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      WHERE b.user_id = ?
      ORDER BY b.appointment_date DESC
    `, [userId]);

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Get patient's lab requests
router.get('/lab-requests', authenticateToken, requireRole(['user', 'premium']), async (req, res) => {
  try {
    const userId = req.user.id;

    const [labRequests] = await db.execute(`
      SELECT lr.id, lr.request_date, lr.status, lr.results, lr.results_date, lr.notes, lr.created_at,
             lt.name as test_name, lt.description as test_description, lt.price as test_price, lt.category
      FROM lab_requests lr
      JOIN lab_tests lt ON lr.test_id = lt.id
      WHERE lr.user_id = ?
      ORDER BY lr.created_at DESC
    `, [userId]);

    res.json({ labRequests });
  } catch (error) {
    console.error('Error fetching patient lab requests:', error);
    res.status(500).json({ message: 'Failed to fetch lab requests' });
  }
});

// Get patient's health records
router.get('/health-records', authenticateToken, requireRole(['user', 'premium']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user information
    const [users] = await db.execute(`
      SELECT id, name, email, phone, role, subscription_status, created_at
      FROM users
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get appointment history
    const [appointmentHistory] = await db.execute(`
      SELECT COUNT(*) as total_appointments,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
             SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_appointments
      FROM bookings
      WHERE user_id = ?
    `, [userId]);

    // Get lab test history
    const [labHistory] = await db.execute(`
      SELECT COUNT(*) as total_tests,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tests,
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tests
      FROM lab_requests
      WHERE user_id = ?
    `, [userId]);

    res.json({
      user,
      appointmentHistory: appointmentHistory[0],
      labHistory: labHistory[0]
    });

  } catch (error) {
    console.error('Error fetching patient health records:', error);
    res.status(500).json({ message: 'Failed to fetch health records' });
  }
});

// Cancel appointment
router.put('/appointments/:id/cancel', authenticateToken, requireRole(['user', 'premium']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if appointment belongs to user
    const [appointments] = await db.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Check if appointment can be cancelled (not completed or already cancelled)
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment cannot be cancelled' });
    }

    // Update appointment status
    await db.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );

    res.json({ message: 'Appointment cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
});

// Reschedule appointment
router.put('/appointments/:id/reschedule', authenticateToken, requireRole(['user', 'premium']), async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;
    const userId = req.user.id;

    // Check if appointment belongs to user
    const [appointments] = await db.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appointments[0];

    // Check if appointment can be rescheduled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment cannot be rescheduled' });
    }

    // Update appointment date and time
    await db.execute(
      'UPDATE bookings SET appointment_date = ?, appointment_time = ? WHERE id = ?',
      [appointment_date, appointment_time, id]
    );

    res.json({ message: 'Appointment rescheduled successfully' });

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
});

module.exports = router; 