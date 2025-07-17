const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const labController = require('../controllers/labController');

// Public endpoints
router.get('/tests', labController.listLabTests);
router.get('/tests/:id', labController.getLabTest);

// User endpoints (authenticated)
router.post('/requests', authenticateToken, requireRole(['user', 'premium']), labController.createLabRequest);
router.get('/requests', authenticateToken, labController.getUserLabRequests);
router.get('/requests/:id', authenticateToken, labController.getLabRequest);

// Admin/Lab staff endpoints
router.put('/requests/:id', authenticateToken, requireRole(['admin']), labController.updateLabRequest);
router.get('/all-requests', authenticateToken, requireRole(['admin']), labController.getAllLabRequests);

module.exports = router; 