const mysql = require('mysql2');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark',
  database: 'healthlink360'
});

async function fixDoctorsTable() {
  try {
    console.log('Checking and fixing doctors table...\n');

    // Check current table structure
    console.log('1. Checking current doctors table structure...');
    const [columns] = await connection.promise().query('DESCRIBE doctors');
    console.log('Current columns:', columns.map(col => col.Field));
    
    // Check if user_id column exists
    const hasUserId = columns.some(col => col.Field === 'user_id');
    
    if (!hasUserId) {
      console.log('2. Adding missing user_id column...');
      await connection.promise().query('ALTER TABLE doctors ADD COLUMN user_id INT NOT NULL AFTER id');
      console.log('✓ user_id column added successfully\n');
      
      // Add foreign key constraint
      console.log('3. Adding foreign key constraint...');
      await connection.promise().query('ALTER TABLE doctors ADD CONSTRAINT fk_doctors_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      console.log('✓ Foreign key constraint added successfully\n');
    } else {
      console.log('✓ user_id column already exists\n');
    }

    // Update table structure to match controller expectations
    console.log('4. Updating table structure to match controller...');
    
    // Add missing columns
    const expectedColumns = [
      'bio TEXT',
      'experience_years INT',
      'education TEXT', 
      'certifications TEXT',
      'consultation_fee DECIMAL(10,2)',
      'available_days VARCHAR(100)',
      'available_hours VARCHAR(100)'
    ];

    for (const columnDef of expectedColumns) {
      const columnName = columnDef.split(' ')[0];
      const hasColumn = columns.some(col => col.Field === columnName);
      
      if (!hasColumn) {
        console.log(`Adding column: ${columnName}`);
        await connection.promise().query(`ALTER TABLE doctors ADD COLUMN ${columnDef}`);
      }
    }

    // Rename availability to bio if it exists and bio doesn't
    const hasAvailability = columns.some(col => col.Field === 'availability');
    const hasBio = columns.some(col => col.Field === 'bio');
    
    if (hasAvailability && !hasBio) {
      console.log('Renaming availability to bio...');
      await connection.promise().query('ALTER TABLE doctors CHANGE availability bio TEXT');
    }

    // Remove rating column if it exists (not needed for our use case)
    const hasRating = columns.some(col => col.Field === 'rating');
    if (hasRating) {
      console.log('Removing rating column...');
      await connection.promise().query('ALTER TABLE doctors DROP COLUMN rating');
    }

    console.log('✓ Table structure updated successfully\n');

    // Show final table structure
    console.log('5. Final doctors table structure:');
    const [finalColumns] = await connection.promise().query('DESCRIBE doctors');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\n🎉 Doctors table fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing doctors table:', error.message);
  } finally {
    connection.end();
  }
}

// Run the fix
fixDoctorsTable(); 