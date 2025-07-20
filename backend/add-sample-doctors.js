const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const doctors = [
  {
    name: 'Dr. Grace Namaganda',
    specialty: 'Cardiologist',
    bio: '15+ years of experience in interventional cardiology. Passionate about heart health and patient education.',
    email: 'grace.namaganda@example.com',
  },
  {
    name: 'Dr. Samuel Okello',
    specialty: 'Pediatrician',
    bio: '10+ years of experience in child healthcare. Dedicated to improving children’s lives in Uganda.',
    email: 'samuel.okello@example.com',
  },
  {
    name: 'Dr. Aisha Nansubuga',
    specialty: 'General Practitioner',
    bio: '8+ years of experience in family medicine. Focused on holistic and preventive care.',
    email: 'aisha.nansubuga@example.com',
  },
  {
    name: 'Dr. John Ssekandi',
    specialty: 'Lab Specialist',
    bio: '12+ years of experience in diagnostics and lab management. Expert in modern lab technologies.',
    email: 'john.ssekandi@example.com',
  },
  {
    name: 'Dr. Mary Atim',
    specialty: 'Obstetrician & Gynecologist',
    bio: 'Specialist in women’s health, maternal care, and reproductive medicine.',
    email: 'mary.atim@example.com',
  },
  {
    name: 'Dr. Peter Mugisha',
    specialty: 'Orthopedic Surgeon',
    bio: 'Expert in bone and joint surgery, sports injuries, and trauma care.',
    email: 'peter.mugisha@example.com',
  },
];

const DEFAULT_PASSWORD = 'password123';

async function addDoctors() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mark',
    database: 'healthlink360',
  });

  for (const doc of doctors) {
    try {
      // 1. Create user
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [doc.name, doc.email, hashedPassword, 'doctor']
      );
      const userId = userResult.insertId;
      // 2. Create doctor profile
      await connection.execute(
        'INSERT INTO doctors (user_id, name, specialty, bio, experience_years, education, certifications, consultation_fee, available_days, available_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, doc.name, doc.specialty, doc.bio, 10, '', '', 100, 'Mon,Tue,Wed,Thu,Fri', '09:00-17:00']
      );
      console.log(`✓ Added doctor: ${doc.name}`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`⚠️  Doctor already exists: ${doc.name}`);
      } else {
        console.error(`❌ Error adding doctor ${doc.name}:`, err.message);
      }
    }
  }
  await connection.end();
  console.log('Done!');
}

addDoctors(); 