const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('Testing Authentication System...\n');

    // Test 1: Register a new user
    console.log('1. Testing User Registration...');
    const registerData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+256123456789'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✓ Registration successful:', registerResponse.data.message);
      console.log('User ID:', registerResponse.data.user.id);
      console.log('Token received:', registerResponse.data.token ? 'Yes' : 'No');
    } catch (error) {
      if (error.response?.data?.message === 'User with this email already exists') {
        console.log('⚠️ User already exists, continuing with login test...');
      } else {
        console.error('Registration error:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        }
        throw error;
      }
    }
    console.log('');

    // Test 2: Login with the registered user
    console.log('2. Testing User Login...');
    const loginData = {
      email: 'john@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✓ Login successful:', loginResponse.data.message);
    console.log('User role:', loginResponse.data.user.role);
    console.log('Subscription status:', loginResponse.data.user.subscription_status);
    console.log('');

    // Test 3: Get user profile (protected route)
    console.log('3. Testing Protected Route - Get Profile...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Profile retrieved successfully');
    console.log('User name:', profileResponse.data.user.name);
    console.log('User email:', profileResponse.data.user.email);
    console.log('');

    // Test 4: Update user profile
    console.log('4. Testing Profile Update...');
    const updateData = {
      name: 'John Smith',
      phone: '+256987654321'
    };

    const updateResponse = await axios.put(`${API_BASE}/auth/profile`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Profile updated successfully:', updateResponse.data.message);
    console.log('');

    console.log('🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth(); 