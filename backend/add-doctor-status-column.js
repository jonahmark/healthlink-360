const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark',
  database: 'healthlink360'
});

async function addDoctorStatusColumn() {
  try {
    console.log('Adding status column to doctors table...\n');

    // Check if status column exists
    const [columns] = await connection.promise().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'healthlink360' 
      AND TABLE_NAME = 'doctors' 
      AND COLUMN_NAME = 'status'
    `);

    if (columns.length === 0) {
      // Add status column
      await connection.promise().query(`
        ALTER TABLE doctors 
        ADD COLUMN status ENUM('pending', 'approved', 'rejected', 'inactive') NOT NULL DEFAULT 'pending'
      `);
      console.log('✓ Status column added successfully\n');
    } else {
      console.log('✓ Status column already exists\n');
    }

    // Update existing doctors to have 'approved' status if they don't have one
    await connection.promise().query(`
      UPDATE doctors 
      SET status = 'approved' 
      WHERE status IS NULL OR status = ''
    `);
    console.log('✓ Updated existing doctors with approved status\n');

    console.log('🎉 Database update completed successfully!');

  } catch (error) {
    console.error('❌ Database update failed:', error.message);
  } finally {
    connection.end();
  }
}

// Run the update
addDoctorStatusColumn(); 