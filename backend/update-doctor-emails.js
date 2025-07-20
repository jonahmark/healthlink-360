const mysql = require('mysql2/promise');

async function updateDoctorEmails() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mark',
    database: 'healthlink360',
  });

  // Update emails for all users with @example.com to @gmail.com
  const [result] = await connection.execute(`
    UPDATE users SET email = REPLACE(email, '@example.com', '@gmail.com') WHERE email LIKE '%@example.com'
  `);
  console.log(`Updated ${result.affectedRows} doctor emails from @example.com to @gmail.com.`);
  await connection.end();
}

updateDoctorEmails(); 