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
  // Already a full URL (Cloudinary, etc.)
  if (path.startsWith('http')) return path;
  
  // Clean up the path - remove leading slashes
  const cleanPath = path.replace(/^\/+/, '');
  
  // If path already starts with 'uploads/', don't add 'storage/' prefix
  if (cleanPath.startsWith('uploads/')) {
    return `${STORAGE_URL}/${cleanPath}`;
  }
  
  // If path starts with 'storage/', don't add it again
  if (cleanPath.startsWith('storage/')) {
    return `${STORAGE_URL}/${cleanPath}`;
  }
  
  // If path starts with 'avatars/', add 'storage/' prefix 
  // (Laravel stores avatars in storage/app/public/avatars)
  if (cleanPath.startsWith('avatars/')) {
    return `${STORAGE_URL}/storage/${cleanPath}`;
  }
  
  // Default: add storage prefix for other paths (like 'produk/xxx.jpg')
  return `${STORAGE_URL}/storage/${cleanPath}`;
};
