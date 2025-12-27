// API Configuration
// Uses environment variable in production, fallback to localhost in development
// Support both VITE_API_BASE_URL and VITE_API_URL for flexibility
const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
export const API_BASE_URL = baseUrl ? `${baseUrl}/api` : 'http://127.0.0.1:8000/api';
export const STORAGE_URL = baseUrl || 'http://127.0.0.1:8000';

// Helper to get full storage URL for images
export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_URL}/storage/${path}`;
};
