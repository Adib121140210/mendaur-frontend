# 🔴 BACKEND ROLES MODEL CONFIGURATION ISSUE - STILL NOT FIXED

## The Error (Still Occurring)
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'roles.role_id' in 'where clause'
SQL: select * from `roles` where `roles`.`role_id` in (2)
```

## Root Cause
**The Role model in the backend is configured with wrong primary key.**

The `roles` table has:
- ✅ `id` (primary key - this is what should be used)
- ❌ NO `role_id` column

But the Role model thinks the primary key is `role_id`, causing it to query the wrong column.

---

## What's Happening

### Login Flow Error:
```
1. User enters admin credentials
2. Backend authenticates user
3. Backend tries to load user's roles
4. Laravel runs: SELECT * FROM roles WHERE roles.role_id IN (2)
   ❌ ERROR: Unknown column 'role_id' in roles table!
   ✅ Should run: SELECT * FROM roles WHERE roles.id IN (2)
5. Admin login fails with 500 error
```

### The Problem:
The Role model is incorrectly configured:
```php
// app/Models/Role.php (WRONG)
class Role extends Model {
    protected $primaryKey = 'role_id';  // ❌ WRONG!
    // Tells Laravel to use 'role_id' as primary key
    // But roles table has 'id' as primary key!
}
```

---

## Solution: Backend Team Must Fix IMMEDIATELY

### Fix: Update Role Model Configuration
---

## Backend Fix Required

### The Problem Code (Backend)
```php
// app/Models/Role.php
class Role extends Model {
    protected $primaryKey = 'role_id';  // ❌ WRONG!
    public $incrementing = false;
    protected $keyType = 'int';
}
```

The model is telling Laravel: "The primary key of roles table is 'role_id'"
But the actual table has `id` as the primary key!

### The Correct Code (Backend)
```php
// app/Models/Role.php
class Role extends Model {
    protected $primaryKey = 'id';       // ✅ CORRECT!
    public $incrementing = true;
    protected $keyType = 'int';
}
```

Or simply use the default (even better):
```php
// app/Models/Role.php
class Role extends Model {
    // Don't define primaryKey - Laravel defaults to 'id'
    // Just remove the incorrect line!
}
```

---

## Action Items for Backend Team

### Step 1: Check Current Role Model
```bash
# SSH to backend
cat app/Models/Role.php
```

Look for:
```php
protected $primaryKey = 'role_id';  // ← If this exists, it's the problem!
```

### Step 2: Fix the Model
**Simply remove the incorrect primaryKey line:**

```php
// app/Models/Role.php
class Role extends Model {
    use HasFactory;
    
    // ❌ DELETE/COMMENT OUT THIS:
    // protected $primaryKey = 'role_id';
    
    // Laravel will now use default 'id'
    // ✅ Problem solved!
}
```

### Step 3: Test
```bash
php artisan tinker
>>> Role::find(2);           # Should return admin role
>>> Role::where('id', 2)->get();  # Should work
```

### Step 4: Commit & Deploy
```bash
git add app/Models/Role.php
git commit -m "fix: Use correct primary key 'id' in Role model

The roles table uses 'id' as primary key, not 'role_id'.
Removed incorrect primaryKey configuration."
git push origin main
```

---

## Frontend Status
✅ **Frontend is working correctly**
- Login form is ready
- Authentication flow is correct
- All frontend code is fine

❌ **Backend Role model is misconfigured**
- Uses wrong primary key configuration
- Admin login fails
- Role association broken

---

## Verification Commands (Backend Team)

```bash
# SSH to backend and run:
php artisan tinker

# Check what primary key the model is using
>>> Role::getKeyName()  # Should return 'id', not 'role_id'

# Test queries work
>>> Role::find(2);  # Should return the admin role
>>> Role::where('id', 2)->first();

# Check actual table structure
>>> Schema::getColumnListing('roles');  # Lists all columns in table
# Output should include: ['id', 'nama_role', ...]
```

---

## Why This Happened

The backend developer probably:
1. ✅ Created `roles` table with `id` as primary key (correct)
2. ❌ Added `role_id` as a separate column for references (probably unnecessary)
3. ❌ Mistakenly configured the model to use `role_id` as primary key (wrong!)

Result: Model and table are out of sync!

---

## Quick Fix Timeline

1. **Locate Role model:** 2 minutes
2. **Remove bad config:** 1 minute
3. **Test locally:** 5 minutes
4. **Deploy:** 2 minutes
5. **Total:** ~10 minutes

---

## Status
- **Database table:** ✅ CORRECT (has `id` column as PK)
- **Users table:** ✅ CORRECT (has `id` and `role_id` columns)
- **Role model:** 🔴 **MISCONFIGURED** (wrong primaryKey setting)
- **Admin login:** ❌ BLOCKED by Role model issue

---

**Last Updated:** 2025-12-12  
**Priority:** 🔴 CRITICAL - Blocking admin login  
**Root Cause:** Model configuration, not database  
**ETA to Fix:** 10 minutes  
**Assigned To:** Backend Team


If these tables use non-standard primary key names, they need fixes too.

---

## Comprehensive Fix Required

Backend team should standardize ALL tables to use `id` as primary key:

```bash
# Find all tables with non-standard primary keys
SELECT TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'mendaur' 
AND COLUMN_KEY = 'PRI' 
AND COLUMN_NAME != 'id';
```

### Tables to Check and Fix:
- [ ] users (has `user_id` - NEEDS FIX)
- [ ] roles (has `role_id` - NEEDS FIX)
- [ ] permissions (has `permission_id`? - CHECK)
- [ ] categories (has `category_id`? - CHECK)
- [ ] jadwal_penyetorans (has `jadwal_penyetoran_id` - might be OK)
- [ ] tabung_sampah (has `id` - OK)

---

## Frontend Status

✅ **Frontend is working correctly**
- Login form displays
- Form validation works
- Error handling displays error messages

❌ **Backend database has multiple issues**
- Users table: `user_id` instead of `id`
- Roles table: `role_id` instead of `id`
- Other tables likely have same problem

---

## Action Items for Backend Team

**PRIORITY: CRITICAL**

1. [ ] Run diagnostic query to find all tables with non-standard primary keys
2. [ ] Identify which tables need to be fixed
3. [ ] Create migration to rename all primary keys to `id`
4. [ ] Update all Model files to use correct primary key
5. [ ] Test all login flows (nasabah, admin, superadmin)
6. [ ] Redeploy backend
7. [ ] Verify form submissions work

---

## SQL Script to Find All Issues

```sql
-- Find all tables with non-standard primary keys
SELECT TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'mendaur' 
AND COLUMN_KEY = 'PRI' 
AND COLUMN_NAME NOT IN ('id', 'user_id');

-- This will show which tables need fixing
```

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Login | ✅ Ready | Form works |
| Frontend Validation | ✅ Working | Error messages display |
| **Backend Auth** | ❌ BROKEN | Can't load roles |
| **Backend DB** | ❌ BROKEN | Multiple primary key issues |
| Admin Login | ❌ Blocked | Roles table issue |
| Nasabah Login | ❌ Blocked | Users table issue |

---

## ⚠️ CRITICAL ISSUES SUMMARY

### Issue 1: Users Table (admin login)
```
Model expects: users.id
Model looking for: id ✅ (correct field name)
Problem: Model configured wrong somewhere
```

### Issue 2: Roles Table (admin login - CURRENT ERROR)
```
Model expects: roles.role_id ❌ (wrong!)
Actual table has: roles.id ✅
Problem: Role model has protected $primaryKey = 'role_id'
Solution: Change to protected $primaryKey = 'id' or remove it
```

### Issue 3: Multiple Tables
Need to verify ALL models use correct primary keys:
- [ ] users → id
- [ ] roles → id  
- [ ] role_permissions → id
- [ ] permissions → id
- [ ] jadwal_penyetorans → id
- [ ] categories/kategori → id

---

## IMMEDIATE ACTION REQUIRED

**Backend Team MUST:**

1. Open `app/Models/Role.php`
2. Find: `protected $primaryKey = 'role_id';`
3. Change to: `protected $primaryKey = 'id';`
4. Save file
5. Clear cache: `php artisan cache:clear`
6. Redeploy
7. Test admin login

---

**Frontend:** 🟢 Ready  
**Backend:** 🔴 Model configuration incorrect  
**Status:** 🔴 CRITICAL - All admin logins blocked  
**Assigned To:** Backend Team  
**Timeline:** IMMEDIATELY

Last Updated: 2025-12-12  
Priority: 🔴 BLOCKING ALL ADMIN ACCESS
