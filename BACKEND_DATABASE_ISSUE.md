# 🔴 BACKEND DATABASE ISSUE - Users Table Primary Key

## The Error
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'id' in 'where clause'
SQL: select count(*) as aggregate from `users` where `id` = 3
```

## Root Cause
**The `users` table does NOT have an `id` column!**

The backend is trying to validate:
```sql
SELECT COUNT(*) FROM users WHERE id = 3
```

But the users table uses a different column name for the primary key (probably `user_id` or `userId`).

---

## What's Happening

### Backend Flow:
```
1. Frontend sends: { user_id: 3, ... }
2. Backend receives the request
3. Laravel validates foreign key: user_id must exist in users table
4. Laravel tries: SELECT COUNT(*) FROM users WHERE id = 3
5. ERROR: Unknown column 'id' ← TABLE DOESN'T HAVE THIS COLUMN!
```

### Why This Happens:
The `users` table structure is likely:
```sql
-- Current (broken)
CREATE TABLE users (
  user_id INT PRIMARY KEY,  -- ← Column is named user_id, not id!
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  ...
);
```

But Laravel Model expects:
```sql
-- Expected (standard)
CREATE TABLE users (
  id INT PRIMARY KEY,       -- ← Laravel default
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  ...
);
```

---

## Solution: Backend Team Must Fix

### Option 1: Rename Column in Database (RECOMMENDED)
```sql
-- Rename user_id to id
ALTER TABLE users CHANGE COLUMN user_id id INT PRIMARY KEY;

-- Update foreign keys if needed
ALTER TABLE tabung_sampah CHANGE COLUMN user_id user_id INT;
```

### Option 2: Configure Laravel Model
Update the User model to use correct primary key:
```php
<?php
namespace App\Models;

class User extends Model {
    protected $primaryKey = 'user_id';  // Tell Laravel the primary key is user_id
    public $incrementing = false;
    protected $keyType = 'int';
}
```

### Option 3: Fix the Migration
If the table was created with wrong column name, fix the migration:
```php
// In migration file
Schema::create('users', function (Blueprint $table) {
    $table->id();  // ← Creates 'id' column, not 'user_id'
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->timestamps();
});
```

---

## Verification Steps for Backend Team

### Step 1: Check Current Table Structure
```bash
# SSH to backend server
php artisan tinker

# Check table columns
>>> DB::table('users')->first();
// Look at output - what column names exist?

// OR
>>> Schema::getColumnListing('users');
// Shows all column names in users table
```

### Step 2: Check User Model
```bash
# Check User model's primary key setting
cat app/Models/User.php
# Look for: protected $primaryKey = '...';
```

### Step 3: Fix the Issue
Choose one of the solutions above and implement it.

### Step 4: Test
```bash
# Verify frontend can now submit forms
php artisan tinker
>>> User::find(3);  // Should return the user
>>> User::where('id', 3)->count();  // Should work
```

---

## What the Frontend Shows

**Frontend is CORRECT:**
- ✅ Sends `user_id: 3` 
- ✅ Sends `jadwal_id: 1`
- ✅ Sends all required fields
- ✅ Form validation works

**Backend Database is BROKEN:**
- ❌ `users` table column mismatch
- ❌ Laravel can't validate foreign key
- ❌ Form submission fails with 500 error

---

## How to Fix Right Now

### Quick Fix (Without Database Changes):
```php
// In app/Models/User.php
class User extends Model {
    use HasFactory;
    
    // ← ADD THIS:
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';
    
    // ... rest of model
}
```

Then commit and redeploy.

### Proper Fix (Rename Column):
```bash
# Create migration to rename column
php artisan make:migration rename_user_id_to_id_in_users_table

# In migration file:
public function up() {
    Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('user_id', 'id');
    });
}

public function down() {
    Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('id', 'user_id');
    });
}

# Run migration
php artisan migrate

# Commit and deploy
git add -A
git commit -m "fix: Rename user_id column to id in users table"
git push
```

---

## Frontend Status

✅ **Frontend is ready and working correctly**
- Form sends correct data
- User ID correctly identified as 3
- All validations pass

❌ **Backend must fix database**
- Users table has wrong column name
- Laravel can't validate foreign key
- Form submission blocked

---

## Action Items for Backend Team

**PRIORITY: CRITICAL**

1. [ ] Check users table structure
   ```bash
   php artisan tinker
   >>> Schema::getColumnListing('users');
   ```

2. [ ] Identify the primary key column name
   - Is it `id`?
   - Is it `user_id`?
   - Is it something else?

3. [ ] Implement one of the fixes above

4. [ ] Test that user validation works
   ```bash
   >>> User::find(3);
   ```

5. [ ] Redeploy backend

6. [ ] Test form submission from frontend

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Form | ✅ Ready | Sends correct data |
| Frontend Validation | ✅ Working | All checks pass |
| Frontend User ID | ✅ Correct | Sends user_id: 3 |
| **Backend DB** | ❌ BROKEN | Column name mismatch |
| Form Submission | ❌ Blocked | Waiting for backend fix |

---

**Frontend:** 🟢 Ready  
**Backend:** 🔴 Database issue  
**Status:** Blocked on backend fix  
**Assigned To:** Backend Team

---

**Last Updated:** 2025-12-10  
**Priority:** 🔴 CRITICAL - Blocking all form submissions
