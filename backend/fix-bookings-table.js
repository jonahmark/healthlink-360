const mysql = require('mysql2');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark',
  database: 'healthlink360'
});

async function fixBookingsTable() {
  try {
    console.log('Checking and fixing bookings table...\n');

    // Check current table structure
    console.log('1. Checking current bookings table structure...');
    const [columns] = await connection.promise().query('DESCRIBE bookings');
    console.log('Current columns:', columns.map(col => col.Field));
    
    // Check for missing columns
    const expectedColumns = [
      'reason TEXT',
      'notes TEXT'
    ];

    for (const columnDef of expectedColumns) {
      const columnName = columnDef.split(' ')[0];
      const hasColumn = columns.some(col => col.Field === columnName);
      
      if (!hasColumn) {
        console.log(`2. Adding missing column: ${columnName}`);
        await connection.promise().query(`ALTER TABLE bookings ADD COLUMN ${columnDef}`);
        console.log(`✓ ${columnName} column added successfully`);
      } else {
        console.log(`✓ ${columnName} column already exists`);
      }
    }

    // Remove symptoms column if it exists
    const hasSymptoms = columns.some(col => col.Field === 'symptoms');
    if (hasSymptoms) {
      console.log('3. Removing symptoms column...');
      await connection.promise().query('ALTER TABLE bookings DROP COLUMN symptoms');
      console.log('✓ symptoms column removed');
    }

    // Fix status enum to match controller expectations
    console.log('4. Fixing status enum...');
    await connection.promise().query(`ALTER TABLE bookings MODIFY COLUMN status ENUM('confirmed', 'cancelled', 'completed', 'rescheduled') NOT NULL DEFAULT 'confirmed'`);
    console.log('✓ status enum updated');

    // Show final table structure
    console.log('\n5. Final bookings table structure:');
    const [finalColumns] = await connection.promise().query('DESCRIBE bookings');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\n🎉 Bookings table fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing bookings table:', error.message);
  } finally {
    connection.end();
  }
}

// Run the fix
fixBookingsTable(); 