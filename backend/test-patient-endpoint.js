const axios = require('axios');

// Test the patient stats endpoint
async function testPatientEndpoint() {
  try {
    console.log('Testing patient stats endpoint...');
    
    // First, let's try to register a test user
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Patient',
      email: 'testpatient@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'user'
    });
    
    console.log('Registration response:', registerResponse.data);
    
    const token = registerResponse.data.token;
    
    // Now test the patient stats endpoint
    const statsResponse = await axios.get('http://localhost:5000/api/patients/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Patient stats response:', statsResponse.data);
    
  } catch (error) {
    console.error('Error testing patient endpoint:', error.response?.data || error.message);
  }
}

testPatientEndpoint(); 