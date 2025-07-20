const mysql = require('mysql2/promise');

async function listDoctors() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mark',
    database: 'healthlink360',
  });

  const [rows] = await connection.execute(`
    SELECT d.id, d.name, d.specialty, u.email
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    ORDER BY d.id
  `);

  if (rows.length === 0) {
    console.log('No doctors found in the database.');
  } else {
    console.log('Doctors in the database:');
    rows.forEach(doc => {
      console.log(`- ID: ${doc.id}, Name: ${doc.name}, Specialty: ${doc.specialty}, Email: ${doc.email}`);
    });
  }
  await connection.end();
}

listDoctors(); 