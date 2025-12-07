# Authentication System with Role-Based Access

## Overview

This authentication system automatically detects user roles (admin, superadmin, or user) and routes them to appropriate pages.

## Updated Components

### 1. Login Page (`src/Components/Pages/login/login.jsx`)

**Features:**
- ✅ Email and password authentication
- ✅ Automatic role detection from backend response
- ✅ Role-based navigation after login:
  - **admin** or **superadmin** → `/admin/dashboard`
  - **user** → `/profil` (user profile page)
- ✅ Better error messages including connection issues
- ✅ Loading state management
- ✅ Local storage for token and role persistence

**Updated Logic:**
```javascript
// Extract role from backend response
const userRole = userData.user?.role || userData.role || 'user';

// Store role for quick access
localStorage.setItem('role', userRole);

// Navigate based on role
if (userRole === 'admin' || userRole === 'superadmin') {
  navigate("/admin/dashboard");
} else {
  navigate("/profil");
}
```

### 2. Auth Context (`src/Components/Pages/context/AuthContext.jsx`)

**New Features:**
- ✅ `role` state to track user role
- ✅ `isAdmin` computed property (true if admin or superadmin)
- ✅ Role persistence across page refreshes
- ✅ Role-aware login method

**Context API:**
```javascript
const { 
  user,
  role,           // NEW: 'admin', 'superadmin', or 'user'
  isAdmin,        // NEW: true if user is admin/superadmin
  isAuthenticated,
  loading,
  login,
  logout,
  updateUser
} = useAuth();
```

## Usage Examples

### Check if User is Admin
```javascript
import { useAuth } from '../context/AuthContext';

export default function SomeComponent() {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <AdminContent />;
}
```

### Get User's Role
```javascript
const { role, user } = useAuth();

if (role === 'admin') {
  // Admin-specific logic
} else if (role === 'superadmin') {
  // Superadmin-specific logic
} else if (role === 'user') {
  // Regular user logic
}
```

### Protected Routes
```javascript
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const { role, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/profil" />;
  }
  
  return children;
}
```

## Local Storage Structure

After login, the following data is stored:

```javascript
localStorage.setItem('user', JSON.stringify(userData.user));
localStorage.setItem('token', userData.token);
localStorage.setItem('role', 'admin'); // or 'superadmin', 'user'
localStorage.setItem('id_user', userData.user.id);
```

## API Response Expected Format

The backend should return:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin",
      "nama": "Admin User",
      ...
    },
    "token": "bearer_token_here"
  }
}
```

## Error Handling

The login page now handles:

1. **Connection Refused**: Backend not running
   - Message: "Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000"

2. **Invalid Credentials**: Wrong email/password
   - Message from backend

3. **Server Errors**: 5xx errors
   - Generic error message with details

4. **Network Errors**: Timeout, etc.
   - User-friendly error message

## Navigation Flow

```
Login Page
    ↓
Authenticate with Backend
    ↓
Receive User Data + Role
    ↓
┌─────────────────────────┐
│   Check User Role       │
└─────────────────────────┘
    ↙              ↘
  admin/        user
 superadmin
    ↓              ↓
Admin Dashboard  User Profile
```

## Testing Checklist

- [ ] Login with admin credentials → redirects to `/admin/dashboard`
- [ ] Login with superadmin credentials → redirects to `/admin/dashboard`
- [ ] Login with regular user credentials → redirects to `/profil`
- [ ] Login with invalid credentials → shows error message
- [ ] Refresh page after login → user data persists
- [ ] Logout → clears role and user data
- [ ] Backend offline → shows connection error
- [ ] Role available via `useAuth()` hook

## Files Modified

1. `src/Components/Pages/login/login.jsx`
   - Added role-based navigation
   - Improved error handling
   - Better feedback for connection issues

2. `src/Components/Pages/context/AuthContext.jsx`
   - Added role state management
   - Added isAdmin computed property
   - Enhanced login method to handle role

## Backend Requirements

Ensure your backend at `http://127.0.0.1:8000/api/login`:
- Accepts: `{ email, password }`
- Returns: `{ status: 'success', data: { user: {..., role: string}, token: string } }`
- Returns 400/401 for invalid credentials
- Handles CORS properly

---

**Status**: ✅ Ready for Testing
**Lint Status**: ✅ Passing
**Role Detection**: ✅ Automatic
**Navigation**: ✅ Role-based
