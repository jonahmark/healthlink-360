import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch available lab tests from API
    setTests([
      { id: 1, name: 'Complete Blood Count (CBC)', price: 20000, description: 'Measures red blood cells, white blood cells, and platelets' },
      { id: 2, name: 'Blood Glucose Test', price: 25000, description: 'Measures blood sugar levels' },
      { id: 3, name: 'Cholesterol Panel', price: 30000, description: 'Measures total cholesterol, HDL, LDL, and triglycerides' },
      { id: 4, name: 'Liver Function Test', price: 40000, description: 'Measures liver enzymes and proteins' },
      { id: 5, name: 'Kidney Function Test', price: 35000, description: 'Measures kidney function and waste products' },
      { id: 6, name: 'Thyroid Function Test', price: 50000, description: 'Measures thyroid hormone levels' }
    ]);
  }, []);

  const handleTestToggle = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const getTotalPrice = () => {
    return selectedTests.reduce((total, testId) => {
      const test = tests.find(t => t.id === testId);
      return total + (test ? test.price : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Book lab tests via API
    setTimeout(() => {
      setLoading(false);
      navigate('/patient/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-cyan-200 drop-shadow">Book Lab Tests</h1>
          <p className="text-cyan-700 dark:text-cyan-100">Schedule laboratory tests and diagnostic procedures</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Tests */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700">
              <div className="px-6 py-4 border-b border-blue-100 dark:border-cyan-700">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-cyan-200">Available Tests</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {tests.map(test => (
                    <div key={test.id} className={`border-2 ${selectedTests.includes(test.id) ? 'border-blue-500 bg-blue-50 dark:border-cyan-400 dark:bg-gray-800' : 'border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-cyan-400 bg-white dark:bg-gray-900'} rounded-xl p-4 shadow-lg transition-colors`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={`test-${test.id}`}
                            checked={selectedTests.includes(test.id)}
                            onChange={() => handleTestToggle(test.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <label htmlFor={`test-${test.id}`} className="text-sm font-medium text-blue-800 dark:text-cyan-200 cursor-pointer">{test.name}</label>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{test.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-800 dark:text-cyan-200">UGX {parseFloat(test.price).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-xl border-2 border-blue-200 dark:border-cyan-700 sticky top-8">
              <div className="px-6 py-4 border-b border-blue-100 dark:border-cyan-700">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-cyan-200">Booking Summary</h2>
              </div>
              <div className="p-6">
                {selectedTests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-300 text-center py-8">No tests selected</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {selectedTests.map(testId => {
                        const test = tests.find(t => t.id === testId);
                        return test ? (
                          <div key={test.id} className="flex justify-between items-center">
                            <span className="text-sm text-blue-900 dark:text-cyan-100">{test.name}</span>
                            <span className="text-sm font-medium text-blue-800 dark:text-cyan-200">UGX {parseFloat(test.price).toLocaleString()}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="border-t border-blue-200 dark:border-cyan-700 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-blue-800 dark:text-cyan-200">Total</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-cyan-300">UGX {getTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="appointment-date" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Preferred Date</label>
                        <input
                          type="date"
                          id="appointment-date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || selectedTests.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white font-medium py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition"
                      >
                        {loading ? 'Booking...' : 'Book Tests'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTests; 