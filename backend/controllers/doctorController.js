const db = require('../config/db');

// Create or update doctor profile
const upsertDoctorProfile = async (req, res) => {
  console.log('upsertDoctorProfile called', req.method, req.user && req.user.id, req.body);
  try {
    const userId = req.user.id;
    const { name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours } = req.body;

    console.log('Doctor profile creation - User ID:', userId);
    console.log('Doctor profile creation - Request body:', req.body);

    // Check if doctor profile exists
    const [existing] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    console.log('Existing doctor profiles:', existing.length);
    
    if (existing.length > 0) {
      // Update
      console.log('Updating existing doctor profile...');
      await db.execute(
        `UPDATE doctors SET name=?, specialty=?, bio=?, experience_years=?, education=?, certifications=?, consultation_fee=?, available_days=?, available_hours=? WHERE user_id=?`,
        [name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours, userId]
      );
      return res.json({ message: 'Doctor profile updated successfully' });
    } else {
      // Create
      console.log('Creating new doctor profile...');
      await db.execute(
        `INSERT INTO doctors (user_id, name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours]
      );
      return res.status(201).json({ message: 'Doctor profile created successfully' });
    }
  } catch (error) {
    console.error('RAW ERROR:', error);
    console.error('Doctor profile upsert error details:', {
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

// List all doctors
const listDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute('SELECT id, user_id, name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours FROM doctors');
    res.json({ doctors });
  } catch (error) {
    console.error('List doctors error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a specific doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const [doctors] = await db.execute('SELECT id, user_id, name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ doctor: doctors[0] });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper: Ensure doctor profile exists for user
async function ensureDoctorProfile(userId) {
  const dbUser = await db.execute('SELECT id, role FROM users WHERE id = ?', [userId]);
  if (dbUser[0].length === 0) {
    console.error('User not found for doctor profile creation:', userId);
    return;
  }
  const user = dbUser[0][0];
  if (user.role !== 'doctor') {
    // Force role to doctor
    await db.execute('UPDATE users SET role = ? WHERE id = ?', ['doctor', userId]);
    console.log('User role updated to doctor for user:', userId);
  }
  const [existing] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
  if (existing.length === 0) {
    try {
      await db.execute(
        `INSERT INTO doctors (user_id, name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'Doctor', 'General', '', 0, '', '', 0, '', '']
      );
      console.log('Doctor profile created for user:', userId);
    } catch (err) {
      console.error('Failed to create doctor profile for user:', userId, err);
    }
  }
}

// Get doctor dashboard stats
const getDoctorDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureDoctorProfile(userId);
    // Get doctor id from user id
    const [doctorRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    const doctorId = doctorRows[0].id;

    // Today's appointments
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const [todaysAppointments] = await db.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE doctor_id = ? AND appointment_date = ? AND status IN ("confirmed", "pending")',
      [doctorId, todayStr]
    );

    // Total unique patients
    const [uniquePatients] = await db.execute(
      'SELECT COUNT(DISTINCT user_id) as count FROM bookings WHERE doctor_id = ?',
      [doctorId]
    );

    // Pending reports (appointments not completed)
    const [pendingReports] = await db.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE doctor_id = ? AND status IN ("pending", "confirmed")',
      [doctorId]
    );

    res.json({
      todaysAppointments: todaysAppointments[0].count,
      totalPatients: uniquePatients[0].count,
      pendingReports: pendingReports[0].count
    });
  } catch (error) {
    console.error('Doctor dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch doctor dashboard stats' });
  }
};

// Get all appointments for the logged-in doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureDoctorProfile(userId);
    const [doctorRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    const doctorId = doctorRows[0].id;
    const [appointments] = await db.execute(
      `SELECT b.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.doctor_id = ?
       ORDER BY b.appointment_date DESC, b.appointment_time DESC`,
      [doctorId]
    );
    res.json({ appointments });
  } catch (error) {
    console.error('Doctor appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch doctor appointments' });
  }
};

// Get all unique patients for the logged-in doctor
const getDoctorPatients = async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureDoctorProfile(userId);
    const [doctorRows] = await db.execute('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    const doctorId = doctorRows[0].id;
    const [patients] = await db.execute(
      `SELECT DISTINCT u.id, u.name, u.email, u.phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.doctor_id = ?`,
      [doctorId]
    );
    res.json({ patients });
  } catch (error) {
    console.error('Doctor patients error:', error);
    res.status(500).json({ message: 'Failed to fetch doctor patients' });
  }
};

module.exports = {
  upsertDoctorProfile,
  listDoctors,
  getDoctorProfile,
  getDoctorDashboardStats,
  getDoctorAppointments,
  getDoctorPatients
}; 