const db = require('../config/db');
const { createLabResultNotification } = require('./notificationController');

// List all available lab tests
const listLabTests = async (req, res) => {
  try {
    const [tests] = await db.execute('SELECT * FROM lab_tests WHERE is_active = TRUE ORDER BY category, name');
    res.json({
      message: 'Lab tests retrieved successfully',
      tests
    });
  } catch (error) {
    console.error('List lab tests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get specific lab test details
const getLabTest = async (req, res) => {
  try {
    const { id } = req.params;
    const [tests] = await db.execute('SELECT * FROM lab_tests WHERE id = ? AND is_active = TRUE', [id]);
    
    if (tests.length === 0) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json({
      message: 'Lab test retrieved successfully',
      test: tests[0]
    });
  } catch (error) {
    console.error('Get lab test error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new lab test request
const createLabRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { test_id, request_date, appointment_date, appointment_time, notes } = req.body;

    console.log('Lab request creation - User ID:', userId);
    console.log('Lab request creation - Request body:', req.body);

    // Validate required fields
    if (!test_id || !request_date) {
      return res.status(400).json({ message: 'Test ID and request date are required' });
    }

    // Check if lab test exists and is active
    const [tests] = await db.execute('SELECT id, name, price FROM lab_tests WHERE id = ? AND is_active = TRUE', [test_id]);
    console.log('Lab test check result:', tests);
    if (tests.length === 0) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    // Create the lab request
    console.log('Creating lab request with params:', [userId, test_id, request_date, appointment_date || null, appointment_time || null, notes || null]);
    const [result] = await db.execute(
      'INSERT INTO lab_requests (user_id, test_id, request_date, appointment_date, appointment_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, test_id, request_date, appointment_date || null, appointment_time || null, notes || null]
    );
    console.log('Lab request created with ID:', result.insertId);

    // Get the created request with test details
    const [requests] = await db.execute(`
      SELECT lr.*, lt.name as test_name, lt.price, lt.category, lt.preparation_instructions
      FROM lab_requests lr 
      JOIN lab_tests lt ON lr.test_id = lt.id 
      WHERE lr.id = ?
    `, [result.insertId]);
    console.log('Retrieved lab request:', requests[0]);

    res.status(201).json({
      message: 'Lab test request created successfully',
      request: requests[0]
    });

  } catch (error) {
    console.error('Create lab request error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's lab requests
const getUserLabRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT lr.*, lt.name as test_name, lt.price, lt.category
      FROM lab_requests lr 
      JOIN lab_tests lt ON lr.test_id = lt.id 
      WHERE lr.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [requests] = await db.execute(query, params);

    res.json({
      message: 'Lab requests retrieved successfully',
      requests
    });

  } catch (error) {
    console.error('Get user lab requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get specific lab request
const getLabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [requests] = await db.execute(`
      SELECT lr.*, lt.name as test_name, lt.price, lt.category, lt.description, lt.preparation_instructions, lt.turnaround_time
      FROM lab_requests lr 
      JOIN lab_tests lt ON lr.test_id = lt.id 
      WHERE lr.id = ? AND lr.user_id = ?
    `, [id, userId]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    res.json({
      message: 'Lab request retrieved successfully',
      request: requests[0]
    });

  } catch (error) {
    console.error('Get lab request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update lab request status (Admin/Lab staff)
const updateLabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, results, results_date, notes } = req.body;

    // Check if request exists
    const [requests] = await db.execute('SELECT * FROM lab_requests WHERE id = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    // Update request
    const updateFields = [];
    const updateParams = [];

    if (status) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (results !== undefined) {
      updateFields.push('results = ?');
      updateParams.push(results);
    }

    if (results_date) {
      updateFields.push('results_date = ?');
      updateParams.push(results_date);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateParams.push(notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateParams.push(id);
    await db.execute(
      `UPDATE lab_requests SET ${updateFields.join(', ')} WHERE id = ?`,
      updateParams
    );

    // If results were added, create notification for the user
    if (results !== undefined && results.trim() !== '') {
      try {
        // Get the lab request details to find user_id and test name
        const [updatedRequest] = await db.execute(`
          SELECT lr.user_id, lt.name as test_name
          FROM lab_requests lr 
          JOIN lab_tests lt ON lr.test_id = lt.id 
          WHERE lr.id = ?
        `, [id]);
        
        if (updatedRequest.length > 0) {
          await createLabResultNotification(updatedRequest[0].user_id, updatedRequest[0].test_name);
        }
      } catch (notificationError) {
        console.error('Failed to create lab result notification:', notificationError);
        // Don't fail the update if notification fails
      }
    }

    res.json({ message: 'Lab request updated successfully' });

  } catch (error) {
    console.error('Update lab request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all lab requests (Admin/Lab staff)
const getAllLabRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT lr.*, lt.name as test_name, lt.category, u.name as patient_name, u.email as patient_email
      FROM lab_requests lr 
      JOIN lab_tests lt ON lr.test_id = lt.id 
      JOIN users u ON lr.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE lr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [requests] = await db.execute(query, params);

    res.json({
      message: 'All lab requests retrieved successfully',
      requests
    });

  } catch (error) {
    console.error('Get all lab requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  listLabTests,
  getLabTest,
  createLabRequest,
  getUserLabRequests,
  getLabRequest,
  updateLabRequest,
  getAllLabRequests
}; 