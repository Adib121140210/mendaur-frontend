# 🚀 Routing Implementation Guide - User & Admin Separation

## Overview

The routing system has been completely restructured to:
- ✅ Make login the main root (`/`)
- ✅ Separate user and admin dashboards into different roots
- ✅ Protect routes based on authentication status
- ✅ Enforce role-based access control
- ✅ Auto-redirect based on user role

---

## 📊 New Routing Structure

### Root & Public Routes

```
/                      → Login page (or redirect if authenticated)
/landing              → Landing/intro page
/login                → Login form
/register             → Registration form
/daftar               → Alternative registration page
```

### User Dashboard Routes (Protected)

```
/dashboard                    → User home (HOME)
/dashboard/artikel           → Articles list
/dashboard/artikel/:id       → Article detail
/dashboard/profil            → User profile
/dashboard/tabungSampah      → Waste submission
/dashboard/riwayatTabung     → Waste history
/dashboard/produk            → Product list
/dashboard/produk/:id        → Product detail
/dashboard/tukarPoin         → Exchange points
/dashboard/leaderboard       → Leaderboard
/dashboard/riwayatTransaksi  → Transaction history
```

### Admin Dashboard Routes (Protected)

```
/admin/dashboard                          → Admin main dashboard
/admin/dashboard/points                   → Admin points system
/admin/dashboard/points/stats             → Points statistics
/admin/dashboard/points/history           → User points history
/admin/dashboard/points/breakdown         → Points breakdown
/admin/dashboard/points/redemptions       → Redemption records
```

---

## 🔐 Authentication Flow

### How It Works

1. **User Visits Root (`/`)**
   - System checks AuthContext for `isAuthenticated` status
   - If NOT authenticated → Show Login page
   - If authenticated → Check role and redirect

2. **Admin User Logged In**
   - Role = `admin` or `superadmin`
   - Automatically redirected to `/admin/dashboard`
   - Can access all `/admin/*` routes
   - Cannot access `/dashboard/*` routes (blocked by ProtectedRoute)

3. **Regular User Logged In**
   - Role = `user`
   - Automatically redirected to `/dashboard`
   - Can access all `/dashboard/*` routes
   - Cannot access `/admin/*` routes (blocked by ProtectedRoute)

4. **User Tries to Access Protected Route Without Auth**
   - Redirected back to `/` (login page)

5. **User Tries to Access Route They Don't Have Permission For**
   - Redirected to their permitted root (admin stays in `/admin/*`, user goes to `/dashboard/*`)

---

## 🛡️ ProtectedRoute Component

The new `ProtectedRoute` wrapper ensures:

```javascript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

**Features:**
- ✅ Checks if user is authenticated
- ✅ Shows loading state while auth context loads
- ✅ Validates user role matches requirement
- ✅ Redirects unauthorized users appropriately
- ✅ Prevents unauthenticated access

---

## 📱 Navigation Examples

### User Login Flow

```
1. User visits http://localhost:5173
   ↓
2. App.jsx checks useAuth() hook
   ↓
3. isAuthenticated = false
   ↓
4. Displays Login component
   ↓
5. User enters credentials and submits
   ↓
6. Login succeeds, sets role = "user"
   ↓
7. App.jsx detects authentication
   ↓
8. isAdmin = false
   ↓
9. Redirects to /dashboard ✅
   ↓
10. User sees home content with navbar
```

### Admin Login Flow

```
1. Admin visits http://localhost:5173
   ↓
2. App.jsx checks useAuth() hook
   ↓
3. isAuthenticated = false
   ↓
4. Displays Login component
   ↓
5. Admin enters credentials and submits
   ↓
6. Login succeeds, sets role = "admin"
   ↓
7. App.jsx detects authentication
   ↓
8. isAdmin = true
   ↓
9. Redirects to /admin/dashboard ✅
   ↓
10. Admin sees admin dashboard with 6 tabs
```

### Logout Flow

```
1. User clicks logout button
   ↓
2. AuthContext.logout() called
   ↓
3. Clears: user, role, token, id_user from state
   ↓
4. Clears localStorage
   ↓
5. useAuth() returns isAuthenticated = false
   ↓
6. App.jsx root route re-evaluates
   ↓
7. Redirects to / (login page) ✅
```

---

## 🔄 Route Transitions

### User Trying to Access Admin Route

```
User navigates to /admin/dashboard
        ↓
ProtectedRoute checks: requiredRole = "admin"
        ↓
useAuth().isAdmin = false (user is "user" role)
        ↓
Redirects to /dashboard
        ↓
User stays in their dashboard ✅
```

### Admin Trying to Access User Route

```
Admin navigates to /dashboard
        ↓
ProtectedRoute allows access (no role check for user routes)
        ↓
Admin can see /dashboard
        ↓
But homepage is meant for users, so admin should use /admin/dashboard
```

---

## 📋 AuthContext Integration

The routing system uses these AuthContext properties:

```javascript
const { 
  user,              // User object from API
  role,              // "user", "admin", or "superadmin"
  isAuthenticated,   // true/false
  isAdmin,           // true if admin or superadmin
  loading,           // true while checking auth
  login,             // Function to set auth
  logout,            // Function to clear auth
} = useAuth();
```

---

## 🔍 Testing Checklist

- [ ] **Fresh visit**: Navigate to http://localhost:5173 → See login page
- [ ] **User login**: Login with user@test.com → Redirected to /dashboard
- [ ] **Admin login**: Login with admin@test.com → Redirected to /admin/dashboard
- [ ] **Page refresh**: Reload while logged in → Stays on same page
- [ ] **Direct URL**: Type /admin/dashboard as user → Redirected to /dashboard
- [ ] **Logout**: Click logout → Redirected to /login (/) page
- [ ] **Protected access**: Type /dashboard URL as guest → Redirected to /login
- [ ] **All user routes**: Click navbar links → All work correctly
- [ ] **All admin routes**: Navigate between admin tabs → All work correctly

---

## 🛠️ Key Changes Made

### Before
```
/ → User home page
/login → Login page
/admin/dashboard → Nested in user layout
```

### After
```
/ → Login page (root, redirects if authenticated)
/dashboard → User home (protected, role-checked)
/admin/dashboard → Admin home (protected, admin-only)
```

---

## 🎯 Summary

| Route | Access | Who | Notes |
|-------|--------|-----|-------|
| `/` | Public | Everyone | Redirects if authenticated |
| `/login` | Public | Guests only | Can visit anytime |
| `/dashboard/*` | Protected | Users only | 11 user pages |
| `/admin/dashboard*` | Protected | Admins only | 6 admin pages |

---

## ❓ Troubleshooting

### "I'm logged in but keep seeing login page"
- Check if `isAuthenticated` is properly set in AuthContext
- Verify localStorage has `token` and `role`
- Check browser console for errors

### "I can access admin routes as a user"
- ProtectedRoute component might not be properly wrapped
- Verify `isAdmin` property is correctly computed in AuthContext
- Check that role is being stored in localStorage

### "Routes are not redirecting automatically"
- Check if AuthContext.loading is being handled
- Verify useAuth() is properly initialized in App.jsx
- Make sure AuthProvider wraps the entire app in main.jsx

### "Logout is not working"
- Verify logout button calls `auth.logout()`
- Check that localStorage is being cleared
- Confirm useAuth() returns updated values after logout

---

## 📞 Support

For issues with routing:
1. Check browser console for errors
2. Verify AuthContext is initialized properly
3. Test with different user roles
4. Clear browser cache and localStorage if needed
