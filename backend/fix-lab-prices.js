const db = require('./config/db');

async function fixLabTestPrices() {
  try {
    // Delete all existing lab tests
    await db.query('DELETE FROM lab_tests');
    console.log('All lab_tests deleted.');

    // Insert correct sample lab tests
    const sampleTests = [
      ['Complete Blood Count (CBC)', 'Measures red blood cells, white blood cells, and platelets', 20000.00, 'Blood Test', 'Fast for 8-12 hours before test', '24-48 hours'],
      ['Comprehensive Metabolic Panel', 'Measures kidney function, liver function, and blood sugar', 35000.00, 'Blood Test', 'Fast for 8-12 hours before test', '24-48 hours'],
      ['Lipid Panel', 'Measures cholesterol and triglycerides', 25000.00, 'Blood Test', 'Fast for 12-14 hours before test', '24-48 hours'],
      ['Thyroid Function Test', 'Measures thyroid hormone levels', 30000.00, 'Blood Test', 'No special preparation required', '24-48 hours'],
      ['Urinalysis', 'Analyzes urine for various health indicators', 22000.00, 'Urine Test', 'Collect first morning urine', 'Same day'],
      ['X-Ray Chest', 'Chest X-ray for lung and heart evaluation', 50000.00, 'Imaging', 'No special preparation required', 'Same day'],
      ['ECG/EKG', 'Electrocardiogram for heart rhythm analysis', 40000.00, 'Cardiac Test', 'No special preparation required', 'Same day']
    ];
    for (const test of sampleTests) {
      await db.query(
        'INSERT INTO lab_tests (name, description, price, category, preparation_instructions, turnaround_time) VALUES (?, ?, ?, ?, ?, ?)',
        test
      );
    }
    console.log('Sample lab tests with correct prices inserted.');
  } catch (err) {
    console.error('Error fixing lab test prices:', err);
  } finally {
    process.exit();
  }
}

fixLabTestPrices(); 