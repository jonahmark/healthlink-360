import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/ui/Loading';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      let errorMsg = error.message || 'Login failed. Please try again.';
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800 dark:text-cyan-200 mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your HealthLink 360 account</p>
        </div>
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 p-3 rounded mb-5 text-sm">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-blue-700 dark:text-cyan-200">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200 ${errors.email ? 'border-red-500' : 'border-blue-200 dark:border-cyan-700'}`}
              placeholder="Enter your email"
              required
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-200 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block mb-2 font-medium text-blue-700 dark:text-cyan-200">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200 ${errors.password ? 'border-red-500' : 'border-blue-200 dark:border-cyan-700'}`}
              placeholder="Enter your password"
              required
            />
            {errors.password && (
              <p className="text-red-600 dark:text-red-200 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center transition"
          >
            {isLoading ? <Loading size="small" /> : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-700 dark:text-cyan-200 font-semibold hover:underline">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 