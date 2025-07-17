const mysql = require('mysql2');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark',
  database: 'healthlink360'
});

async function recreateLabTables() {
  try {
    console.log('Recreating lab_requests table with correct structure...\n');

    // Drop existing table
    console.log('1. Dropping existing lab_requests table...');
    await connection.promise().query('DROP TABLE IF EXISTS lab_requests');
    console.log('✓ Existing table dropped\n');

    // Create new table with correct structure
    console.log('2. Creating new lab_requests table...');
    const createTableSQL = `
      CREATE TABLE lab_requests (
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
    await connection.promise().query(createTableSQL);
    console.log('✓ New lab_requests table created successfully\n');

    // Show final table structure
    console.log('3. Final lab_requests table structure:');
    const [columns] = await connection.promise().query('DESCRIBE lab_requests');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\n🎉 Lab_requests table recreated successfully!');

  } catch (error) {
    console.error('❌ Error recreating lab_requests table:', error.message);
  } finally {
    connection.end();
  }
}

// Run the recreation
recreateLabTables(); 