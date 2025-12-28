// API Configuration
// Uses environment variable in production, fallback to localhost in development
// Support both VITE_API_BASE_URL and VITE_API_URL for flexibility
const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

// Ensure URL has protocol (https://)
const baseUrl = rawUrl && !rawUrl.startsWith('http') ? `https://${rawUrl}` : rawUrl;

// Production fallback URL - Railway backend
const PRODUCTION_URL = 'https://mendaur.up.railway.app';

export const API_BASE_URL = baseUrl ? `${baseUrl}/api` : `${PRODUCTION_URL}/api`;
export const STORAGE_URL = baseUrl || PRODUCTION_URL;

// Helper to get full storage URL for images
export const getStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_URL}/storage/${path}`;
};
