import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const DoctorProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: '',
    experience: '',
    education: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Update doctor profile via API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-cyan-200 drop-shadow">Doctor Profile</h1>
          <p className="text-cyan-700 dark:text-cyan-100">Manage your professional information</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700">
          <div className="px-6 py-4 border-b border-blue-100 dark:border-cyan-700">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-cyan-200">Profile Information</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                />
              </div>
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Specialization</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                />
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Years of Experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                />
              </div>
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Education</label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={profile.education}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                />
              </div>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-blue-700 dark:text-cyan-200">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={profile.bio}
                onChange={handleChange}
                className="mt-1 block w-full border border-blue-200 dark:border-cyan-700 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-cyan-400 focus:border-blue-400 dark:focus:border-cyan-400 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-cyan-200"
                placeholder="Tell patients about your expertise and approach to healthcare..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-700 hover:to-cyan-500 text-white font-medium py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 shadow-lg transition"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 