// Script to add 'is_read' column to notifications table if missing
const pool = require('./config/db');

async function addIsReadColumn() {
  try {
    // Check if 'is_read' column exists
    const [columns] = await pool.query(`SHOW COLUMNS FROM notifications LIKE 'is_read'`);
    if (columns.length === 0) {
      // Add the column if it doesn't exist
      await pool.query(`ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE`);
      console.log("'is_read' column added to notifications table.");
    } else {
      console.log("'is_read' column already exists in notifications table.");
    }
  } catch (err) {
    console.error('Error updating notifications table:', err);
  } finally {
    pool.end();
  }
}

addIsReadColumn(); 