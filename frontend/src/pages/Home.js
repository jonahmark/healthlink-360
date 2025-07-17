import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/layout/Footer';
// Add imports for professional images at the top
import doctor1 from '../assets/professionals/doctor4.jpg';
import doctor2 from '../assets/professionals/doctor2.jpg';
import doctor3 from '../assets/professionals/doctor3.jpg';
import doctor4 from '../assets/professionals/doctor 1.jpg';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-cyan-200 mb-4 drop-shadow">Your Health, Our Priority</h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">Connect with healthcare professionals, book appointments, and manage your health records all in one place.</p>
        {!isAuthenticated && (
          <div className="flex gap-4 justify-center mb-8">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow transition">Get Started Today</Link>
            <Link to="/login" className="bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 dark:bg-gray-900 dark:border-cyan-400 dark:text-cyan-200 px-8 py-3 rounded-lg font-semibold text-lg shadow transition">Sign In</Link>
          </div>
        )}
        <img src={doctor1} alt="Doctor" className="w-48 h-48 object-cover rounded-full shadow-lg border-4 border-white dark:border-cyan-400 mx-auto mt-4" />
      </main>
      {/* Features Section */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-blue-700 dark:text-cyan-200 text-center mb-12">Why Choose HealthLink 360?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-blue-50 dark:bg-gray-800 rounded-xl shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-600 dark:bg-cyan-600 text-white text-3xl">🏥</div>
              <h4 className="text-xl font-semibold text-blue-800 dark:text-cyan-200 mb-2">Easy Appointment Booking</h4>
              <p className="text-gray-600 dark:text-gray-300">Book appointments with healthcare professionals in just a few clicks.</p>
            </div>
            <div className="p-8 bg-green-50 dark:bg-gray-800 rounded-xl shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-500 dark:bg-green-700 text-white text-3xl">🔒</div>
              <h4 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">Secure Health Records</h4>
              <p className="text-gray-600 dark:text-gray-300">Your health information is encrypted and securely stored.</p>
            </div>
            <div className="p-8 bg-yellow-50 dark:bg-gray-800 rounded-xl shadow text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-400 dark:bg-yellow-600 text-white text-3xl">⏰</div>
              <h4 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">24/7 Support</h4>
              <p className="text-gray-600 dark:text-gray-300">Get help whenever you need it with our round-the-clock support.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Doctors Section */}
      <section className="bg-gradient-to-r from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-blue-700 dark:text-cyan-200 text-center mb-12">Meet Our Healthcare Professionals</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 text-center">
              <img src={doctor1} alt="Dr. Grace Namaganda" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100 dark:border-cyan-400" />
              <h4 className="text-lg font-semibold text-blue-800 dark:text-cyan-200 mb-1">Dr. Grace Namaganda</h4>
              <p className="text-gray-500 dark:text-gray-300 mb-2">Cardiologist</p>
              <p className="text-gray-400 dark:text-gray-400 text-sm">15+ years of experience in interventional cardiology</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 text-center">
              <img src={doctor2} alt="Dr. Samuel Okello" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100 dark:border-cyan-400" />
              <h4 className="text-lg font-semibold text-blue-800 dark:text-cyan-200 mb-1">Dr. Samuel Okello</h4>
              <p className="text-gray-500 dark:text-gray-300 mb-2">Pediatrician</p>
              <p className="text-gray-400 dark:text-gray-400 text-sm">10+ years of experience in child healthcare</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 text-center">
              <img src={doctor3} alt="Dr. Aisha Nansubuga" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100 dark:border-cyan-400" />
              <h4 className="text-lg font-semibold text-blue-800 dark:text-cyan-200 mb-1">Dr. Aisha Nansubuga</h4>
              <p className="text-gray-500 dark:text-gray-300 mb-2">General Practitioner</p>
              <p className="text-gray-400 dark:text-gray-400 text-sm">8+ years of experience in family medicine</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 text-center">
              <img src={doctor4} alt="Dr. John Ssekandi" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100 dark:border-cyan-400" />
              <h4 className="text-lg font-semibold text-blue-800 dark:text-cyan-200 mb-1">Dr. John Ssekandi</h4>
              <p className="text-gray-500 dark:text-gray-300 mb-2">Lab Specialist</p>
              <p className="text-gray-400 dark:text-gray-400 text-sm">12+ years of experience in diagnostics</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home; 