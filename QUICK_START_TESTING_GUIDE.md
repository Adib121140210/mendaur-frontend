# 🧪 QUICK START TESTING GUIDE
**Status:** ✅ Frontend Ready - Backend Ready  
**Date:** December 12, 2025

---

## 📋 Pre-Testing Setup

### 1. Clear Browser Cache
```
1. Open DevTools: F12
2. Go to Application/Storage tab
3. Clear localStorage:
   - Remove 'user'
   - Remove 'token'
   - Remove 'role'
   - Remove 'roleData'
   - Remove 'id_user'
4. Hard refresh page: Ctrl+Shift+R
```

### 2. Check Backend is Running
```bash
# Backend should be running on port 8000
curl http://127.0.0.1:8000/api/jadwal-penyetoran
# Should return schedule data
```

### 3. Check Frontend is Running
```bash
# Frontend should be running on port 5173
# Check browser console: F12 → Console
# Should show no major errors
```

---

## 🚀 Test 1: Admin Login (5 minutes)

### Steps:
1. Click "Login" button
2. Enter credentials:
   - **Email:** `admin@mendaur.id`
   - **Password:** `password123`
3. Click "Login"

### Expected Results:
```javascript
✅ Page redirects to /home or /admin-dashboard
✅ No 500 error
✅ Browser console shows:
   - "✅ Login successful"
   - userId: 2 (or higher)
   - role: "admin"
   - permissions: [array with 40+ items]
✅ localStorage contains:
   - user.user_id: 2 (not user.id)
   - token: "eyJ0eXAi..." (JWT token)
   - role: "admin"
```

### If Failed:
- Check backend logs: `php artisan tinker` → `Role::all()`
- Verify Role model has: `protected $primaryKey = 'id';`
- Clear backend cache: `php artisan cache:clear`

---

## 🚀 Test 2: Nasabah Login (5 minutes)

### Steps:
1. Click "Logout" (if logged in as admin)
2. Click "Login"
3. Enter credentials:
   - **Email:** `nasabah@mendaur.id`
   - **Password:** `password123`
4. Click "Login"

### Expected Results:
```javascript
✅ Page redirects to /home
✅ No 500 error
✅ Browser console shows:
   - "✅ Login successful"
   - userId: 3 (or different from admin)
   - role: "nasabah"
   - permissions: [array with 17 items]
```

---

## 🚀 Test 3: Verify User Data (3 minutes)

### After Login:
1. Open DevTools: F12 → Console
2. Run command:
```javascript
// Check stored user data
const user = JSON.parse(localStorage.getItem('user'));
console.log('User ID:', user.user_id);
console.log('User Name:', user.nama);
console.log('User Role:', user.role?.nama_role || user.role);
```

### Expected Output:
```javascript
User ID: 2 (or 3)
User Name: Admin User (or Nasabah User)
User Role: admin (or nasabah)
```

---

## 🚀 Test 4: Load Schedules (3 minutes)

### Steps:
1. Click on "Tabung Sampah" in navigation
2. Click "Setor Sampah Sekarang" button
3. Form should appear with schedule dropdown

### Expected Results:
```javascript
✅ Form loads without error
✅ Browser console shows:
   - "🔍 Jadwal dari API: [array of schedules]"
   - Each schedule has "jadwal_penyetoran_id" field
✅ Schedule dropdown shows 2-3 options
```

### If Schedules Don't Show:
```javascript
// Check in console what fields API returned
fetch('http://127.0.0.1:8000/api/jadwal-penyetoran')
  .then(r => r.json())
  .then(d => console.log(d.data[0]))
  // Should show: {jadwal_penyetoran_id: 1, tanggal: "...", ...}
```

---

## 🚀 Test 5: Form Submission (10 minutes)

### Prerequisites:
- Logged in as nasabah
- On Tabung Sampah page
- Form is visible with schedules loaded

### Steps:
1. Form should **auto-fill:**
   - Nama: "Nasabah User"
   - No HP: (from user data)
   - Lokasi: (auto-detected or can enter manually)

2. **Select Schedule:**
   - Click dropdown and select a schedule
   - Check browser console - should show:
     ```javascript
     Selected schedule: {jadwal_penyetoran_id: 1, tanggal: "2025-12-15", ...}
     Schedule ID to send (jadwal_penyetoran_id): 1
     ```

3. **Select Category:**
   - Click waste type category
   - Should highlight

4. **Upload Photo:**
   - Click file upload
   - Select an image

5. **Submit:**
   - Click "Kirim" button

### Expected Results:
```javascript
✅ HTTP 201 Created response
✅ Browser console shows:
   - Sending user_id: 3
   - Schedule ID to send (jadwal_penyetoran_id): 1
   - Response status: 201
   - Success message in alert
✅ Form closes automatically
```

### Form Data Sent Should Look Like:
```
user_id: 3
jadwal_penyetoran_id: 1
nama_lengkap: "Nasabah User"
no_hp: "08123456789"
titik_lokasi: "https://www.google.com/maps?q=-6.2088,106.8456"
jenis_sampah: "Plastik" (or selected category)
foto_sampah: [File object]
```

### If Form Submission Fails:
```javascript
// Check console for specific error
// Common issues:
1. "Missing user_id" → Check if user logged in properly
2. "Missing jadwal_penyetoran_id" → Schedule not selected
3. "Validation failed" → Missing required field
4. "401 Unauthorized" → Token expired, logout and login again
```

---

## 🚀 Test 6: Verify Deposit in History (5 minutes)

### Steps:
1. Go to "Riwayat Tabung" or "History" page
2. Should see the deposit you just submitted

### Expected:
```javascript
✅ Your new deposit appears in list
✅ Shows correct schedule
✅ Shows correct status (pending)
✅ Shows correct date/time
```

---

## 🚀 Test 7: Admin Features (5 minutes)

### Prerequisites:
- Logged in as admin

### Steps:
1. Look for "Admin Dashboard" or "Kelola Penyetoran"
2. Should see list of all deposits (not just yours)
3. Try to approve/reject a deposit

### Expected:
```javascript
✅ Can see all users' deposits
✅ Can approve/reject deposits
✅ Status updates after approval
```

---

## 📊 Testing Checklist

### Core Functionality
- [ ] Admin login works
- [ ] Nasabah login works
- [ ] User data stored with correct `user_id` field
- [ ] Schedules load from API
- [ ] Schedule dropdown shows `jadwal_penyetoran_id`
- [ ] Form auto-fills user data
- [ ] Photo upload works
- [ ] Form submission sends correct field names
- [ ] HTTP 201 response received
- [ ] Deposit appears in history

### RBAC & Permissions
- [ ] Admin has 40 permissions
- [ ] Nasabah has 17 permissions
- [ ] Permission-based features work (if implemented)

### Data Integrity
- [ ] Correct `user_id` in submitted data
- [ ] Correct `jadwal_penyetoran_id` in submitted data
- [ ] Database record created with correct values
- [ ] No duplicate submissions

### Error Handling
- [ ] Missing field shows validation error
- [ ] Invalid token shows login redirect
- [ ] Network error shows retry option
- [ ] Server error shows helpful message

---

## 🔍 Browser Console Commands

### Check User Data:
```javascript
console.log(JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));
```

### Check Schedule Structure:
```javascript
fetch('http://127.0.0.1:8000/api/jadwal-penyetoran')
  .then(r => r.json())
  .then(d => d.data.forEach(s => 
    console.log(`Schedule ${s.jadwal_penyetoran_id}: ${s.tanggal} ${s.jam}`)
  ));
```

### Check Last Form Submission:
```javascript
// Open Network tab in DevTools
// Look for POST request to /api/tabung-sampah
// Click on it → Request → Form Data
// Should show:
// - user_id: 3
// - jadwal_penyetoran_id: 1
// - nama_lengkap: ...
// - etc
```

---

## 📝 Notes for Testing

### Key Fields to Verify:
1. **user_id** - MUST be from `userData.user_id`, not `userData.id`
2. **jadwal_penyetoran_id** - MUST be the schedule's custom primary key
3. **Token** - MUST be included in Authorization header for authenticated requests

### Common Errors to Watch For:
```
❌ "Unknown column 'roles.role_id'" → Backend Role model issue
❌ "user_id is required" → Frontend not sending user_id
❌ "jadwal_penyetoran_id is required" → Schedule not selected or wrong field name
❌ "401 Unauthorized" → Token missing or expired
❌ "500 Internal Server Error" → Backend validation issue
```

### Success Indicators:
```
✅ HTTP 201 response from form submission
✅ No console errors
✅ Data appears in history
✅ All required fields sent correctly
✅ User_id matches logged-in user
```

---

## 🚀 Quick Test Loop (30 minutes total)

```
1. Clear cache (1 min)
2. Admin login (5 min)
3. Load schedules (3 min)
4. Form submission (10 min)
5. Check history (5 min)
6. Logout & nasabah login (3 min)
7. Repeat form test (3 min)
```

---

## ⚠️ If Something Breaks

### Backend Issues:
```bash
# Restart backend
php artisan serve

# Clear cache
php artisan cache:clear

# Check logs
tail -f storage/logs/laravel.log
```

### Frontend Issues:
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R

# Check console errors: F12 → Console
# Check network requests: F12 → Network
```

### Database Issues:
```bash
# Check if migrations ran
php artisan migrate:status

# Re-seed data
php artisan db:seed
```

---

**Everything is ready. Let's test! 🚀**
