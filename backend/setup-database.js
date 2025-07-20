const mysql = require('mysql2');

// Create connection without specifying database first
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark'
});

async function setupDatabase() {
  try {
    console.log('Setting up HealthLink 360 database...\n');

    // Create database
    console.log('1. Creating database...');
    await connection.promise().query('CREATE DATABASE IF NOT EXISTS healthlink360');
    console.log('✓ Database created successfully\n');

    // Use the database
    console.log('2. Using database...');
    await connection.promise().query('USE healthlink360');
    console.log('✓ Database selected\n');

    // Create users table
    console.log('3. Creating users table...');
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        subscription_status VARCHAR(20) NOT NULL DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.promise().query(createUsersTable);
    console.log('✓ Users table created successfully\n');

    // Ensure role column is correct ENUM
    console.log('3b. Altering users.role column to ENUM...');
    await connection.promise().query(`ALTER TABLE users MODIFY COLUMN role ENUM('user', 'premium', 'doctor', 'admin') NOT NULL DEFAULT 'user'`);
    console.log('✓ users.role column altered to ENUM\n');

    // Create doctors table
    console.log('4. Creating doctors table...');
    const createDoctorsTable = `
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        specialty VARCHAR(100) NOT NULL,
        bio TEXT,
        experience_years INT,
        education TEXT,
        certifications TEXT,
        consultation_fee DECIMAL(10,2),
        available_days VARCHAR(100),
        available_hours VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await connection.promise().query(createDoctorsTable);
    console.log('✓ Doctors table created successfully\n');

    // Create bookings table
    console.log('5. Creating bookings table...');
    const createBookingsTable = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        reason TEXT,
        notes TEXT,
        status ENUM('confirmed', 'cancelled', 'completed', 'rescheduled') NOT NULL DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `;
    await connection.promise().query(createBookingsTable);
    console.log('✓ Bookings table created successfully\n');

    // Create lab_tests table
    console.log('6. Creating lab_tests table...');
    const createLabTestsTable = `
      CREATE TABLE IF NOT EXISTS lab_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50),
        preparation_instructions TEXT,
        turnaround_time VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.promise().query(createLabTestsTable);
    console.log('✓ Lab tests table created successfully\n');

    // Create lab_requests table
    console.log('7. Creating lab_requests table...');
    const createLabRequestsTable = `
      CREATE TABLE IF NOT EXISTS lab_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        test_id INT NOT NULL,
        status ENUM('pending', 'approved', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        request_date DATE NOT NULL,
        appointment_date DATE,
        appointment_time TIME,
        results TEXT,
        results_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE CASCADE
      )
    `;
    await connection.promise().query(createLabRequestsTable);
    console.log('✓ Lab requests table created successfully\n');

    // Insert sample lab tests
    console.log('8. Inserting sample lab tests...');
    const sampleTests = [
      ['Complete Blood Count (CBC)', 'Measures red blood cells, white blood cells, and platelets', 20000.00, 'Blood Test', 'Fast for 8-12 hours before test', '24-48 hours'],
      ['Comprehensive Metabolic Panel', 'Measures kidney function, liver function, and blood sugar', 35000.00, 'Blood Test', 'Fast for 8-12 hours before test', '24-48 hours'],
      ['Lipid Panel', 'Measures cholesterol and triglycerides', 25000.00, 'Blood Test', 'Fast for 12-14 hours before test', '24-48 hours'],
      ['Thyroid Function Test', 'Measures thyroid hormone levels', 30000.00, 'Blood Test', 'No special preparation required', '24-48 hours'],
      ['Urinalysis', 'Analyzes urine for various health indicators', 22000.00, 'Urine Test', 'Collect first morning urine', 'Same day'],
      ['X-Ray Chest', 'Chest X-ray for lung and heart evaluation', 50000.00, 'Imaging', 'No special preparation required', 'Same day'],
      ['ECG/EKG', 'Electrocardiogram for heart rhythm analysis', 40000.00, 'Cardiac Test', 'No special preparation required', 'Same day']
    ];

    for (const test of sampleTests) {
      await connection.promise().query(
        'INSERT INTO lab_tests (name, description, price, category, preparation_instructions, turnaround_time) VALUES (?, ?, ?, ?, ?, ?)',
        test
      );
    }
    console.log('✓ Sample lab tests inserted successfully\n');

    console.log('🎉 Database setup completed successfully!');
    console.log('\nTables created:');
    console.log('- users (for authentication and user profiles)');
    console.log('- doctors (for doctor profiles)');
    console.log('- bookings (for appointment bookings)');
    console.log('- lab_tests (for lab tests)');
    console.log('- lab_requests (for lab requests)');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  } finally {
    connection.end();
  }
}

// Run the setup
setupDatabase(); 