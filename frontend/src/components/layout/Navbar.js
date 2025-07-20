import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import DarkModeToggle from '../ui/DarkModeToggle';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

const mockNotifications = [
  { id: 1, title: 'Appointment Confirmed', message: 'Your appointment with Dr. Smith is confirmed for tomorrow at 10:00 AM.' },
  { id: 2, title: 'Lab Result Ready', message: 'Your CBC lab result is now available.' },
  { id: 3, title: 'New Message', message: 'You have a new message from your doctor.' },
];

const Navbar = () => {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 shadow-lg sticky top-0 z-50 h-16 flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
      </nav>
    );
  }

  const navLinks = (
    <>
      <Link to="/" className="text-white hover:bg-blue-700 hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition block">Home</Link>
      <Link to="/patient/lab-tests" className="text-white hover:bg-blue-700 hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition block">Lab Tests</Link>
      <Link to="/doctors" className="text-white hover:bg-blue-700 hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition block">Doctors</Link>
      {isAuthenticated ? (
        <>
          <Link to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} className="text-white hover:bg-blue-700 hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition block">Dashboard</Link>
          {/* Notifications Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="relative focus:outline-none group block">
              <BellIcon className="h-6 w-6 text-white group-hover:text-cyan-200 transition" />
              {mockNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1.5 py-0.5">{mockNotifications.length}</span>
              )}
            </Menu.Button>
            <Transition as={Fragment}
              enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-cyan-200">Notifications</div>
                {mockNotifications.length === 0 ? (
                  <div className="p-4 text-gray-500 dark:text-gray-300 text-sm">No new notifications</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <Menu.Item key={notif.id}>
                        {({ active }) => (
                          <div className={`px-4 py-3 text-sm ${active ? 'bg-blue-50 dark:bg-cyan-800' : ''} text-gray-700 dark:text-cyan-200 border-b border-gray-100 dark:border-gray-800 last:border-b-0`}>
                            <div className="font-semibold">{notif.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-300">{notif.message}</div>
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                )}
              </Menu.Items>
            </Transition>
          </Menu>
          {/* Profile Dropdown */}
          <Menu as="div" className="relative inline-block text-left ml-2">
            <Menu.Button className="focus:outline-none group block">
              <UserCircleIcon className="h-8 w-8 text-white group-hover:text-cyan-200 transition" />
            </Menu.Button>
            <Transition as={Fragment}
              enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-bold text-blue-800 dark:text-cyan-200 text-lg">{user.name}</div>
                  <div className="text-gray-500 dark:text-gray-300 text-sm">{user.email}</div>
                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-400">Role: <span className="capitalize">{user.role}</span></div>
                </div>
                <Menu.Item>
                  {({ active }) => (
                    <Link to={user.role === 'doctor' ? '/doctor/profile' : '/patient/profile'}
                      className={`block px-6 py-3 text-sm font-medium ${active ? 'bg-blue-50 dark:bg-cyan-800' : ''} text-blue-700 dark:text-cyan-200`}
                    >
                      View Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-6 py-3 text-sm font-medium ${active ? 'bg-blue-50 dark:bg-cyan-800' : ''} text-red-600 dark:text-red-400`}
                    >
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </>
      ) : (
        <>
          <Link to="/login" className="text-white hover:bg-blue-700 hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition block">Login</Link>
          <Link to="/register" className="bg-white text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium transition block">Register</Link>
        </>
      )}
      <DarkModeToggle />
    </>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/image%20.jpg" alt="HealthLink Logo" className="h-10 w-10 rounded-full object-cover mr-3 shadow" />
              <span className="text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
                HealthLink <span className="font-black">360</span>
              </span>
            </Link>
          </div>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">{navLinks}</div>
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
              {menuOpen ? <XMarkIcon className="h-8 w-8" /> : <Bars3Icon className="h-8 w-8" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-b-lg shadow-lg py-4 px-2 space-y-2 animate-fade-in">
            {navLinks}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 