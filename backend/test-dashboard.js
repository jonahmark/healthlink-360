const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDashboard() {
  console.log('Testing Dashboard Endpoint...\n');

  try {
    // First, register a premium user
    console.log('1. Registering a premium user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Dashboard Test User',
      email: 'dashboard@example.com',
      password: 'password123',
      role: 'premium'
    });
    console.log('✓ Premium user registered successfully\n');

    // Login to get token
    console.log('2. Logging in to get JWT token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'dashboard@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('✓ Login successful, got JWT token\n');

    // Test dashboard endpoint
    console.log('3. Testing Dashboard Endpoint...');
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✓ Dashboard endpoint working!');
    console.log('Response:', JSON.stringify(dashboardResponse.data, null, 2));
    console.log('\n🎉 Dashboard test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDashboard(); 