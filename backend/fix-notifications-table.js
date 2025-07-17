// Script to check and fix the notifications table schema
const pool = require('./config/db');

const requiredColumns = [
  { name: 'is_read', type: 'BOOLEAN', default: 'DEFAULT FALSE' },
  { name: 'created_at', type: 'DATETIME', default: 'DEFAULT CURRENT_TIMESTAMP' },
  { name: 'title', type: 'VARCHAR(255)', default: '' },
  { name: 'message', type: 'TEXT', default: '' },
  { name: 'type', type: 'VARCHAR(50)', default: '' },
];

async function checkAndFixTable() {
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM notifications`);
    const columnNames = columns.map(col => col.Field);
    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        let alterSql = `ALTER TABLE notifications ADD COLUMN ${col.name} ${col.type}`;
        if (col.default) alterSql += ` ${col.default}`;
        if (col.name === 'created_at') alterSql += ' AFTER id';
        await pool.query(alterSql);
        console.log(`Added missing column: ${col.name}`);
      } else {
        console.log(`Column exists: ${col.name}`);
      }
    }
    console.log('Notifications table schema check complete.');
  } catch (err) {
    console.error('Error checking/fixing notifications table:', err);
  } finally {
    pool.end();
  }
}

checkAndFixTable(); 