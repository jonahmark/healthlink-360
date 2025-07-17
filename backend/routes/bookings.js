const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// Create a new booking (Users and Premium users)
router.post('/', authenticateToken, requireRole(['user', 'premium']), bookingController.createBooking);

// Get user's bookings (authenticated users)
router.get('/', authenticateToken, bookingController.getUserBookings);

// Get specific booking (authenticated users)
router.get('/:id', authenticateToken, bookingController.getBooking);

// Update booking status (authenticated users)
router.put('/:id', authenticateToken, bookingController.updateBooking);

// Get doctor's bookings (doctors only)
router.get('/doctor/:doctorId', authenticateToken, requireRole(['doctor']), bookingController.getDoctorBookings);

module.exports = router; 