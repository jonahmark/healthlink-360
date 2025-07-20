import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { labAPI } from '../../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await labAPI.getAvailableLabTests(undefined, { params: { t: Date.now() } });
        setTests(response.data.tests || []);
      } catch (err) {
        setError('Failed to load lab tests.');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await labAPI.getUserLabRequests();
      setHistory(response.data.labRequests || response.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch lab request history:', err?.response?.data || err.message);
    }
  };

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

  const isRequestEnabled = selectedTests.length > 0 && selectedDate && new Date(selectedDate) >= new Date(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    setLoading(true);
    setError('');
    try {
      console.log('Requesting lab tests with:', {
        url: 'http://localhost:5000/api/lab/requests/batch',
        test_ids: selectedTests,
        request_date: selectedDate,
        notes
      });
      await labAPI.createBatchLabRequests({
        test_ids: selectedTests,
        request_date: selectedDate,
        notes
      });
      setConfirmation(true);
      setSelectedTests([]);
      setSelectedDate('');
      setNotes('');
      toast.success('Lab test request submitted!');
      fetchHistory();
    } catch (err) {
      let backendMsg = err?.response?.data?.message || err.message || 'Failed to request lab tests. Please try again.';
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        backendMsg = 'You are not authorized. Please log out and log in again as a patient.';
      }
      if (backendMsg.includes('A listener indicated an asynchronous response by returning true')) {
        backendMsg = 'A browser extension is interfering with requests. Please disable all browser extensions and try again.';
      }
      setError(backendMsg);
      toast.error(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  if (confirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Toaster />
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-green-400 dark:border-green-700 p-10 flex flex-col items-center">
          <span className="text-5xl mb-4">✅</span>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">Lab Test Request Submitted!</h1>
          <p className="text-gray-700 dark:text-gray-200 mb-4 text-center">Your lab test request has been received. You will be notified once your appointment is confirmed.</p>
          <button onClick={() => navigate('/patient/dashboard')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Back to Dashboard</button>
          <div className="mt-8 w-full">
            <h2 className="text-xl font-bold mb-2 text-blue-800 dark:text-cyan-200">Your Lab Request History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Test</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Date</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(req => (
                    <tr key={req.id} className="border-t">
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-cyan-200">{req.test_name}</td>
                      <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{req.request_date}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${req.status === 'completed' ? 'bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-200'}`}>{req.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <Toaster />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-cyan-200 drop-shadow">Request Lab Tests</h1>
          <p className="text-cyan-700 dark:text-cyan-100">Select the lab tests you need and submit your request.</p>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Tests */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700">
              <div className="px-6 py-4 border-b border-blue-100 dark:border-cyan-700">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-cyan-200">Available Lab Tests</h2>
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
                <h2 className="text-xl font-semibold text-blue-700 dark:text-cyan-200">Your Request</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-6">
                {selectedTests.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-300 text-center py-8">No tests selected</p>
                ) : (
                    selectedTests.map(testId => {
                        const test = tests.find(t => t.id === testId);
                        return test ? (
                          <div key={test.id} className="flex justify-between items-center">
                            <span className="text-sm text-blue-900 dark:text-cyan-100">{test.name}</span>
                            <span className="text-sm font-medium text-blue-800 dark:text-cyan-200">UGX {parseFloat(test.price).toLocaleString()}</span>
                          </div>
                        ) : null;
                    })
                  )}
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
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Additional Notes (Optional)</label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                      placeholder="Any additional information for the lab..."
                        />
                      </div>
                      <button
                        type="submit"
                    disabled={loading || !isRequestEnabled}
                    className={`w-full bg-gradient-to-r from-green-600 to-blue-400 hover:from-green-700 hover:to-blue-500 text-white font-medium py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transition ${(!isRequestEnabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                    {loading ? (<span className="flex items-center justify-center"><span className="loader mr-2"></span>Requesting...</span>) : 'Request Lab Tests'}
                      </button>
                  {!isRequestEnabled && (
                    <div className="text-xs text-red-500 text-center mt-2">Select at least one test and a date to enable the request button.</div>
                  )}
                    </form>
                {/* Confirmation Modal */}
                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-md w-full">
                      <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-cyan-200">Confirm Lab Test Request</h2>
                      <ul className="mb-4 list-disc list-inside text-gray-700 dark:text-gray-200">
                        {selectedTests.map(testId => {
                          const test = tests.find(t => t.id === testId);
                          return test ? <li key={test.id}>{test.name}</li> : null;
                        })}
                      </ul>
                      <div className="mb-4 text-gray-700 dark:text-gray-200">Date: <b>{selectedDate}</b></div>
                      {notes && <div className="mb-4 text-gray-700 dark:text-gray-200">Notes: <b>{notes}</b></div>}
                      <div className="flex justify-end gap-4">
                        <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold">Cancel</button>
                        <button onClick={handleConfirm} className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition">Confirm</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Always show request history below */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-2 text-blue-800 dark:text-cyan-200">Your Lab Request History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Test</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Date</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-500 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(req => (
                  <tr key={req.id} className="border-t">
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-cyan-200">{req.test_name}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{req.request_date}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${req.status === 'completed' ? 'bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-200'}`}>{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTests; 