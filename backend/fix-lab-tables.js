const mysql = require('mysql2');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark',
  database: 'healthlink360'
});

async function fixLabTables() {
  try {
    console.log('Checking and fixing lab tables...\n');

    // Check current lab_requests table structure
    console.log('1. Checking current lab_requests table structure...');
    const [columns] = await connection.promise().query('DESCRIBE lab_requests');
    console.log('Current columns:', columns.map(col => col.Field));
    
    // Check if test_id column exists
    const hasTestId = columns.some(col => col.Field === 'test_id');
    
    if (!hasTestId) {
      console.log('2. Adding missing test_id column...');
      await connection.promise().query('ALTER TABLE lab_requests ADD COLUMN test_id INT NOT NULL AFTER user_id');
      console.log('✓ test_id column added successfully\n');
      
      // Add foreign key constraint
      console.log('3. Adding foreign key constraint...');
      await connection.promise().query('ALTER TABLE lab_requests ADD CONSTRAINT fk_lab_requests_test_id FOREIGN KEY (test_id) REFERENCES lab_tests(id) ON DELETE CASCADE');
      console.log('✓ Foreign key constraint added successfully\n');
    } else {
      console.log('✓ test_id column already exists\n');
    }

    // Show final table structure
    console.log('4. Final lab_requests table structure:');
    const [finalColumns] = await connection.promise().query('DESCRIBE lab_requests');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\n🎉 Lab tables fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing lab tables:', error.message);
  } finally {
    connection.end();
  }
}

// Run the fix
fixLabTables(); 