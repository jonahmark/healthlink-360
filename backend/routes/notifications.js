const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Get user notifications
router.get('/', authenticateToken, notificationController.getUserNotifications);

// Get notification settings
router.get('/settings', authenticateToken, notificationController.getNotificationSettings);

// Update notification settings
router.put('/settings', authenticateToken, notificationController.updateNotificationSettings);

// Mark notification as read
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

// Get unread count
router.get('/unread-count', authenticateToken, notificationController.getNotificationCount);

// Create a new notification
router.post('/', authenticateToken, notificationController.createNotification);

module.exports = router; 