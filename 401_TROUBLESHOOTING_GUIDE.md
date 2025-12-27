# 401 Error Troubleshooting Guide

**Date:** December 26, 2025  
**Issue:** Getting 401 errors on admin API calls despite successful login  
**Status:** 🔍 INVESTIGATING

## Current Status

✅ **Environment Fix Applied:** API calls now use `127.0.0.1:8000/api` consistently  
✅ **Frontend Server:** Running on `localhost:5173`  
✅ **Backend Server:** Running on `127.0.0.1:8000` (confirmed)  
❌ **API Authentication:** Still receiving 401 errors

## Console Evidence

```
✅ Login successful: Object
❌ 127.0.0.1:8000/api/admin/dashboard/overview:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
❌ 127.0.0.1:8000/api/admin/users?page=1&limit=100:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

This shows:
- ✅ Login API works (user gets authenticated)
- ❌ Subsequent admin API calls fail with 401
- ✅ Graceful fallback is working (mock data is displayed)

## Possible Root Causes

### 1. Token Storage/Retrieval Issue
- Token might not be saved correctly after login
- Token might be in wrong format
- localStorage might have issues

### 2. Backend Authentication Middleware
- Laravel API might have changed auth requirements
- Admin routes might need specific middleware
- Token verification might be failing on backend

### 3. Request Format Issues
- Headers might not be formatted correctly
- Authorization header might not be sent properly
- CORS issues between frontend and backend

### 4. Token Expiration
- Token might expire immediately after login
- Session timeout might be too short

## Investigation Tools

### Debug Function Available
Run in browser console:
```javascript
debugAuth()
```

This will check:
- ✅ Token exists in localStorage
- ✅ Token format is valid
- ✅ User data is correct
- 🔍 Test direct API call with current token

### Manual Verification Steps

1. **Check localStorage:**
   ```javascript
   console.log('Token:', localStorage.getItem('token'))
   console.log('User:', localStorage.getItem('user'))
   ```

2. **Test API manually:**
   ```javascript
   // In browser console after login
   fetch('http://127.0.0.1:8000/api/admin/dashboard/overview', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token'),
       'Accept': 'application/json'
     }
   }).then(r => console.log('Status:', r.status))
   ```

3. **Check Laravel logs:**
   - Check `storage/logs/laravel.log` for authentication errors
   - Look for token validation failures

## Next Steps

1. 🔍 **Run debugAuth()** in console to identify exact issue
2. 🔍 **Check Laravel backend logs** for authentication failures
3. 🔍 **Verify token format** matches Laravel Sanctum expectations
4. 🔍 **Test API endpoints directly** via Postman/curl
5. 🔧 **Fix based on findings**

## Solutions to Try

### If Token Issues:
- Clear localStorage and login again
- Check AuthContext token saving logic
- Verify token format (Laravel Sanctum uses `id|token` format)

### If Backend Issues:
- Check Laravel middleware configuration
- Verify API routes are protected correctly
- Check database sanctum tokens table

### If CORS Issues:
- Verify Laravel CORS configuration
- Check if backend allows requests from localhost:5173

---

**Current Action:** Use debug tools to identify exact cause of 401 errors.
