const axios = require('axios');
const mysql = require('mysql2/promise');

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

async function setAdminRoleDirectly() {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('UPDATE users SET role = ? WHERE email = ?', ['admin', users.admin.email]);
    results.push({ endpoint: 'set admin role (SQL)', status: 'OK', code: rows.affectedRows });
  } catch (e) {
    results.push({ endpoint: 'set admin role (SQL)', status: 'FAIL', error: e.message });
  } finally {
    if (conn) await conn.end();
  }
}

async function register(role) {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, users[role]);
    results.push({ endpoint: `register (${role})`, status: 'OK', code: res.status });
    // If admin, update role directly in DB and re-login for fresh token
    if (role === 'admin') {
      await setAdminRoleDirectly();
      // Wait a moment for DB update to propagate
      await new Promise(r => setTimeout(r, 200));
    }
    // If doctor, update via admin endpoint (after admin is set)
    if (role === 'doctor') {
      // Login as admin to get admin token
      let adminToken;
      try {
        const adminLogin = await axios.post(`${API_BASE}/auth/login`, { email: users.admin.email, password: users.admin.password });
        adminToken = adminLogin.data.token;
      } catch (e) {
        results.push({ endpoint: 'admin login for role update', status: 'SKIP', error: 'Admin not available yet' });
        return res.data.token;
      }
      // Get user id by logging in as the new user
      let userId;
      try {
        const loginRes = await axios.post(`${API_BASE}/auth/login`, { email: users[role].email, password: users[role].password });
        userId = loginRes.data.user.id;
      } catch (e) {
        results.push({ endpoint: `get id for ${role}`, status: 'FAIL', error: e.response?.data?.message || e.message });
        return res.data.token;
      }
      // Update role via admin endpoint
      try {
        await axios.put(`${API_BASE}/admin/users/${userId}/role`, { role }, { headers: { Authorization: `Bearer ${adminToken}` } });
        results.push({ endpoint: `set role (${role})`, status: 'OK' });
      } catch (e) {
        results.push({ endpoint: `set role (${role})`, status: 'FAIL', error: e.response?.data?.message || e.message });
      }
    }
    return res.data.token;
  } catch (e) {
    results.push({ endpoint: `register (${role})`, status: 'FAIL', error: e.response?.data?.message || e.message });
    return null;
  }
}

async function login(role) {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, { email: users[role].email, password: users[role].password });
    return res.data.token;
  } catch (e) {
    // If user not found, try to register then login again
    if (e.response?.data?.message === 'Invalid email or password' || e.response?.data?.message === 'User not found') {
      await register(role);
      try {
        const res2 = await axios.post(`${API_BASE}/auth/login`, { email: users[role].email, password: users[role].password });
        return res2.data.token;
      } catch (e2) {
        results.push({ endpoint: `login (${role})`, status: 'FAIL', error: e2.response?.data?.message || e2.message });
        return null;
      }
    } else {
      results.push({ endpoint: `login (${role})`, status: 'FAIL', error: e.response?.data?.message || e.message });
      return null;
    }
  }
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
  // Login as each role (auto-register if needed)
  const tokens = {};
  for (const role of Object.keys(users)) {
    tokens[role] = await login(role);
    // After admin role is set, re-login to get a fresh token with correct role
    if (role === 'admin') {
      tokens.admin = await login('admin');
    }
  }

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