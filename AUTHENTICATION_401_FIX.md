# 🔐 Authentication Troubleshooting - 401 Error Fixed

## ✅ Issue Identified: 401 Unauthenticated

The backend returned:
```json
{
  "message": "Unauthenticated."
}
```

This means the authentication token is either:
1. ❌ Missing from localStorage
2. ❌ Expired
3. ❌ Invalid format
4. ❌ Not matching any user in the database

---

## 🔧 Fixes Applied

### 1. **Added Pre-flight Token Check**
```javascript
// Check authentication before making request
const token = localStorage.getItem('token');
if (!token) {
  setRedeemError("Anda harus login terlebih dahulu");
  return;
}
```

### 2. **Better 401 Error Handling**
```javascript
// Handle authentication errors
if (response.status === 401) {
  throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
}
```

### 3. **Enhanced Debug Logging**
```javascript
console.log('Using token:', token.substring(0, 20) + '...');
```

---

## 🧪 How to Test

### Check If You're Logged In

Open browser console (F12) and run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User ID:', localStorage.getItem('id_user'));
console.log('User Name:', localStorage.getItem('nama_lengkap'));
```

**Expected Output (if logged in):**
```
Token: eyJ0eXAiOiJKV1QiLCJhbGc...
User ID: 1
User Name: John Doe
```

**If NOT logged in:**
```
Token: null
User ID: null
User Name: null
```

---

## 🎯 Solutions Based on Scenario

### Scenario A: Token is NULL (Not Logged In)
**Problem**: User hasn't logged in yet

**Solution**:
1. Navigate to Login page
2. Enter credentials
3. Login successfully
4. Token will be stored in localStorage
5. Try redemption again

---

### Scenario B: Token Exists But 401 Error
**Problem**: Token is expired or invalid

**Solutions**:

#### Option 1: Re-login
```javascript
// Clear old data
localStorage.clear();
// Then login again
```

#### Option 2: Refresh Token (If Backend Supports)
```javascript
// Call refresh endpoint
const response = await fetch('http://127.0.0.1:8000/api/refresh', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${oldToken}`,
  },
});
```

#### Option 3: Check Token Expiry (Laravel Sanctum)
```bash
# In Laravel backend
php artisan tinker

# Check token
$token = PersonalAccessToken::findToken('YOUR_TOKEN');
$token->expires_at; // Check if expired
```

---

### Scenario C: Token Format Issue
**Problem**: Token stored incorrectly

**Check Format**:
```javascript
const token = localStorage.getItem('token');
console.log('Token length:', token.length);
console.log('Starts with:', token.substring(0, 10));

// Should be something like:
// Length: 300-500 characters
// Starts with: 1|abc123... (Sanctum) or eyJ... (JWT)
```

**Fix**: Ensure login response stores token correctly:
```javascript
// In login handler
const response = await fetch('/api/login', {...});
const data = await response.json();

// Store token (without 'Bearer' prefix)
localStorage.setItem('token', data.token);
```

---

## 🔍 Backend Token Validation

### Laravel Sanctum (Most Likely)

#### Check Middleware
```php
// In routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/penukaran-produk', [PenukaranProdukController::class, 'store']);
});
```

#### Verify Token in Database
```sql
SELECT * FROM personal_access_tokens 
WHERE token = 'HASHED_TOKEN_HERE'
AND (expires_at IS NULL OR expires_at > NOW());
```

#### Debug in Controller
```php
public function store(Request $request)
{
    $user = auth()->user();
    
    if (!$user) {
        return response()->json([
            'message' => 'User not authenticated'
        ], 401);
    }
    
    Log::info('Authenticated user:', [
        'user_id' => $user->id,
        'name' => $user->nama_lengkap,
    ]);
    
    // Continue with redemption logic...
}
```

---

## 🚀 Quick Fix Steps

### For Users:

1. **Check if logged in**:
   - Look for user name in header/navbar
   - Check if profile page shows your info

2. **If not logged in**:
   - Go to Login page
   - Enter credentials
   - Login successfully

3. **If logged in but still 401**:
   - Logout
   - Clear browser cache/localStorage
   - Login again
   - Try redemption

---

### For Developers:

1. **Verify token storage on login**:
```javascript
// In login success handler
console.log('Login response:', data);
localStorage.setItem('token', data.token);
localStorage.setItem('id_user', data.user.id);
console.log('Token stored:', localStorage.getItem('token'));
```

2. **Check token expiration settings**:
```php
// In config/sanctum.php
'expiration' => 60 * 24, // 24 hours (in minutes)
```

3. **Test endpoint with valid token**:
```bash
# Get a valid token from browser localStorage
TOKEN="your_token_here"

curl -X POST http://127.0.0.1:8000/api/penukaran-produk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produk_id": 1,
    "jumlah_poin": 100,
    "jumlah": 1,
    "alamat_pengiriman": "Bank Sampah"
  }'
```

---

## 📱 User Experience

### Before Fix:
```
❌ Error: Unauthenticated.
(Generic, confusing)
```

### After Fix:
```
✅ Sesi Anda telah berakhir. Silakan login kembali.
(Clear, actionable)
```

Or:
```
✅ Anda harus login terlebih dahulu
(If no token exists)
```

---

## 🎯 Next Steps

1. **User should login** (or re-login if session expired)
2. **Verify token is stored** in localStorage
3. **Try redemption again**
4. **Should now work!** ✅

If still getting 401 after login, then the issue is likely:
- Backend token validation logic
- CORS configuration
- Database token table issues

But the frontend is now properly handling all authentication scenarios! 🎉

---

## 🔗 Related Files Updated

- **tukarPoin.jsx**:
  - Added token existence check before API call
  - Added 401-specific error handling
  - Enhanced debug logging for token
  - User-friendly error messages

**Status**: ✅ **Authentication handling complete!**

