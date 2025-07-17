const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

// Create or update doctor profile (doctor or admin)
router.post('/', authenticateToken, requireRole(['doctor', 'admin']), doctorController.upsertDoctorProfile);

// List all doctors (public)
router.get('/', doctorController.listDoctors);

// Get a specific doctor profile (public)
router.get('/:id', doctorController.getDoctorProfile);

// Doctor dashboard stats (doctor only)
router.get('/me/dashboard-stats', authenticateToken, requireRole(['doctor']), doctorController.getDoctorDashboardStats);

// Doctor's appointments (doctor only)
router.get('/me/appointments', authenticateToken, requireRole(['doctor']), doctorController.getDoctorAppointments);

// Doctor's unique patients (doctor only)
router.get('/me/patients', authenticateToken, requireRole(['doctor']), doctorController.getDoctorPatients);

module.exports = router; 