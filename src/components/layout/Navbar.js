import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
          <span className="inline-block w-8 h-8 bg-health-500 rounded-full mr-2"></span>
          HealthLink 360
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-primary-600 font-medium">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-primary-600 font-medium">Dashboard</Link>
              <button onClick={handleLogout} className="btn-secondary ml-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/register" className="btn-secondary ml-2">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 