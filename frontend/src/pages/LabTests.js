import React, { useState, useEffect } from 'react';
import Loading from '../components/ui/Loading';

const sampleTests = [
  {
    id: 1,
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    price: 20000,
    description: 'Measures red blood cells, white blood cells, and platelets.',
  },
  {
    id: 2,
    name: 'Blood Glucose Test',
    category: 'Biochemistry',
    price: 25000,
    description: 'Measures blood sugar levels to screen for diabetes.',
  },
  {
    id: 3,
    name: 'Cholesterol Panel',
    category: 'Lipid Profile',
    price: 30000,
    description: 'Measures total cholesterol, HDL, LDL, and triglycerides.',
  },
  {
    id: 4,
    name: 'Liver Function Test',
    category: 'Biochemistry',
    price: 40000,
    description: 'Measures liver enzymes and proteins.',
  },
  {
    id: 5,
    name: 'Kidney Function Test',
    category: 'Biochemistry',
    price: 35000,
    description: 'Measures kidney function and waste products.',
  },
  {
    id: 6,
    name: 'Thyroid Function Test',
    category: 'Endocrinology',
    price: 50000,
    description: 'Measures thyroid hormone levels.',
  },
  {
    id: 7,
    name: 'Malaria Test',
    category: 'Parasitology',
    price: 15000,
    description: 'Detects malaria parasites in the blood.',
  },
  {
    id: 8,
    name: 'HIV Test',
    category: 'Serology',
    price: 20000,
    description: 'Screens for HIV infection.',
  },
  {
    id: 9,
    name: 'Urinalysis',
    category: 'General',
    price: 18000,
    description: 'Analyzes urine for various disorders.',
  },
];

const LabTests = () => {
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call, fallback to sampleTests
    setTimeout(() => {
      setAvailableTests(sampleTests);
        setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loading size="large" color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-blue-800 dark:text-cyan-200 text-center mb-10 drop-shadow">Available Lab Tests</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {availableTests.map(test => (
            <div key={test.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700 p-6 flex flex-col">
              <h2 className="text-xl font-bold text-blue-800 dark:text-cyan-200 mb-1">{test.name}</h2>
              <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2">{test.category}</div>
              <div className="text-lg font-bold text-blue-600 dark:text-cyan-300 mb-2">UGX {test.price.toLocaleString()}</div>
              <p className="text-gray-600 dark:text-gray-300 text-sm flex-1">{test.description}</p>
                    </div>
                  ))}
        </div>
      </div>
    </div>
  );
};

export default LabTests; 