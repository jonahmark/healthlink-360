const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });

// Debug: Log all environment variables on startup
console.log('All environment variables:', process.env);
// Debug: Log environment variables on startup
console.log('Environment variables loaded:', {
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'undefined',
  DB_NAME: process.env.DB_NAME
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json());

// Import routes
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const doctorsRoutes = require('./routes/doctors');
const bookingsRoutes = require('./routes/bookings');
const labRoutes = require('./routes/lab');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const patientsRoutes = require('./routes/patients');

// Routes
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientsRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('HealthLink 360 Backend API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});