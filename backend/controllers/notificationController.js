const pool = require('../config/db');

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [user_id, title, message, type]
    );
    res.status(201).json({ id: result.insertId, user_id, title, message, type });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification', details: err.message });
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, unread_only = false } = req.query;
    // Sanitize and clamp limit/offset
    const safePage = Math.max(1, parseInt(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Cap at 100
    const offset = (safePage - 1) * safeLimit;
    let query = `SELECT * FROM notifications WHERE user_id = ?`;
    if (unread_only === 'true') {
      query += ' AND is_read = FALSE';
    }
    query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`;
    console.log('[DEBUG] Using pool.query for notifications. SQL:', query, 'userId:', userId);
    const [rows] = await pool.query(query, [userId]);
    res.json({ notifications: rows });
  } catch (err) {
    console.error('Get user notifications error:', err);
    res.status(500).json({ message: 'Failed to fetch notifications', details: err.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notification_id } = req.params;

    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [notification_id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ 
      message: 'All notifications marked as read',
      updated_count: result.affectedRows
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notification_id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notification_id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Get notification count (unread)
const getNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.execute(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ unread_count: result[0].unread_count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ error: 'Failed to get notification count' });
  }
};

// Get notification settings for a user
const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [settings] = await pool.execute(
      'SELECT * FROM notification_settings WHERE user_id = ?',
      [userId]
    );

    if (settings.length === 0) {
      // Create default settings if none exist
      await pool.execute(
        `INSERT INTO notification_settings 
         (user_id, email_notifications, push_notifications, appointment_reminders, 
          lab_results, payment_notifications, system_notifications) 
         VALUES (?, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)`,
        [userId]
      );

      const [newSettings] = await pool.execute(
        'SELECT * FROM notification_settings WHERE user_id = ?',
        [userId]
      );

      return res.json({ settings: newSettings[0] });
    }

    res.json({ settings: settings[0] });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to get notification settings' });
  }
};

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email_notifications,
      push_notifications,
      appointment_reminders,
      lab_results,
      payment_notifications,
      system_notifications
    } = req.body;

    // Check if settings exist
    const [existing] = await pool.execute(
      'SELECT id FROM notification_settings WHERE user_id = ?',
      [userId]
    );

    if (existing.length === 0) {
      // Create new settings
      await pool.execute(
        `INSERT INTO notification_settings 
         (user_id, email_notifications, push_notifications, appointment_reminders, 
          lab_results, payment_notifications, system_notifications) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, email_notifications, push_notifications, appointment_reminders, 
         lab_results, payment_notifications, system_notifications]
      );
    } else {
      // Update existing settings
      await pool.execute(
        `UPDATE notification_settings SET 
         email_notifications = ?, push_notifications = ?, appointment_reminders = ?,
         lab_results = ?, payment_notifications = ?, system_notifications = ?
         WHERE user_id = ?`,
        [email_notifications, push_notifications, appointment_reminders,
         lab_results, payment_notifications, system_notifications, userId]
      );
    }

    // Get updated settings
    const [updatedSettings] = await pool.execute(
      'SELECT * FROM notification_settings WHERE user_id = ?',
      [userId]
    );

    res.json({
      message: 'Notification settings updated successfully',
      settings: updatedSettings[0]
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
};

// Utility function to create system notifications (for internal use)
const createSystemNotification = async (userId, title, message, type = 'system') => {
  try {
    await pool.execute(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, title, message, type]
    );
  } catch (error) {
    console.error('Create system notification error:', error);
  }
};

// Create appointment reminder notification
const createAppointmentReminder = async (userId, appointmentDate, doctorName) => {
  try {
    const title = 'Appointment Reminder';
    const message = `Your appointment with ${doctorName} is scheduled for ${appointmentDate}. Please arrive 10 minutes early.`;
    
    await createSystemNotification(userId, title, message, 'reminder');
  } catch (error) {
    console.error('Create appointment reminder error:', error);
  }
};

// Create lab result notification
const createLabResultNotification = async (userId, testName) => {
  try {
    const title = 'Lab Results Available';
    const message = `Your lab results for ${testName} are now available. Please check your dashboard.`;
    
    await createSystemNotification(userId, title, message, 'lab_result');
  } catch (error) {
    console.error('Create lab result notification error:', error);
  }
};

// Create payment notification
const createPaymentNotification = async (userId, amount, description) => {
  try {
    const title = 'Payment Processed';
    const message = `Payment of $${amount} for ${description} has been processed successfully.`;
    
    await createSystemNotification(userId, title, message, 'payment');
  } catch (error) {
    console.error('Create payment notification error:', error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationCount,
  getNotificationSettings,
  updateNotificationSettings,
  createSystemNotification,
  createAppointmentReminder,
  createLabResultNotification,
  createPaymentNotification
}; 