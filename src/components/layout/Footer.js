import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 py-6 mt-8">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
      <div className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} HealthLink 360. All rights reserved.</div>
      <div className="flex gap-4 mt-2 md:mt-0">
        <Link to="/" className="hover:text-primary-600 text-gray-500 text-sm">Home</Link>
        <Link to="/about" className="hover:text-primary-600 text-gray-500 text-sm">About</Link>
        <Link to="/contact" className="hover:text-primary-600 text-gray-500 text-sm">Contact</Link>
      </div>
    </div>
  </footer>
);

export default Footer; 