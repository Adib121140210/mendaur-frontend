/**
 * Debug Authentication Status
 * Tool untuk debugging masalah 401 errors
 * NOTE: Disabled for production - sensitive data logging removed
 */

// Function to check authentication status (disabled for production)
export const debugAuth = () => {
  // Debug logging disabled for security
  return {
    hasToken: !!localStorage.getItem('token'),
    hasUser: !!localStorage.getItem('user'),
  };
};

// Export debug function to window for easy access
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}
