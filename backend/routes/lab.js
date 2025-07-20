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

// Log all incoming requests to /requests/batch
router.use('/requests/batch', (req, res, next) => {
  console.log('[DEBUG] Incoming', req.method, req.originalUrl);
  next();
});

// Batch create lab requests (public for debugging)
router.post('/requests/batch', labController.createBatchLabRequests);

// Temporary debug endpoints
router.get('/requests/batch-debug', (req, res) => {
  res.json({ message: 'Batch GET debug endpoint is reachable' });
});
router.post('/requests/batch-debug', (req, res) => {
  res.json({ message: 'Batch POST debug endpoint is reachable', body: req.body });
});

// Admin/Lab staff endpoints
router.put('/requests/:id', authenticateToken, requireRole(['admin']), labController.updateLabRequest);
router.get('/all-requests', authenticateToken, requireRole(['admin']), labController.getAllLabRequests);

module.exports = router; 