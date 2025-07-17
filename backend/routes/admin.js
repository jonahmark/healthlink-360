const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/db');

// Get admin dashboard statistics
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Get total users count
    const [usersResult] = await db.execute('SELECT COUNT(*) as count FROM users');
    const totalUsers = usersResult[0].count;

    // Get total doctors count
    const [doctorsResult] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "doctor"');
    const totalDoctors = doctorsResult[0].count;

    // Get total bookings count
    const [bookingsResult] = await db.execute('SELECT COUNT(*) as count FROM bookings');
    const totalBookings = bookingsResult[0].count;

    // Get total lab requests count
    const [labRequestsResult] = await db.execute('SELECT COUNT(*) as count FROM lab_requests');
    const totalLabRequests = labRequestsResult[0].count;

    // Get recent bookings (last 5)
    const [recentBookings] = await db.execute(`
      SELECT b.id, b.appointment_date, b.appointment_time, b.status,
             u.name as patient_name, d.name as doctor_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN doctors d ON b.doctor_id = d.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // Get recent lab requests (last 5)
    const [recentLabRequests] = await db.execute(`
      SELECT lr.id, lr.request_date, lr.status,
             u.name as patient_name, lt.name as test_name
      FROM lab_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN lab_tests lt ON lr.test_id = lt.id
      ORDER BY lr.created_at DESC
      LIMIT 5
    `);

    // Get user role distribution
    const [roleDistribution] = await db.execute(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    res.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalBookings,
        totalLabRequests
      },
      recentBookings,
      recentLabRequests,
      roleDistribution
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, name, email, phone, role, subscription_status, 
             COALESCE(status, 'active') as status, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'premium', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [result] = await db.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Deactivate user (admin only)
router.patch('/users/:id/deactivate', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // First check if user exists
    const [users] = await db.execute('SELECT id, role FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    // Prevent admin from deactivating themselves
    if (user.role === 'admin' && parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    // Update user status to inactive
    const [result] = await db.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['inactive', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
});

// Activate user (admin only)
router.patch('/users/:id/activate', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['active', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User activated successfully' });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Failed to activate user' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get all bookings (admin only)
router.get('/bookings', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [bookings] = await db.execute(`
      SELECT b.id, b.appointment_date, b.appointment_time, b.reason, b.status, b.created_at,
             u.name as patient_name, u.email as patient_email,
             d.name as doctor_name, d.specialty as doctor_specialty
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN doctors d ON b.doctor_id = d.id
      ORDER BY b.created_at DESC
    `);

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Approve appointment (admin only)
router.patch('/bookings/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['confirmed', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment approved successfully' });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'Failed to approve appointment' });
  }
});

// Cancel appointment (admin only)
router.patch('/bookings/:id/cancel', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
});

// Reschedule appointment (admin only)
router.patch('/bookings/:id/reschedule', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;
    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'New date and time required' });
    }
    const [result] = await db.execute(
      'UPDATE bookings SET appointment_date = ?, appointment_time = ?, status = ? WHERE id = ?',
      [appointment_date, appointment_time, 'rescheduled', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment rescheduled successfully' });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
});

// Get all lab requests (admin only)
router.get('/lab-requests', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [labRequests] = await db.execute(`
      SELECT lr.id, lr.request_date, lr.status, lr.created_at,
             u.name as patient_name, u.email as patient_email,
             lt.name as test_name, lt.price as test_price
      FROM lab_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN lab_tests lt ON lr.test_id = lt.id
      ORDER BY lr.created_at DESC
    `);

    res.json({ labRequests });
  } catch (error) {
    console.error('Error fetching lab requests:', error);
    res.status(500).json({ message: 'Failed to fetch lab requests' });
  }
});

// Approve lab request (admin only)
router.patch('/lab-requests/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE lab_requests SET status = ? WHERE id = ?',
      ['approved', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lab request not found' });
    }
    res.json({ message: 'Lab request approved successfully' });
  } catch (error) {
    console.error('Error approving lab request:', error);
    res.status(500).json({ message: 'Failed to approve lab request' });
  }
});

// Complete lab request (admin only)
router.patch('/lab-requests/:id/complete', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE lab_requests SET status = ? WHERE id = ?',
      ['completed', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lab request not found' });
    }
    res.json({ message: 'Lab request marked as completed' });
  } catch (error) {
    console.error('Error completing lab request:', error);
    res.status(500).json({ message: 'Failed to complete lab request' });
  }
});

// Reject lab request (admin only)
router.patch('/lab-requests/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE lab_requests SET status = ? WHERE id = ?',
      ['rejected', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lab request not found' });
    }
    res.json({ message: 'Lab request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting lab request:', error);
    res.status(500).json({ message: 'Failed to reject lab request' });
  }
});

// List all doctors (admin only)
router.get('/doctors', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [doctors] = await db.execute(`
      SELECT d.id, d.user_id, d.name, d.specialty, d.status, d.created_at, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json({ doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
});

// Approve doctor (admin only)
router.patch('/doctors/:id/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE doctors SET status = ? WHERE id = ?',
      ['approved', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor approved successfully' });
  } catch (error) {
    console.error('Error approving doctor:', error);
    res.status(500).json({ message: 'Failed to approve doctor' });
  }
});

// Reject doctor (admin only)
router.patch('/doctors/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE doctors SET status = ? WHERE id = ?',
      ['rejected', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor rejected successfully' });
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    res.status(500).json({ message: 'Failed to reject doctor' });
  }
});

// Deactivate doctor (admin only)
router.patch('/doctors/:id/deactivate', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE doctors SET status = ? WHERE id = ?',
      ['inactive', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating doctor:', error);
    res.status(500).json({ message: 'Failed to deactivate doctor' });
  }
});

// Activate doctor (admin only)
router.patch('/doctors/:id/activate', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      'UPDATE doctors SET status = ? WHERE id = ?',
      ['approved', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor activated successfully' });
  } catch (error) {
    console.error('Error activating doctor:', error);
    res.status(500).json({ message: 'Failed to activate doctor' });
  }
});

module.exports = router; 