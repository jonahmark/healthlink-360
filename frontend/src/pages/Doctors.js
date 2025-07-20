import React from 'react';

export const doctors = [
  {
    name: 'Dr. Grace Namaganda',
    specialty: 'Cardiologist',
    bio: '15+ years of experience in interventional cardiology. Passionate about heart health and patient education.',
    image: require('../assets/professionals/doctor4.jpg'),
  },
  {
    name: 'Dr. Samuel Okello',
    specialty: 'Pediatrician',
    bio: '10+ years of experience in child healthcare. Dedicated to improving children’s lives in Uganda.',
    image: require('../assets/professionals/doctor2.jpg'),
  },
  {
    name: 'Dr. Aisha Nansubuga',
    specialty: 'General Practitioner',
    bio: '8+ years of experience in family medicine. Focused on holistic and preventive care.',
    image: require('../assets/professionals/doctor3.jpg'),
  },
  {
    name: 'Dr. John Ssekandi',
    specialty: 'Lab Specialist',
    bio: '12+ years of experience in diagnostics and lab management. Expert in modern lab technologies.',
    image: require('../assets/professionals/doctor 1.jpg'),
  },
  {
    name: 'Dr. Mary Atim',
    specialty: 'Obstetrician & Gynecologist',
    bio: 'Specialist in women’s health, maternal care, and reproductive medicine.',
    image: 'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=facearea&w=256&h=256&facepad=2',
  },
  {
    name: 'Dr. Peter Mugisha',
    specialty: 'Orthopedic Surgeon',
    bio: 'Expert in bone and joint surgery, sports injuries, and trauma care.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256&facepad=2',
  },
];

const Doctors = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-blue-800 dark:text-cyan-200 text-center mb-10 drop-shadow">Our Doctors</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {doctors.map((doc, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-100 dark:border-cyan-700 p-6 flex flex-col items-center text-center">
              <img
                src={typeof doc.image === 'string' ? doc.image : doc.image.default}
                alt={doc.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 dark:border-cyan-400 mb-4 shadow"
              />
              <h2 className="text-xl font-bold text-blue-800 dark:text-cyan-200 mb-1">{doc.name}</h2>
              <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2">{doc.specialty}</div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{doc.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors; 