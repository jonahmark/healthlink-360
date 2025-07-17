const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDoctorProfile() {
  console.log('Testing Doctor Profile Endpoints...\n');

  try {
    // 1. Register a doctor user
    console.log('1. Registering a doctor user...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Dr. Test',
        email: 'drtest4@example.com',
        password: 'password123',
        role: 'doctor'
      });
      console.log('✓ Doctor user registered successfully\n');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️ Doctor user already exists, continuing with login test...\n');
      } else {
        throw error;
      }
    }

    // 2. Login as doctor
    console.log('2. Logging in as doctor...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'drtest4@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✓ Login successful, got JWT token\n');

    // 3. Create doctor profile
    console.log('3. Creating doctor profile...');
    const profileData = {
      name: 'Dr. Test',
      specialty: 'Cardiology',
      bio: 'Experienced cardiologist.',
      experience_years: 10,
      education: 'MD, Cardiology',
      certifications: 'Board Certified',
      consultation_fee: 150.00,
      available_days: 'Mon,Tue,Wed',
      available_hours: '09:00-17:00'
    };
    console.log('Profile data being sent:', profileData);
    
    const profileRes = await axios.post(`${BASE_URL}/doctors`, profileData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✓ Doctor profile created/updated:', profileRes.data.message, '\n');

    // 4. List all doctors
    console.log('4. Listing all doctors...');
    const listRes = await axios.get(`${BASE_URL}/doctors`);
    console.log('✓ Doctors listed:', listRes.data.doctors.length);
    const doctorId = listRes.data.doctors[0]?.id;
    if (!doctorId) throw new Error('No doctor found in list');

    // 5. Get specific doctor profile
    console.log('5. Getting specific doctor profile...');
    const getRes = await axios.get(`${BASE_URL}/doctors/${doctorId}`);
    console.log('✓ Doctor profile retrieved:', getRes.data.doctor.name);

    console.log('\n🎉 All doctor profile tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testDoctorProfile(); 