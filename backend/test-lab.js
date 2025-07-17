const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testLabSystem() {
  console.log('Testing Lab Test Request System...\n');

  try {
    // Generate unique emails for this test run
    const timestamp = Date.now();
    const patientEmail = `patient_${timestamp}@example.com`;
    const adminEmail = `admin_${timestamp}@example.com`;

    // 1. Register a premium user
    console.log('1. Registering a premium user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Lab Test Patient',
      email: patientEmail,
      password: 'password123',
      role: 'premium'
    });
    console.log('✓ Premium user registered successfully\n');

    // 2. Register an admin user
    console.log('2. Registering an admin user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Lab Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin'
    });
    console.log('✓ Admin user registered successfully\n');

    // 3. Login as premium user
    console.log('3. Logging in as premium user...');
    const patientLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: patientEmail,
      password: 'password123'
    });
    const patientToken = patientLoginRes.data.token;
    console.log('✓ Premium user login successful\n');

    // 4. Login as admin
    console.log('4. Logging in as admin...');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: 'password123'
    });
    const adminToken = adminLoginRes.data.token;
    console.log('✓ Admin login successful\n');

    // 5. List available lab tests (public)
    console.log('5. Listing available lab tests...');
    const labTestsRes = await axios.get(`${BASE_URL}/lab/tests`);
    console.log(`✓ Found ${labTestsRes.data.tests.length} lab tests`);
    labTestsRes.data.tests.forEach(test => {
      console.log(`  - ${test.name}: $${test.price} (${test.category})`);
    });
    console.log('');

    // 6. Get specific lab test details
    console.log('6. Getting specific lab test details...');
    const testId = labTestsRes.data.tests[0].id;
    const testDetailsRes = await axios.get(`${BASE_URL}/lab/tests/${testId}`);
    console.log(`✓ Test details: ${testDetailsRes.data.test.name} - ${testDetailsRes.data.test.description}\n`);

    // 7. Create a lab test request (Premium user)
    console.log('7. Creating a lab test request...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const requestDate = tomorrow.toISOString().split('T')[0];

    const labRequestRes = await axios.post(`${BASE_URL}/lab/requests`, {
      test_id: testId,
      request_date: requestDate,
      appointment_date: requestDate,
      appointment_time: '10:00:00',
      notes: 'Regular health checkup'
    }, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log('✓ Lab test request created successfully');
    console.log(`  Request ID: ${labRequestRes.data.request.id}`);
    console.log(`  Test: ${labRequestRes.data.request.test_name}`);
    console.log(`  Status: ${labRequestRes.data.request.status}`);
    console.log(`  Price: $${labRequestRes.data.request.price}\n`);

    // 8. Get user's lab requests
    console.log('8. Getting user lab requests...');
    const userRequestsRes = await axios.get(`${BASE_URL}/lab/requests`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log(`✓ User has ${userRequestsRes.data.requests.length} lab request(s)`);
    userRequestsRes.data.requests.forEach(request => {
      console.log(`  - ${request.test_name} (${request.status}) - $${request.price}`);
    });
    console.log('');

    // 9. Get specific lab request details
    console.log('9. Getting specific lab request details...');
    const requestId = labRequestRes.data.request.id;
    const requestDetailsRes = await axios.get(`${BASE_URL}/lab/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log(`✓ Request details: ${requestDetailsRes.data.request.test_name}`);
    console.log(`  Preparation: ${requestDetailsRes.data.request.preparation_instructions}`);
    console.log(`  Turnaround: ${requestDetailsRes.data.request.turnaround_time}\n`);

    // 10. Admin: Get all lab requests
    console.log('10. Admin getting all lab requests...');
    const allRequestsRes = await axios.get(`${BASE_URL}/lab/all-requests`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Admin found ${allRequestsRes.data.requests.length} total lab request(s)`);
    allRequestsRes.data.requests.forEach(request => {
      console.log(`  - ${request.patient_name}: ${request.test_name} (${request.status})`);
    });
    console.log('');

    // 11. Admin: Update lab request status
    console.log('11. Admin updating lab request status...');
    await axios.put(`${BASE_URL}/lab/requests/${requestId}`, {
      status: 'approved',
      notes: 'Request approved, patient can proceed with test'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ Lab request status updated successfully\n');

    // 12. Admin: Add test results
    console.log('12. Admin adding test results...');
    const today = new Date().toISOString().split('T')[0];
    await axios.put(`${BASE_URL}/lab/requests/${requestId}`, {
      status: 'completed',
      results: 'All values within normal range. No abnormalities detected.',
      results_date: today,
      notes: 'Test completed successfully'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ Test results added successfully\n');

    // 13. User: Check updated request
    console.log('13. User checking updated request...');
    const updatedRequestRes = await axios.get(`${BASE_URL}/lab/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log(`✓ Updated status: ${updatedRequestRes.data.request.status}`);
    console.log(`✓ Results: ${updatedRequestRes.data.request.results}`);
    console.log(`✓ Results date: ${updatedRequestRes.data.request.results_date}\n`);

    console.log('🎉 All lab test system tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Run the test
testLabSystem(); 