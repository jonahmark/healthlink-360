import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-700 via-cyan-600 to-green-400 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">HealthLink 360</h3>
            <p className="text-cyan-100">Connecting patients with healthcare providers for better health outcomes.</p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-cyan-100">
              <li>Doctor Consultations</li>
              <li>Lab Test Booking</li>
              <li>Health Records</li>
              <li>Telemedicine</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-cyan-100">
              <li>Help Center</li>
              <li>Contact Us: <a href="tel:0755022649" className="underline hover:text-blue-200">0755022649</a></li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-cyan-100">
              <li>About Us</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Newsletter</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cyan-300 mt-8 pt-8 text-center text-cyan-100">
          <p>&copy; 2024 HealthLink 360. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 