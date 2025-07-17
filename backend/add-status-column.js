const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark',
  database: 'healthlink360'
});

async function addStatusColumn() {
  try {
    console.log('Adding status column to users table...\n');

    // Check if status column exists
    const [columns] = await connection.promise().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'healthlink360' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'status'
    `);

    if (columns.length === 0) {
      // Add status column
      await connection.promise().query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
      `);
      console.log('✓ Status column added successfully\n');
    } else {
      console.log('✓ Status column already exists\n');
    }

    // Update existing users to have 'active' status if they don't have one
    await connection.promise().query(`
      UPDATE users 
      SET status = 'active' 
      WHERE status IS NULL OR status = ''
    `);
    console.log('✓ Updated existing users with active status\n');

    console.log('🎉 Database update completed successfully!');

  } catch (error) {
    console.error('❌ Database update failed:', error.message);
  } finally {
    connection.end();
  }
}

// Run the update
addStatusColumn(); 