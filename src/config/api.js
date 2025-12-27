// API Configuration
// Uses environment variable in production, fallback to localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000';

// Helper to get full storage URL for images
export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_URL}/storage/${path}`;
};
