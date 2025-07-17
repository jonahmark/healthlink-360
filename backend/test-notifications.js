const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = 0;

// Test data
const testUser = {
  name: 'Notification Test User',
  email: `notification.test.${Date.now()}@example.com`,
  password: 'testpassword123',
  phone: '1234567890',
  role: 'premium'
};

const testDoctor = {
  name: 'Dr. Notification Test',
  email: `doctor.notification.${Date.now()}@example.com`,
  password: 'testpassword123',
  phone: '1234567890',
  role: 'doctor'
};

const testAdmin = {
  name: 'Admin Notification Test',
  email: `admin.notification.${Date.now()}@example.com`,
  password: 'testpassword123',
  phone: '1234567890',
  role: 'admin'
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
const testUserRegistration = async () => {
  console.log('\n=== Testing User Registration ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registration successful');
    console.log('User ID:', response.data.user.id);
    userId = response.data.user.id;
    return response.data.user;
  } catch (error) {
    console.error('❌ User registration failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

const testUserLogin = async () => {
  console.log('\n=== Testing User Login ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User login successful');
    authToken = response.data.token;
    return response.data;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    throw error;
  }
};

const testGetNotificationSettings = async () => {
  console.log('\n=== Testing Get Notification Settings ===');
  try {
    const response = await makeAuthRequest('GET', '/notifications/settings');
    console.log('✅ Get notification settings successful');
    console.log('Settings:', response.data.settings);
    return response.data.settings;
  } catch (error) {
    console.error('❌ Get notification settings failed:', error.response?.data || error.message);
    throw error;
  }
};

const testUpdateNotificationSettings = async () => {
  console.log('\n=== Testing Update Notification Settings ===');
  try {
    const newSettings = {
      email_notifications: false,
      push_notifications: true,
      appointment_reminders: true,
      lab_results: false,
      payment_notifications: true,
      system_notifications: false
    };
    
    const response = await makeAuthRequest('PUT', '/notifications/settings', newSettings);
    console.log('✅ Update notification settings successful');
    console.log('Updated settings:', response.data.settings);
    return response.data.settings;
  } catch (error) {
    console.error('❌ Update notification settings failed:', error.response?.data || error.message);
    throw error;
  }
};

const testCreateNotification = async () => {
  console.log('\n=== Testing Create Notification ===');
  try {
    const notification = {
      user_id: userId,
      title: 'Test Notification',
      message: 'This is a test notification message',
      type: 'system'
    };
    
    const response = await makeAuthRequest('POST', '/notifications', notification);
    console.log('✅ Create notification successful');
    console.log('Created notification:', response.data.notification);
    return response.data.notification;
  } catch (error) {
    console.error('❌ Create notification failed:', error.response?.data || error.message);
    throw error;
  }
};

const testGetUserNotifications = async () => {
  console.log('\n=== Testing Get User Notifications ===');
  try {
    const response = await makeAuthRequest('GET', '/notifications');
    console.log('✅ Get user notifications successful');
    console.log('Notifications count:', response.data.notifications.length);
    console.log('Pagination:', response.data.pagination);
    console.log('First notification:', response.data.notifications[0]);
    return response.data.notifications;
  } catch (error) {
    console.error('❌ Get user notifications failed:', error.response?.data || error.message);
    throw error;
  }
};

const testGetNotificationCount = async () => {
  console.log('\n=== Testing Get Notification Count ===');
  try {
    const response = await makeAuthRequest('GET', '/notifications/count');
    console.log('✅ Get notification count successful');
    console.log('Unread count:', response.data.unread_count);
    return response.data.unread_count;
  } catch (error) {
    console.error('❌ Get notification count failed:', error.response?.data || error.message);
    throw error;
  }
};

const testMarkAsRead = async (notificationId) => {
  console.log('\n=== Testing Mark Notification as Read ===');
  try {
    const response = await makeAuthRequest('PUT', `/notifications/${notificationId}/read`);
    console.log('✅ Mark as read successful');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Mark as read failed:', error.response?.data || error.message);
    throw error;
  }
};

const testMarkAllAsRead = async () => {
  console.log('\n=== Testing Mark All Notifications as Read ===');
  try {
    const response = await makeAuthRequest('PUT', '/notifications/mark-all-read');
    console.log('✅ Mark all as read successful');
    console.log('Updated count:', response.data.updated_count);
    return response.data;
  } catch (error) {
    console.error('❌ Mark all as read failed:', error.response?.data || error.message);
    throw error;
  }
};

const testDeleteNotification = async (notificationId) => {
  console.log('\n=== Testing Delete Notification ===');
  try {
    const response = await makeAuthRequest('DELETE', `/notifications/${notificationId}`);
    console.log('✅ Delete notification successful');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Delete notification failed:', error.response?.data || error.message);
    throw error;
  }
};

const testCreateMultipleNotifications = async () => {
  console.log('\n=== Testing Create Multiple Notifications ===');
  try {
    const notifications = [
      {
        user_id: userId,
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Smith has been confirmed for tomorrow at 2:00 PM.',
        type: 'appointment'
      },
      {
        user_id: userId,
        title: 'Lab Results Available',
        message: 'Your blood test results are now available. Please check your dashboard.',
        type: 'lab_result'
      },
      {
        user_id: userId,
        title: 'Payment Processed',
        message: 'Payment of $150 for consultation has been processed successfully.',
        type: 'payment'
      },
      {
        user_id: userId,
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM.',
        type: 'system'
      }
    ];

    for (const notification of notifications) {
      const response = await makeAuthRequest('POST', '/notifications', notification);
      console.log(`✅ Created ${notification.type} notification`);
    }
    
    console.log('✅ All notifications created successfully');
  } catch (error) {
    console.error('❌ Create multiple notifications failed:', error.response?.data || error.message);
    throw error;
  }
};

const testNotificationPagination = async () => {
  console.log('\n=== Testing Notification Pagination ===');
  try {
    // Test first page
    const response1 = await makeAuthRequest('GET', '/notifications?page=1&limit=2');
    console.log('✅ First page (limit 2):', response1.data.notifications.length, 'notifications');
    
    // Test second page
    const response2 = await makeAuthRequest('GET', '/notifications?page=2&limit=2');
    console.log('✅ Second page (limit 2):', response2.data.notifications.length, 'notifications');
    
    // Test unread only
    const response3 = await makeAuthRequest('GET', '/notifications?unread_only=true');
    console.log('✅ Unread only:', response3.data.notifications.length, 'notifications');
    
    return {
      page1: response1.data,
      page2: response2.data,
      unread: response3.data
    };
  } catch (error) {
    console.error('❌ Notification pagination failed:', error.response?.data || error.message);
    throw error;
  }
};

// Main test execution
const runNotificationTests = async () => {
  console.log('🚀 Starting Notification System Tests...\n');
  
  try {
    // Basic setup
    await testUserRegistration();
    await testUserLogin();
    
    // Notification settings tests
    await testGetNotificationSettings();
    await testUpdateNotificationSettings();
    
    // Notification CRUD tests
    const notification = await testCreateNotification();
    await testGetUserNotifications();
    await testGetNotificationCount();
    
    // Create multiple notifications for testing
    await testCreateMultipleNotifications();
    
    // Test pagination
    await testNotificationPagination();
    
    // Test marking notifications
    await testMarkAsRead(notification.id);
    await testGetNotificationCount();
    await testMarkAllAsRead();
    await testGetNotificationCount();
    
    // Test deletion
    await testDeleteNotification(notification.id);
    
    console.log('\n🎉 All notification tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  }
};

// Run the tests
runNotificationTests(); 