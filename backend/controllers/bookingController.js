const db = require('../config/db');
const { createAppointmentReminder } = require('./notificationController');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctor_id, appointment_date, appointment_time, reason, notes } = req.body;

    console.log('Booking creation - User ID:', userId);
    console.log('Booking creation - Request body:', req.body);

    // Validate required fields
    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ message: 'Doctor ID, appointment date and time are required' });
    }

    // Check if doctor exists
    const [doctor] = await db.execute('SELECT id, name FROM doctors WHERE id = ?', [doctor_id]);
    console.log('Doctor check result:', doctor);
    if (doctor.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the time slot is available
    const appointmentDateTime = `${appointment_date} ${appointment_time}`;
    const [existingBookings] = await db.execute(
      'SELECT id FROM bookings WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != "cancelled"',
      [doctor_id, appointment_date, appointment_time]
    );
    console.log('Existing bookings check:', existingBookings);

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create the booking
    console.log('Creating booking with params:', [userId, doctor_id, appointment_date, appointment_time, reason || null, notes || null, 'confirmed']);
    const [result] = await db.execute(
      'INSERT INTO bookings (user_id, doctor_id, appointment_date, appointment_time, reason, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, doctor_id, appointment_date, appointment_time, reason || null, notes || null, 'confirmed']
    );
    console.log('Booking created with ID:', result.insertId);

    // Get the created booking with doctor details
    const [booking] = await db.execute(`
      SELECT b.*, d.name as doctor_name, d.specialty 
      FROM bookings b 
      JOIN doctors d ON b.doctor_id = d.id 
      WHERE b.id = ?
    `, [result.insertId]);
    console.log('Retrieved booking:', booking[0]);

    // Create appointment reminder notification
    try {
      await createAppointmentReminder(userId, appointment_date, booking[0].doctor_name);
    } catch (notificationError) {
      console.error('Failed to create appointment notification:', notificationError);
      // Don't fail the booking if notification fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: booking[0]
    });

  } catch (error) {
    console.error('Booking creation error details:', {
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

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT b.*, d.name as doctor_name, d.specialty, d.consultation_fee
      FROM bookings b 
      JOIN doctors d ON b.doctor_id = d.id 
      WHERE b.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.appointment_date DESC, b.appointment_time ASC';

    const [bookings] = await db.execute(query, params);

    res.json({
      message: 'Bookings retrieved successfully',
      bookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get specific booking
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [booking] = await db.execute(`
      SELECT b.*, d.name as doctor_name, d.specialty, d.consultation_fee, d.bio
      FROM bookings b 
      JOIN doctors d ON b.doctor_id = d.id 
      WHERE b.id = ? AND b.user_id = ?
    `, [id, userId]);

    if (booking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      message: 'Booking retrieved successfully',
      booking: booking[0]
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update booking status
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, notes } = req.body;

    // Check if booking exists and belongs to user
    const [booking] = await db.execute('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
    if (booking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking
    const updateFields = [];
    const updateParams = [];

    if (status) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateParams.push(notes);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateParams.push(id, userId);
    await db.execute(
      `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateParams
    );

    res.json({ message: 'Booking updated successfully' });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get doctor's bookings (for doctors)
const getDoctorBookings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userId = req.user.id;

    // Verify the user is the doctor by checking if they have a doctor profile with this ID
    const [doctor] = await db.execute('SELECT id FROM doctors WHERE id = ? AND user_id = ?', [doctorId, userId]);
    if (doctor.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [bookings] = await db.execute(`
      SELECT b.*, u.name as patient_name, u.email as patient_email
      FROM bookings b 
      JOIN users u ON b.user_id = u.id 
      WHERE b.doctor_id = ?
      ORDER BY b.appointment_date ASC, b.appointment_time ASC
    `, [doctorId]);

    res.json({
      message: 'Doctor bookings retrieved successfully',
      bookings
    });

  } catch (error) {
    console.error('Get doctor bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  getDoctorBookings
}; 