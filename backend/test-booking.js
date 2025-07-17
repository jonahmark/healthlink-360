const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBookingSystem() {
  console.log('Testing Booking System...\n');

  try {
    // Generate unique emails for this test run
    const timestamp = Date.now();
    const patientEmail = `patient_${timestamp}@example.com`;
    const doctorEmail = `drsmith_${timestamp}@example.com`;

    // 1. Register a premium user
    console.log('1. Registering a premium user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Premium Patient',
      email: patientEmail,
      password: 'password123',
      role: 'premium'
    });
    console.log('✓ Premium user registered successfully\n');

    // 2. Login as premium user
    console.log('2. Logging in as premium user...');
    const patientLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: patientEmail,
      password: 'password123'
    });
    const patientToken = patientLoginRes.data.token;
    console.log('✓ Premium user login successful\n');

    // 3. Register a doctor (if not exists)
    console.log('3. Registering a doctor...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Dr. Smith',
        email: doctorEmail,
        password: 'password123',
        role: 'doctor'
      });
      console.log('✓ Doctor registered successfully\n');
    } catch (error) {
      if (error.response?.data?.message === 'User with this email already exists') {
        console.log('✓ Doctor already exists\n');
      } else {
        throw error;
      }
    }

    // 4. Login as doctor
    console.log('4. Logging in as doctor...');
    const doctorLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: doctorEmail,
      password: 'password123'
    });
    const doctorToken = doctorLoginRes.data.token;
    const doctorUserId = doctorLoginRes.data.user.id;
    console.log('✓ Doctor login successful\n');

    // 5. Create doctor profile
    console.log('5. Creating doctor profile...');
    await axios.post(`${BASE_URL}/doctors`, {
      name: 'Dr. Smith',
      specialty: 'General Medicine',
      bio: 'Experienced general practitioner.',
      experience_years: 15,
      education: 'MD, General Medicine',
      certifications: 'Board Certified',
      consultation_fee: 100,
      available_days: 'Mon,Tue,Wed,Thu,Fri',
      available_hours: '09:00-17:00'
    }, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log('✓ Doctor profile created\n');

    // 6. Get doctor ID
    console.log('6. Getting doctor ID...');
    const doctorsRes = await axios.get(`${BASE_URL}/doctors`);
    // Find the doctor profile for the authenticated doctor
    const doctorProfile = doctorsRes.data.doctors.find(d => d.user_id === doctorUserId);
    if (!doctorProfile) throw new Error('Doctor profile not found for authenticated doctor');
    const doctorId = doctorProfile.id;
    console.log(`✓ Doctor ID: ${doctorId}\n`);

    // 6b. Get doctor's own profile to get the correct doctor ID for bookings
    console.log('6b. Getting doctor profile for bookings...');
    const doctorProfileRes = await axios.get(`${BASE_URL}/doctors/${doctorId}`);
    console.log(`✓ Doctor User ID: ${doctorUserId}\n`);

    // 6c. Get the doctor's own doctor ID (the one matching their user_id)
    console.log('6c. Getting doctor\'s own doctor ID...');
    const doctorsListRes = await axios.get(`${BASE_URL}/doctors`);
    const doctorOwnId = doctorsListRes.data.doctors.find(d => d.user_id === doctorUserId).id;
    console.log(`✓ Doctor's own ID: ${doctorOwnId}\n`);

    // 7. Create a booking (Premium user booking with doctor)
    console.log('7. Creating a booking...');
    const now = new Date();
    const appointmentHour = (now.getHours() + Math.floor(Math.random() * 6) + 9) % 24; // random hour between 9 and 15
    const appointmentTime = `${appointmentHour.toString().padStart(2, '0')}:00:00`;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

    const bookingRes = await axios.post(`${BASE_URL}/bookings`, {
      doctor_id: doctorOwnId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      reason: 'Regular checkup',
      notes: 'First appointment'
    }, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log('✓ Booking created successfully');
    console.log(`  Booking ID: ${bookingRes.data.booking.id}`);
    console.log(`  Doctor: ${bookingRes.data.booking.doctor_name}`);
    console.log(`  Date: ${bookingRes.data.booking.appointment_date}`);
    console.log(`  Time: ${bookingRes.data.booking.appointment_time}\n`);

    // 8. Get user's bookings
    console.log('8. Getting user bookings...');
    const userBookingsRes = await axios.get(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log(`✓ User has ${userBookingsRes.data.bookings.length} booking(s)`);
    userBookingsRes.data.bookings.forEach(booking => {
      console.log(`  - ${booking.doctor_name} on ${booking.appointment_date} at ${booking.appointment_time} (${booking.status})`);
    });
    console.log('');

    // 9. Get specific booking
    console.log('9. Getting specific booking details...');
    const bookingId = bookingRes.data.booking.id;
    const specificBookingRes = await axios.get(`${BASE_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log(`✓ Booking details retrieved: ${specificBookingRes.data.booking.reason}\n`);

    // 10. Get doctor's bookings
    console.log('10. Getting doctor bookings...');
    const doctorBookingsRes = await axios.get(`${BASE_URL}/bookings/doctor/${doctorId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log(`✓ Doctor has ${doctorBookingsRes.data.bookings.length} booking(s)`);
    doctorBookingsRes.data.bookings.forEach(booking => {
      console.log(`  - Patient: ${booking.patient_name} on ${booking.appointment_date} at ${booking.appointment_time} (${booking.status})`);
    });
    console.log('');

    // 11. Update booking status
    console.log('11. Updating booking status...');
    await axios.put(`${BASE_URL}/bookings/${bookingId}`, {
      notes: 'Updated notes for the appointment'
    }, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log('✓ Booking updated successfully\n');

    console.log('🎉 All booking system tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Run the test
testBookingSystem(); 