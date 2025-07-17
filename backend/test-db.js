require('dotenv').config();
const db = require('./config/db');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Check if users table exists
    const [tables] = await db.execute('SHOW TABLES LIKE "users"');
    console.log('Users table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Show table structure
      const [columns] = await db.execute('DESCRIBE users');
      console.log('Users table structure:');
      console.log(columns);
    } else {
      console.log('Users table does not exist. Creating it...');
      
      // Create users table
      const createTableSQL = `
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role ENUM('user', 'doctor', 'admin') DEFAULT 'user',
          subscription_status ENUM('active', 'inactive') DEFAULT 'inactive',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      await db.execute(createTableSQL);
      console.log('Users table created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

testDatabase(); 