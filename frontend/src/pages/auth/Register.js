import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/ui/Loading';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (error) {
      let errorMsg = 'Registration failed. Please try again.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
        if (error.response.data.details) {
          errorMsg += ' (' + JSON.stringify(error.response.data.details) + ')';
        }
      }
      setErrors({ general: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-2">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800 dark:text-cyan-200 mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-300 text-base">Join HealthLink 360 for better healthcare</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-5 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border text-base outline-none transition-colors duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-600 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border text-base outline-none transition-colors duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-600 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border text-base outline-none transition-colors duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-600 ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 text-base outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-600"
            >
              <option value="user">Patient</option>
              <option value="premium">Premium Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border text-base outline-none transition-colors duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-600 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border text-base outline-none transition-colors duration-200 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-600 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors duration-200 shadow ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <Loading size="small" /> : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-cyan-400 font-medium hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 