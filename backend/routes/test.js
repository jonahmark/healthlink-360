const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Test database connection
router.get('/db', async (req, res) => {
  try {
    // Debug: Log environment variables
    console.log('Environment variables:', {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'undefined',
      DB_NAME: process.env.DB_NAME
    });
    
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ 
      message: 'Database connection successful!', 
      data: rows[0] 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      message: 'Database connection failed!', 
      error: error.message 
    });
  }
});

// Test route
router.get('/', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

module.exports = router; 