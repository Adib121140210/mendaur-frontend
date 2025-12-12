# 🔴 DASHBOARD API ERRORS - BACKEND DEBUGGING NEEDED
**Date:** December 12, 2025  
**Status:** 🔴 CRITICAL - Login works but dashboard fails  
**User:** Nasabah (user_id: 3)

---

## 📋 Error Summary

Login is **successful** ✅, but the dashboard page encounters **4 API 500 errors**:

```
❌ GET /api/dashboard/stats/{userId}           → 500 Internal Server Error
❌ GET /api/dashboard/leaderboard              → 500 Internal Server Error  
❌ GET /api/users/{userId}/badges              → 500 Internal Server Error
❌ GET /api/users/{userId}/aktivitas           → 500 Internal Server Error
```

---

## 🔍 What Works

```
✅ Login endpoint: POST /api/login
   - Returns user object with user_id: 3
   - Returns token successfully
   - Returns role: "nasabah"
   - Returns 17 permissions
   - Frontend receives and stores correctly

✅ Authentication: Bearer token stored and sent
✅ Frontend: Correctly using user_id (not id)
```

---

## ❌ What Fails - API Endpoints

### Error 1: Dashboard Stats
```
Endpoint: GET /api/dashboard/stats/3
User ID: 3 (nasabah)
Status: 500 Internal Server Error
Response: {"message": "SQLSTATE[42S22]: Column not found: 1054 Unknown column..."}
```

**Likely Cause:** Similar to the `roles.role_id` issue - backend is trying to query a column that doesn't exist in one of the related tables (probably `user_badges` or similar).

### Error 2: Dashboard Leaderboard
```
Endpoint: GET /api/dashboard/leaderboard
Status: 500 Internal Server Error
```

**Likely Cause:** Querying leaderboard data (probably stats aggregation) is hitting a missing column.

### Error 3: User Badges
```
Endpoint: GET /api/users/3/badges
Status: 500 Internal Server Error
```

**Likely Cause:** The `user_badges` relationship or query is looking for a column using wrong field name.

### Error 4: User Activities
```
Endpoint: GET /api/users/3/aktivitas
Status: 500 Internal Server Error
```

**Likely Cause:** The `log_aktivitas` or `log_user_activity` query has a column name mismatch.

---

## 🧪 Test Sequence (What We Tested)

```
1. ✅ Navigated to login page
2. ✅ Entered nasabah@mendaur.id / password123
3. ✅ Login successful (user_id: 3, role: nasabah)
4. ✅ Redirected to /home
5. ❌ Home page tried to load dashboard data
6. ❌ 4 API endpoints returned 500 errors
```

---

## 📝 Frontend Code is Correct

The frontend is calling the right endpoints with correct headers:

```javascript
// Line 33 - Correctly gets user_id
const userId = user?.user_id || localStorage.getItem('id_user');

// Line 61 - Dashboard stats endpoint
GET /api/dashboard/stats/${userId}

// Line 77 - Leaderboard endpoint  
GET /api/dashboard/leaderboard

// Line 88 - User badges endpoint
GET /api/users/${userId}/badges

// Line 99 - User activities endpoint
GET /api/users/${userId}/aktivitas
```

**Frontend is working correctly.** The errors are all on the backend.

---

## 🔧 Backend Investigation Needed

### Step 1: Check Backend Logs
```bash
# Check Laravel error logs for exact SQL error
tail -f storage/logs/laravel.log

# Look for SQLSTATE[42S22] errors
# "Unknown column" messages
```

### Step 2: Verify These Models/Controllers

Likely files with issues (similar to Role model):

1. **DashboardController.php** - Stats and leaderboard methods
   - Check query for missing columns
   - Likely uses relationships with wrong primary key names

2. **User Model relationships**
   - `badges()` relationship
   - `activities()` or `aktivitas()` relationship
   - Check if relationships use correct primary key fields

3. **UserBadge Model**
   - Check if primary key is configured correctly
   - Check if relationships reference correct columns

4. **LogAktivitas Model**
   - Check if `log_user_activity` table exists
   - Check if primary key is `log_user_activity_id`
   - Check if relationships are correct

### Step 3: Check Relationship Definitions

Look for patterns like the previous issue:

```php
// ❌ WRONG - Model has wrong primary key
protected $primaryKey = 'user_badge_id';

// But table might use 'id' or different key name
```

All relationships should use custom primary key names:
- `user_id` (not `id`)
- `badge_id` (not `id`)
- `log_user_activity_id` (not `id`)
- etc.

### Step 4: Check if Columns Exist

```bash
# Check users table
mysql> DESCRIBE users;
# Should have: user_id, id, email, role_id, etc.

# Check user_badges table  
mysql> DESCRIBE user_badges;
# Should have: user_badge_id, user_id, badge_id, etc.

# Check log_aktivitas table
mysql> DESCRIBE log_aktivitas;
# Should have: log_user_activity_id or similar
```

---

## 📊 Pattern Recognition

This is the **same type of error** as the previous `roles.role_id` issue:

```
Previous:  Model says PRIMARY KEY = 'role_id' but table has PRIMARY KEY = 'id'
           Query: SELECT * FROM roles WHERE roles.role_id IN (2)
           Error: Unknown column 'role_id'

Current:   Similar issue in dashboard/badge/activity queries
           Need to identify which model/table has mismatch
```

---

## 🔗 Affected Features

While login works, these pages **will not load**:

- ❌ Home/Dashboard (all 4 APIs fail)
- ❌ Profile → Badges section (badges API fails)
- ❌ Profile → Activity section (aktivitas API fails)
- ❌ Leaderboard (if used on dashboard)

---

## 📋 Debugging Checklist for Backend Team

- [ ] Check backend logs for exact SQL error message
- [ ] Identify which model/controller returns 500 error
- [ ] Find the SQL query causing the error
- [ ] Check if model's `$primaryKey` matches table structure
- [ ] Verify all relationships use correct column names
- [ ] Run migrations to ensure all tables exist with correct columns
- [ ] Test endpoints with curl/Postman
- [ ] Clear backend cache: `php artisan cache:clear`
- [ ] Restart backend server

---

## ✅ To Fix This

The backend team should:

1. **Get exact error** from `storage/logs/laravel.log`
2. **Identify the model** causing the error
3. **Check `protected $primaryKey`** in that model
4. **Verify table structure** matches the model
5. **Fix the mismatch** (like was done for Role model)
6. **Test the endpoint** with curl
7. **Report back** which file was fixed

---

## 📞 Frontend Status

Frontend is **ready and correct**:
- ✅ Login works
- ✅ User_id handled correctly
- ✅ API endpoints are correct
- ✅ Error handling in place
- ✅ Waiting on backend fixes

---

**This is a backend issue. Frontend code is correct and aligned with backend specification.**

**Frontend is blocking on backend API fixes.**
