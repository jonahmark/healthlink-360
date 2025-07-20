const axios = require('axios');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';

// Test users for different roles
const users = {
  user: { name: 'Test User', email: 'user@example.com', password: 'password123', phone: '+256111111111' },
  doctor: { name: 'Test Doctor', email: 'doctor@example.com', password: 'password123', phone: '+256222222222' },
  admin: { name: 'Test Admin', email: 'admin@example.com', password: 'password123', phone: '+256333333333' },
};

const results = [];

// DB config (should match backend/config/db.js)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'healthlink',
};

async function setAdminRoleDirectlyAndPrint() {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('UPDATE users SET role = ? WHERE email = ?', ['admin', users.admin.email]);
    results.push({ endpoint: 'set admin role (SQL)', status: 'OK', code: rows.affectedRows });
    // Fetch and print the admin user record after update
    const [adminRows] = await conn.execute('SELECT id, name, email, role FROM users WHERE email = ?', [users.admin.email]);
    if (adminRows.length > 0) {
      console.log('\n[ADMIN USER RECORD AFTER UPDATE]:', adminRows[0]);
    } else {
      console.log('\n[ADMIN USER RECORD AFTER UPDATE]: Not found');
    }
  } catch (e) {
    results.push({ endpoint: 'set admin role (SQL)', status: 'FAIL', error: e.message });
  } finally {
    if (conn) await conn.end();
  }
}

async function registerAndSetRole(role) {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, users[role]);
    results.push({ endpoint: `register (${role})`, status: 'OK', code: res.status });
    if (role === 'admin') {
      await setAdminRoleDirectlyAndPrint();
      // Wait a moment for DB update to propagate
      await new Promise(r => setTimeout(r, 1000));
    }
    return true;
  } catch (e) {
    results.push({ endpoint: `register (${role})`, status: 'FAIL', error: e.response?.data?.message || e.message });
    return false;
  }
}

async function login(role) {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, { email: users[role].email, password: users[role].password });
    if (role === 'admin') {
      console.log('\n[ADMIN JWT TOKEN]:', res.data.token);
      const decoded = jwt.decode(res.data.token);
      console.log('[ADMIN JWT PAYLOAD]:', decoded);
    }
    return res.data.token;
  } catch (e) {
    results.push({ endpoint: `login (${role})`, status: 'FAIL', error: e.response?.data?.message || e.message });
    return null;
  }
}

async function registerAndLoginAll() {
  const tokens = {};
  // Register and set admin role first
  await registerAndSetRole('admin');
  tokens.admin = await login('admin');
  // Register and login user
  await registerAndSetRole('user');
  tokens.user = await login('user');
  // Register and login doctor (role will be set via admin endpoint after admin is available)
  await registerAndSetRole('doctor');
  // Set doctor role via admin endpoint
  if (tokens.admin) {
    // Login as doctor to get user id
    let doctorId;
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, { email: users.doctor.email, password: users.doctor.password });
      doctorId = loginRes.data.user.id;
    } catch (e) {
      results.push({ endpoint: 'get id for doctor', status: 'FAIL', error: e.response?.data?.message || e.message });
    }
    if (doctorId) {
      try {
        await axios.put(`${API_BASE}/admin/users/${doctorId}/role`, { role: 'doctor' }, { headers: { Authorization: `Bearer ${tokens.admin}` } });
        results.push({ endpoint: 'set role (doctor)', status: 'OK' });
      } catch (e) {
        results.push({ endpoint: 'set role (doctor)', status: 'FAIL', error: e.response?.data?.message || e.message });
      }
    }
    tokens.doctor = await login('doctor');
  }
  return tokens;
}

async function testEndpoint({ method, url, data, token, expect = 200, label }) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios({ method, url: API_BASE + url, data, headers });
    const ok = res.status === expect || (Array.isArray(expect) && expect.includes(res.status));
    results.push({ endpoint: label || `${method.toUpperCase()} ${url}`, status: ok ? 'OK' : 'UNEXPECTED', code: res.status });
  } catch (e) {
    results.push({ endpoint: label || `${method.toUpperCase()} ${url}`, status: 'FAIL', code: e.response?.status, error: e.response?.data?.message || e.message });
  }
}

async function runTests() {
  // Register, set roles, and login all users in correct order
  const tokens = await registerAndLoginAll();

  // Public endpoints
  await testEndpoint({ method: 'get', url: '/doctors', label: 'List Doctors' });
  await testEndpoint({ method: 'get', url: '/lab/tests', label: 'List Lab Tests' });
  await testEndpoint({ method: 'get', url: '/test', label: 'Test Route' });
  await testEndpoint({ method: 'get', url: '/test/db', label: 'Test DB Connection' });

  // User endpoints
  if (tokens.user) {
    await testEndpoint({ method: 'get', url: '/dashboard', token: tokens.user, label: 'User Dashboard' });
    await testEndpoint({ method: 'get', url: '/patients/stats', token: tokens.user, label: 'Patient Stats' });
    await testEndpoint({ method: 'get', url: '/patients/appointments', token: tokens.user, label: 'Patient Appointments' });
    await testEndpoint({ method: 'get', url: '/patients/lab-requests', token: tokens.user, label: 'Patient Lab Requests' });
    await testEndpoint({ method: 'get', url: '/patients/health-records', token: tokens.user, label: 'Patient Health Records' });
    await testEndpoint({ method: 'get', url: '/notifications', token: tokens.user, label: 'User Notifications' });
    await testEndpoint({ method: 'get', url: '/notifications/unread-count', token: tokens.user, label: 'User Notification Count' });
    await testEndpoint({ method: 'get', url: '/lab/all-requests', token: tokens.user, expect: [401,403], label: 'All Lab Requests (User, should fail)' });
  }

  // Doctor endpoints
  if (tokens.doctor) {
    await testEndpoint({ method: 'get', url: '/dashboard', token: tokens.doctor, label: 'Doctor Dashboard' });
    await testEndpoint({ method: 'post', url: '/doctors', token: tokens.doctor, data: { name: 'Dr. Test', specialty: 'General' }, label: 'Upsert Doctor Profile' });
    await testEndpoint({ method: 'get', url: '/doctors', token: tokens.doctor, label: 'List Doctors (Doctor)' });
  }

  // Admin endpoints
  if (tokens.admin) {
    await testEndpoint({ method: 'get', url: '/dashboard', token: tokens.admin, label: 'Admin Dashboard' });
    await testEndpoint({ method: 'get', url: '/admin/stats', token: tokens.admin, label: 'Admin Stats' });
    await testEndpoint({ method: 'get', url: '/admin/users', token: tokens.admin, label: 'Admin Users' });
    await testEndpoint({ method: 'get', url: '/admin/bookings', token: tokens.admin, label: 'Admin Bookings' });
    await testEndpoint({ method: 'get', url: '/admin/lab-requests', token: tokens.admin, label: 'Admin Lab Requests' });
    await testEndpoint({ method: 'get', url: '/admin/doctors', token: tokens.admin, label: 'Admin Doctors' });
  }

  // Print results
  console.table(results);
}

runTests(); 