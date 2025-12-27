# 🔍 OTP VERIFICATION ERROR 400 FIX GUIDE
**Mendaur - Forgot Password OTP Troubleshooting**  
**Date:** December 25, 2025

---

## ✅ CURRENT STATUS

### **What's Working:**
- ✅ Email status check (200 OK)
- ✅ OTP sent to email successfully
- ✅ OTP input UI showing correctly
- ✅ Timer counting down (15:00)
- ✅ Success message: "Kode OTP telah dikirim ke email Anda"

### **What's Failing:**
- ❌ OTP verification returns **400 Bad Request**
- ❌ Error message: "Kode OTP tidak valid atau sudah kedaluwarsa"

---

## 🔍 PROBLEM ANALYSIS

### **Error Details:**
```
POST http://127.0.0.1:8000/api/verify-otp 400 (Bad Request)
Error: Kode OTP tidak valid atau sudah kedaluwarsa
```

### **Possible Causes:**

1. **Wrong OTP Code Entered**
   - User typed incorrect 6-digit code
   - Solution: Check email for correct OTP

2. **OTP Already Expired**
   - OTP validity: 15 minutes (900 seconds)
   - Solution: Click "Kirim Ulang" to get new OTP

3. **OTP Already Used**
   - Each OTP can only be used once
   - Solution: Request new OTP

4. **Case Sensitivity Issues**
   - Some systems use alphanumeric OTP
   - Solution: Match exact case from email

5. **Email Mismatch**
   - Email sent in verify request doesn't match OTP email
   - Solution: Check email is correctly stored in state

6. **Backend OTP Storage Issues**
   - OTP not saved properly in database
   - OTP expired immediately
   - Solution: Check backend logs and database

---

## 🛠️ DEBUGGING STEPS

### **Step 1: Check Console Output**

After clicking "Verifikasi", you should see:

```javascript
// Request sent
Verify OTP Request: {
  email: "adibraihan123@gmail.com",
  otp: "148600"  // Your 6-digit code
}

// Response received
Verify OTP Response Status: 400
Verify OTP Response Data: {
  success: false,
  message: "Kode OTP tidak valid atau sudah kedaluwarsa"
}
```

**What to Check:**
- ✓ Email is correct (matches the one OTP was sent to)
- ✓ OTP is 6 digits
- ✓ OTP matches the code in your email
- ✓ Timestamp - is it within 15 minutes?

---

### **Step 2: Verify OTP in Email**

**Check your email inbox for:**
- **Subject:** "Reset Password OTP" or similar
- **From:** Mendaur or configured sender
- **Body:** Should contain 6-digit code

**Example Email:**
```
Your OTP code is: 123456

This code will expire in 15 minutes.
```

**Important:**
- Copy the EXACT code from email
- Don't add spaces or dashes
- Check you're entering all 6 digits

---

### **Step 3: Check Backend Database**

#### **Via MySQL/phpMyAdmin:**

```sql
-- Check OTP records for your email
SELECT 
  id,
  email,
  otp,
  created_at,
  expires_at,
  is_used,
  TIMESTAMPDIFF(MINUTE, created_at, NOW()) as age_minutes,
  CASE 
    WHEN expires_at > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM password_resets
-- OR table name might be: otp_codes, forgot_password_otps, etc.
WHERE email = 'adibraihan123@gmail.com'
ORDER BY created_at DESC
LIMIT 5;
```

**What to Look For:**
- ✓ OTP exists in database
- ✓ `otp` column matches code from email
- ✓ `expires_at` is in the future
- ✓ `is_used` is 0 or false
- ✓ `created_at` is within last 15 minutes

**Example Output:**
```
id | email                   | otp    | created_at          | expires_at          | is_used | age_minutes | status
---|-------------------------|--------|---------------------|---------------------|---------|-------------|--------
5  | adibraihan123@gmail.com | 148600 | 2025-12-25 10:30:00 | 2025-12-25 10:45:00 | 0       | 2           | Valid
```

---

### **Step 4: Test with Fresh OTP**

1. **Click "Kirim Ulang"** to get new OTP
2. **Wait for email** (should arrive within seconds)
3. **Copy OTP code** from email
4. **Paste into OTP boxes** immediately
5. **Click "Verifikasi"**

**Watch Console:**
```javascript
// Should show:
Verify OTP Response Status: 200
Verify OTP Response Data: {
  success: true,
  message: "OTP berhasil diverifikasi"
}

// Then:
OTP Verified Successfully! Moving to reset step...
```

---

## 🔧 BACKEND VERIFICATION

### **Check Backend Logs**

**File:** `storage/logs/laravel.log`

Look for:
```
[2025-12-25 10:30:00] local.INFO: OTP sent to adibraihan123@gmail.com
[2025-12-25 10:30:00] local.INFO: OTP code: 148600
[2025-12-25 10:32:00] local.INFO: Verifying OTP for adibraihan123@gmail.com
[2025-12-25 10:32:00] local.ERROR: OTP verification failed: Invalid or expired OTP
```

### **Check Backend OTP Verification Logic**

**Typical Backend Code:**

```php
// ForgotPasswordController.php or similar

public function verifyOtp(Request $request) {
    $validated = $request->validate([
        'email' => 'required|email',
        'otp' => 'required|digits:6'
    ]);

    $passwordReset = DB::table('password_resets')
        ->where('email', $validated['email'])
        ->where('otp', $validated['otp'])
        ->where('expires_at', '>', now())
        ->where('is_used', false)
        ->first();

    if (!$passwordReset) {
        return response()->json([
            'success' => false,
            'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa'
        ], 400);
    }

    // OTP is valid
    return response()->json([
        'success' => true,
        'message' => 'OTP berhasil diverifikasi'
    ], 200);
}
```

**Potential Issues:**
- OTP not saved with `is_used = false`
- `expires_at` calculated incorrectly
- Email case sensitivity (use `LOWER()` comparison)
- OTP marked as used immediately after sending

---

## 🎯 COMMON FIXES

### **Fix 1: OTP Expiring Too Fast**

**Backend:** Ensure OTP validity is 15 minutes (900 seconds)

```php
// When creating OTP
DB::table('password_resets')->insert([
    'email' => $email,
    'otp' => $otp,
    'created_at' => now(),
    'expires_at' => now()->addMinutes(15), // ✅ 15 minutes
    'is_used' => false
]);
```

### **Fix 2: OTP Marked as Used Immediately**

**Backend:** Don't mark OTP as used until AFTER successful verification

```php
// ❌ WRONG - Marks used in verifyOtp
public function verifyOtp(Request $request) {
    $passwordReset = ...;
    
    // Don't mark as used here!
    // DB::table('password_resets')->where('id', $passwordReset->id)->update(['is_used' => true]);
    
    return response()->json(['success' => true]);
}

// ✅ CORRECT - Mark used in resetPassword
public function resetPassword(Request $request) {
    // First verify OTP again
    $passwordReset = ...;
    
    // Update password
    User::where('email', $request->email)->update([
        'password' => Hash::make($request->password)
    ]);
    
    // NOW mark OTP as used
    DB::table('password_resets')
        ->where('id', $passwordReset->id)
        ->update(['is_used' => true]);
    
    return response()->json(['success' => true]);
}
```

### **Fix 3: Case-Sensitive Email Comparison**

**Backend:** Use case-insensitive email matching

```php
// ❌ WRONG - Case sensitive
->where('email', $request->email)

// ✅ CORRECT - Case insensitive
->whereRaw('LOWER(email) = ?', [strtolower($request->email)])
```

### **Fix 4: Clean Up Old OTPs**

**Backend:** Delete expired OTPs before creating new ones

```php
// Clean up old/expired OTPs
DB::table('password_resets')
    ->where('email', $email)
    ->where(function($query) {
        $query->where('expires_at', '<', now())
              ->orWhere('is_used', true);
    })
    ->delete();

// Create new OTP
DB::table('password_resets')->insert([
    'email' => $email,
    'otp' => $otp,
    'created_at' => now(),
    'expires_at' => now()->addMinutes(15),
    'is_used' => false
]);
```

---

## 🧪 TESTING CHECKLIST

### **Test Case 1: Valid OTP (Happy Path)**

**Steps:**
1. Enter email: `adibraihan123@gmail.com`
2. Click "Kirim Kode OTP"
3. Check email for 6-digit code
4. Enter OTP code in UI
5. Click "Verifikasi"

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Message: "OTP berhasil diverifikasi"
- ✅ UI moves to reset password step
- ✅ Console shows: "OTP Verified Successfully! Moving to reset step..."

---

### **Test Case 2: Wrong OTP Code**

**Steps:**
1. Request OTP
2. Enter WRONG code (e.g., `000000`)
3. Click "Verifikasi"

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Error message shown: "Kode OTP tidak valid atau sudah kedaluwarsa"
- ✅ Stays on OTP verification step
- ✅ Can try again with correct code

---

### **Test Case 3: Expired OTP**

**Steps:**
1. Request OTP
2. Wait 16+ minutes
3. Enter OTP code
4. Click "Verifikasi"

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Error message: "Kode OTP tidak valid atau sudah kedaluwarsa"
- ✅ User can click "Kirim Ulang" for new OTP

---

### **Test Case 4: OTP Already Used**

**Steps:**
1. Request OTP and verify successfully
2. Complete password reset
3. Try to use same OTP again

**Expected Result:**
- ✅ Status: 400 Bad Request
- ✅ Error message: "Kode OTP tidak valid atau sudah kedaluwarsa"

---

### **Test Case 5: Resend OTP**

**Steps:**
1. Request OTP
2. Wait for timer to reach 0
3. Click "Kirim Ulang"
4. Use NEW OTP code from email

**Expected Result:**
- ✅ New OTP sent
- ✅ Old OTP invalidated
- ✅ Timer resets to 15:00
- ✅ New OTP code works for verification

---

## 📊 DATABASE SCHEMA CHECK

### **Expected Table Structure:**

**Table Name:** `password_resets` or `otp_codes`

```sql
CREATE TABLE password_resets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  INDEX idx_email_otp (email, otp),
  INDEX idx_expires_at (expires_at)
);
```

**Verify Table Exists:**
```sql
SHOW TABLES LIKE '%password%';
SHOW TABLES LIKE '%otp%';
```

**Check Table Structure:**
```sql
DESCRIBE password_resets;
```

---

## 🔄 COMPLETE FLOW VERIFICATION

### **Full Process:**

1. **Send OTP** (`POST /api/forgot-password`)
   - ✅ Response: 200 OK
   - ✅ Email sent with OTP
   - ✅ OTP saved in database

2. **Verify OTP** (`POST /api/verify-otp`)
   - ✅ Response: 200 OK
   - ✅ OTP is valid and not expired
   - ✅ Move to reset password step

3. **Reset Password** (`POST /api/reset-password`)
   - ✅ Response: 200 OK
   - ✅ Password updated in database
   - ✅ OTP marked as used
   - ✅ Show success message

4. **Login with New Password**
   - ✅ Can login successfully
   - ✅ Old password doesn't work

---

## 🎬 NEXT STEPS FOR USER

### **Immediate Actions:**

1. **Check your email** `adibraihan123@gmail.com`
2. **Find the OTP code** (6 digits)
3. **Copy the exact code**
4. **Open console** (F12) in browser
5. **Click "Kirim Ulang"** to get fresh OTP if needed
6. **Enter OTP code** in UI
7. **Click "Verifikasi"**
8. **Share console output** with me:
   ```javascript
   Verify OTP Request: {...}
   Verify OTP Response Status: 200 or 400
   Verify OTP Response Data: {...}
   ```

### **If Still Getting 400:**

**Share these details:**
1. Console output (full request/response)
2. OTP code from email
3. OTP code entered in UI
4. Database query result:
   ```sql
   SELECT * FROM password_resets 
   WHERE email = 'adibraihan123@gmail.com' 
   ORDER BY created_at DESC LIMIT 1;
   ```
5. Backend logs (last 20 lines from `storage/logs/laravel.log`)

---

## 📝 FRONTEND IMPROVEMENTS MADE

### **Added Console Logging:**

```javascript
// Before verify request
console.log('Verify OTP Request:', {
  email: "...",
  otp: "..."
});

// After response
console.log('Verify OTP Response Status:', 200);
console.log('Verify OTP Response Data:', {...});
```

### **Improved Error Handling:**

```javascript
// Handle 400 Bad Request
if (response.status === 400) {
  setErrorMsg(result.message || "Kode OTP tidak valid atau sudah kedaluwarsa");
  return;
}

// Handle 422 Validation Error
if (response.status === 422) {
  if (result.errors) {
    const firstError = Object.values(result.errors)[0];
    setErrorMsg(Array.isArray(firstError) ? firstError[0] : firstError);
  }
  return;
}

// Handle success
if (result.success || result.status === "success") {
  console.log('OTP Verified Successfully! Moving to reset step...');
  setStep('reset');
}
```

### **Better Success Feedback:**

```javascript
// Clear errors on success
setErrorMsg("");

// Show success message
setSuccessMsg("Kode OTP berhasil diverifikasi");

// Move to next step
setStep('reset');
```

---

## ✅ SUCCESS INDICATORS

You'll know it's working when:

1. ✅ Console shows: `Verify OTP Response Status: 200`
2. ✅ Console shows: `OTP Verified Successfully! Moving to reset step...`
3. ✅ Green success message appears
4. ✅ UI shows step 3 (Reset Password)
5. ✅ Can enter new password
6. ✅ No red error message

---

**End of Guide**  
**Last Updated:** December 25, 2025

**Quick Debugging Command:**
```sql
-- Check latest OTP for your email
SELECT * FROM password_resets 
WHERE email = 'adibraihan123@gmail.com' 
ORDER BY created_at DESC LIMIT 1;
```
