/**
 * Debug Authentication Status
 * Tool untuk debugging masalah 401 errors
 */

// Function to check authentication status
export const debugAuth = () => {
  console.log('=== AUTHENTICATION DEBUG ===');
  
  // Check localStorage
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!user);
  
  if (token) {
    console.log('Token preview:', token.substring(0, 20) + '...');
    // Check if token looks valid (basic format check)
    const tokenParts = token.split('|');
    console.log('Token parts count:', tokenParts.length);
    console.log('Token format seems valid:', tokenParts.length >= 2);
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User role:', userData.role);
      console.log('User ID:', userData.userId);
      console.log('Is Admin:', userData.isAdmin);
    } catch (e) {
      console.error('User data parsing error:', e);
    }
  }
  
  // Test API endpoint directly
  console.log('Testing API endpoint...');
  testApiEndpoint();
};

// Function to test API endpoint with current token
const testApiEndpoint = async () => {
  const token = localStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  
  if (!token) {
    console.error('No token available for testing');
    return;
  }
  
  try {
    console.log('Testing endpoint:', `${API_BASE_URL}/admin/dashboard/overview`);
    
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.status === 401) {
      console.error('401 Unauthorized - Token might be expired or invalid');
      
      // Try to get response body for more details
      try {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
      } catch {
        console.error('Could not read error response');
      }
    } else if (response.ok) {
      console.log('API call successful!');
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.error('Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Export debug function to window for easy access
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  console.log('Debug tool loaded! Run debugAuth() in console to check authentication status.');
}
