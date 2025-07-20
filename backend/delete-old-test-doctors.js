const mysql = require('mysql2/promise');

async function deleteOldTestDoctors() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mark',
    database: 'healthlink360',
  });

  // Find user IDs for test doctors
  const [rows] = await connection.execute(`
    SELECT u.id FROM users u
    JOIN doctors d ON d.user_id = u.id
    WHERE d.name IN ('Dr. Smith', 'Dr. Test', 'Doctor')
  `);
  if (rows.length === 0) {
    console.log('No old test doctors found.');
    await connection.end();
    return;
  }
  const userIds = rows.map(r => r.id);
  // Delete from doctors and users
  await connection.execute(`DELETE FROM doctors WHERE user_id IN (${userIds.join(',')})`);
  await connection.execute(`DELETE FROM users WHERE id IN (${userIds.join(',')})`);
  console.log(`Deleted ${userIds.length} old test doctors and their user accounts.`);
  await connection.end();
}

deleteOldTestDoctors(); 