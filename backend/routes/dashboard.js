const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user; // set by authenticateToken
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  let dashboardData;
  switch (user.role) {
    case 'premium':
      dashboardData = { message: 'Welcome Premium User!', features: ['Book Doctor', 'Lab Tests', 'Insurance', 'Notifications'] };
      break;
    case 'doctor':
      dashboardData = { message: 'Welcome Doctor!', features: ['View Appointments', 'Manage Profile', 'Notifications'] };
      break;
    case 'admin':
      dashboardData = { message: 'Welcome Admin!', features: ['Manage Users', 'View All Bookings', 'System Stats'] };
      break;
    default:
      dashboardData = { message: 'Welcome!', features: [] };
  }
  res.json({ role: user.role, dashboard: dashboardData });
});

module.exports = router; 