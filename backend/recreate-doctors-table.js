const mysql = require('mysql2');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mark',
  database: 'healthlink360'
});

async function recreateDoctorsTable() {
  try {
    console.log('Recreating doctors table with correct structure...\n');

    // Check for foreign key constraints
    console.log('1. Checking for foreign key constraints...');
    const [constraints] = await connection.promise().query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'doctors' 
      AND REFERENCED_TABLE_SCHEMA = 'healthlink360'
    `);
    
    if (constraints.length > 0) {
      console.log('Found foreign key constraints:', constraints.map(c => `${c.TABLE_NAME}.${c.CONSTRAINT_NAME}`));
      
      // Drop foreign key constraints
      for (const constraint of constraints) {
        console.log(`Dropping constraint: ${constraint.CONSTRAINT_NAME} from ${constraint.TABLE_NAME}`);
        await connection.promise().query(`ALTER TABLE ${constraint.TABLE_NAME} DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
      }
      console.log('✓ Foreign key constraints dropped\n');
    } else {
      console.log('✓ No foreign key constraints found\n');
    }

    // Drop existing table
    console.log('2. Dropping existing doctors table...');
    await connection.promise().query('DROP TABLE IF EXISTS doctors');
    console.log('✓ Existing table dropped\n');

    // Create new table with correct structure
    console.log('3. Creating new doctors table...');
    const createTableSQL = `
      CREATE TABLE doctors (
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
    await connection.promise().query(createTableSQL);
    console.log('✓ New doctors table created successfully\n');

    // Show final table structure
    console.log('4. Final doctors table structure:');
    const [columns] = await connection.promise().query('DESCRIBE doctors');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    console.log('\n🎉 Doctors table recreated successfully!');

  } catch (error) {
    console.error('❌ Error recreating doctors table:', error.message);
  } finally {
    connection.end();
  }
}

// Run the recreation
recreateDoctorsTable(); 