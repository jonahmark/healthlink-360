const mysql = require('mysql2');

// Create connection without specifying database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark'
});

// SQL commands to create database and tables
const setupCommands = [
  'CREATE DATABASE IF NOT EXISTS healthlink360',
  'USE healthlink360',
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'doctor', 'admin') DEFAULT 'user',
    subscription_status ENUM('inactive', 'active') DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    availability TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    doctor_id INT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
  )`,
  `CREATE TABLE IF NOT EXISTS symptoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    data TEXT NOT NULL,
    ai_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS lab_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    test_type VARCHAR(255) NOT NULL,
    address TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT NOT NULL,
    type VARCHAR(50),
    status ENUM('unread', 'read') DEFAULT 'unread',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`
];

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create database first
    await connection.promise().execute('CREATE DATABASE IF NOT EXISTS healthlink360');
    console.log('✓ Database created');
    
    // Switch to the database
    await connection.promise().query('USE healthlink360');
    console.log('✓ Switched to healthlink360 database');
    
    // Create tables (skip the first two commands)
    for (let i = 2; i < setupCommands.length; i++) {
      const command = setupCommands[i];
      await connection.promise().execute(command);
      console.log(`✓ Executed: ${command.split(' ')[0]} ${command.split(' ')[1]}`);
    }
    
    console.log('Database setup completed successfully!');
    connection.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    connection.end();
  }
}

setupDatabase(); 