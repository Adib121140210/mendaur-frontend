# 🔍 RESET PASSWORD TOKEN DEBUGGING
**Mendaur - Token Field Name Investigation**  
**Date:** December 25, 2025

---

## ✅ PROGRESS SO FAR

### **Working Steps:**
1. ✅ Send OTP → 200 OK
2. ✅ Verify OTP → 200 OK  
3. ✅ Token received: `2p4442UCrLiVAiQdZPgRyc2xY1TPNIqH1oBbq4wHAj1F3Zr0RR6qAZoo7nzB`
4. ❌ Reset Password → 400 Bad Request

### **Current Error:**
```
Status: 400
Message: "Token reset tidak valid atau sudah kedaluwarsa"
```

---

## 🔍 TRIED FIELD NAMES

### **Attempt 1: `reset_token`**
```javascript
{
  email: "adibraihan123@gmail.com",
  reset_token: "2p4442UCr...",
  password: "Password123!",
  password_confirmation: "Password123!"
}
```
**Result:** ❌ 400 - Token tidak valid

### **Attempt 2: `token`** (Current)
```javascript
{
  email: "adibraihan123@gmail.com",
  token: "2p4442UCr...",
  password: "Password123!",
  password_confirmation: "Password123!"
}
```
**Result:** Testing...

---

## 🎯 POSSIBLE SOLUTIONS

### **Option 1: Different Field Name**

Backend might expect:
- `otp` (original OTP code)
- `verification_token`
- `password_reset_token`
- `code`

### **Option 2: Bearer Token in Header**

```javascript
fetch("http://127.0.0.1:8000/api/reset-password", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`  // ⬅️ Token in header
  },
  body: JSON.stringify({
    email: "...",
    password: "...",
    password_confirmation: "..."
  })
});
```

### **Option 3: Send Both Token and OTP**

```javascript
{
  email: "adibraihan123@gmail.com",
  token: "2p4442UCr...",  // From verify response
  otp: "605523",           // Original OTP code
  password: "Password123!",
  password_confirmation: "Password123!"
}
```

### **Option 4: Single-Step Reset (Skip Verify)**

Some Laravel implementations combine verify + reset in one call:

```javascript
// Skip verify-otp endpoint entirely
// Send directly to reset-password with OTP
{
  email: "adibraihan123@gmail.com",
  otp: "605523",
  password: "Password123!",
  password_confirmation: "Password123!"
}
```

---

## 🔧 BACKEND INSPECTION NEEDED

### **Check Laravel Controller:**

**File:** `app/Http/Controllers/Auth/ForgotPasswordController.php` or similar

```php
public function resetPassword(Request $request) {
    $validated = $request->validate([
        'email' => 'required|email',
        'token' => 'required',  // ⬅️ What field name?
        'password' => 'required|min:8|confirmed'
    ]);
    
    // Check token validity
    $passwordReset = DB::table('password_resets')
        ->where('email', $validated['email'])
        ->where('token', $validated['token'])  // ⬅️ What column?
        ->where('expires_at', '>', now())
        ->first();
        
    if (!$passwordReset) {
        return response()->json([
            'success' => false,
            'message' => 'Token reset tidak valid atau sudah kedaluwarsa'
        ], 400);
    }
    
    // Reset password...
}
```

### **Check Database Schema:**

```sql
-- What column stores the token?
DESCRIBE password_resets;
-- Possible columns:
-- - token
-- - reset_token  
-- - otp
-- - verification_code
```

### **Check Token Lifecycle:**

```sql
-- After verify OTP, check database
SELECT * FROM password_resets 
WHERE email = 'adibraihan123@gmail.com' 
ORDER BY created_at DESC LIMIT 1;

-- Expected columns:
-- id | email | token | otp | expires_at | verified_at | is_used
```

---

## 🧪 TESTING MATRIX

| Attempt | Field Name | Token Value | Result |
|---------|-----------|-------------|--------|
| 1 | `reset_token` | Long hash | ❌ 400 |
| 2 | `token` | Long hash | Testing... |
| 3 | `otp` | 605523 | To try |
| 4 | Both `token` + `otp` | Both | To try |
| 5 | Bearer header | Long hash | To try |

---

## 💡 RECOMMENDED NEXT STEPS

### **Step 1: Check Database After Verify**

```sql
SELECT * FROM password_resets 
WHERE email = 'adibraihan123@gmail.com';
```

**Look for:**
- Is token stored in database?
- What column name? (`token`, `reset_token`, etc.)
- Is token still valid? (`is_used = false`, `expires_at > NOW()`)

### **Step 2: Check Laravel Validation Rules**

Look at backend error logs:
```bash
tail -f storage/logs/laravel.log
```

### **Step 3: Try All Variations**

We'll try each field name combination until one works.

---

## 🔄 AUTO-FIXING STRATEGY

We can try multiple field names automatically:

```javascript
// Try field variations in order
const fieldVariations = [
  'token',
  'reset_token', 
  'otp',
  'verification_token',
  'password_reset_token',
  'code'
];

for (const fieldName of fieldVariations) {
  const payload = {
    email: email,
    [fieldName]: tokenToUse,
    password: newPassword,
    password_confirmation: confirmPassword
  };
  
  const response = await fetch('/api/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  if (response.ok) {
    console.log(`Success with field: ${fieldName}`);
    break;
  }
}
```

---

## 📋 INFORMATION NEEDED

To fix this properly, please provide:

1. **Backend Controller Code:**
   - `ForgotPasswordController.php` or similar
   - Specifically the `resetPassword()` method

2. **Database Schema:**
   ```sql
   SHOW CREATE TABLE password_resets;
   ```

3. **Current Database Record:**
   ```sql
   SELECT * FROM password_resets 
   WHERE email = 'adibraihan123@gmail.com' 
   ORDER BY created_at DESC LIMIT 1;
   ```

4. **Backend Logs:**
   ```bash
   tail -20 storage/logs/laravel.log
   ```

---

## 🎯 QUICK TEST COMMANDS

### **Test 1: Try `token` field**
Already implemented, testing now.

### **Test 2: Try original OTP instead**
```javascript
{
  email: "adibraihan123@gmail.com",
  otp: "605523",  // Original OTP from email
  password: "Password123!",
  password_confirmation: "Password123!"
}
```

### **Test 3: Try Bearer token**
```javascript
headers: {
  "Authorization": "Bearer 2p4442UCr..."
}
body: {
  email: "...",
  password: "...",
  password_confirmation: "..."
}
```

---

**End of Debug Guide**  
**Last Updated:** December 25, 2025
