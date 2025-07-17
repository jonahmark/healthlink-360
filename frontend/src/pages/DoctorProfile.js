import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import Loading from '../components/ui/Loading';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    specialty: '',
    bio: '',
    experience_years: '',
    education: '',
    certifications: '',
    consultation_fee: '',
    available_days: '',
    available_hours: ''
  });

  // Fetch doctor profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // First, get the doctor ID for the current user
        const doctorsResponse = await api.get('/doctors');
        const doctor = doctorsResponse.data.doctors.find(d => d.user_id === user.id);
        
        if (doctor) {
          // Fetch the specific doctor profile
          const profileResponse = await api.get(`/doctors/${doctor.id}`);
          setProfile(profileResponse.data.doctor);
        } else {
          // No profile exists yet, use user data as defaults
          setProfile({
            name: user.name || '',
            specialty: '',
            bio: '',
            experience_years: '',
            education: '',
            certifications: '',
            consultation_fee: '',
            available_days: '',
            available_hours: ''
          });
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSave = async () => {
    if (!profile.name || !profile.specialty) {
      setError('Name and specialty are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post('/doctors', profile);
      setIsEditing(false);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(error.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reload the profile to discard changes
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="large" color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Doctor Profile
            </h1>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    {saving ? (
                      <>
                        <Loading size="small" color="white" />
                        <span className="ml-2">Saving...</span>
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white text-6xl font-bold mb-4">
                  {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DR'}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.name || 'Doctor Name'}
                </h2>
                <p className="text-lg text-blue-600 mb-4">
                  {profile.specialty || 'Specialty'}
                </p>
                <div className="text-sm text-gray-600">
                  <p>Experience: {profile.experience_years || 'Not specified'} years</p>
                  <p>Education: {profile.education || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <p className="text-gray-900">{profile.name || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialty *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="specialty"
                          value={profile.specialty}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <p className="text-gray-900">{profile.specialty || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="experience_years"
                          value={profile.experience_years}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.experience_years || 'Not specified'} years</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consultation Fee (UGX)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="consultation_fee"
                          value={profile.consultation_fee}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <p className="text-gray-900">UGX {parseFloat(profile.consultation_fee).toLocaleString() || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Education
                  </h3>
                  {isEditing ? (
                    <textarea
                      name="education"
                      value={profile.education}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g., MD - Harvard Medical School, Residency at Johns Hopkins"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.education || 'Not specified'}</p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Certifications
                  </h3>
                  {isEditing ? (
                    <textarea
                      name="certifications"
                      value={profile.certifications}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g., Board Certified in Cardiology, Fellowship in Interventional Cardiology"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.certifications || 'Not specified'}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Biography
                  </h3>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell patients about your expertise, approach to care, and what makes you unique..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.bio || 'No biography available'}</p>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Availability
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Days
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="available_days"
                          value={profile.available_days}
                          onChange={handleInputChange}
                          placeholder="e.g., Monday, Wednesday, Friday"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.available_days || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Hours
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="available_hours"
                          value={profile.available_hours}
                          onChange={handleInputChange}
                          placeholder="e.g., 9:00 AM - 5:00 PM"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.available_hours || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 