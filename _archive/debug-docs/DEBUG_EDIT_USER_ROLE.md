# 🔍 Debug: Edit User Role Not Updating in Database

## 🐛 Problem Description

**Issue:** 
- User 'Alvin' role changed from 'Admin' to 'Nasabah' in UI
- Frontend shows success message: "✅ User updated successfully!"
- **BUT** database still shows old values:
  - `role_id` still = 2 (should be 1)
  - Database not updated

**Expected Behavior:**
- When changing role from Admin → Nasabah
- Database should update:
  - `role_id`: 2 → 1
  - `level`: 'admin' → 'nasabah' (if backend updates this field)

---

## 🔍 Debugging Steps Added

### 1. Added Debug Logging to UserEditModal.jsx

**Location 1: Initial Data** (Lines ~38-40)
```javascript
console.log('🔍 UserEditModal - Initial user data:', user)
console.log('📝 UserEditModal - Initial form data:', formData)
```

**Location 2: Role Change Handler** (Lines ~55-61)
```javascript
console.log('🔄 Role change:', {
  roleName,      // 'nasabah', 'admin', or 'superadmin'
  roleId,        // 1, 2, or 3
  previousRoleId: formData.role_id
})
```

**Location 3: Before Save** (Lines ~79-87)
```javascript
console.log('===== USER UPDATE DEBUG =====')
console.log('🆔 User ID:', user.user_id)
console.log('📤 Payload being sent:', updateData)
console.log('🔢 role_id type:', typeof updateData.role_id)
console.log('✅ role_id value:', updateData.role_id)
console.log('===== END DEBUG =====')
```

**Location 4: After Backend Response** (Lines ~93-97)
```javascript
console.log('===== BACKEND RESPONSE =====')
console.log('📥 Response:', result)
console.log('✅ Success:', result.success)
console.log('📊 Data:', result.data)
console.log('===== END RESPONSE =====')
```

---

### 2. Added Debug Logging to adminApi.js

**Location: updateAdminUser function** (Lines ~1914-1936)
```javascript
console.log('📡 adminApi.updateAdminUser called')
console.log('🆔 userId:', userId)
console.log('📤 userData:', userData)
console.log('🔗 URL:', `${API_BASE_URL}/admin/users/${userId}`)
console.log('📥 Response status:', response.status)
console.log('📥 Response ok:', response.ok)
console.log('✅ Backend success response:', data)
```

---

## 🧪 Testing Instructions

### Step 1: Open Admin Dashboard
1. Login as admin
2. Navigate to User Management
3. Find user 'Alvin' (or any user with role_id = 2)

### Step 2: Open Browser Console
1. Press F12
2. Go to Console tab
3. Clear console (click 🚫 icon or press Ctrl+L)

### Step 3: Edit User
1. Click Edit button on user 'Alvin'
2. **Check Console** - Should see:
```javascript
🔍 UserEditModal - Initial user data: {
  user_id: [X],
  nama: "Alvin",
  role_id: 2,        // ← Current role (admin)
  tipe_nasabah: "...",
  status: "..."
}
📝 UserEditModal - Initial form data: {
  nama: "Alvin",
  role_id: 2,        // ← Should match user data
  ...
}
```

**❓ Question 1:** Does `user.role_id` show correct value (2 for admin)?

### Step 4: Change Role
1. In modal, change Role dropdown: Admin → Nasabah
2. **Check Console** - Should see:
```javascript
🔄 Role change: {
  roleName: "nasabah",     // ← Selected option
  roleId: 1,               // ← Converted to role_id
  previousRoleId: 2        // ← Old value
}
```

**❓ Question 2:** Does roleId correctly convert to 1?

### Step 5: Save Changes
1. Click "Save Changes" button
2. **Check Console** - Should see complete debug sequence:

```javascript
===== USER UPDATE DEBUG =====
🆔 User ID: [X]
📤 Payload being sent: {
  role_id: 1,              // ← Should be 1 (nasabah)
  tipe_nasabah: "konvensional",
  status: "active"
}
🔢 role_id type: "number"  // ← Should be "number" not "string"
✅ role_id value: 1         // ← Should be 1
===== END DEBUG =====

📡 adminApi.updateAdminUser called
🆔 userId: [X]
📤 userData: {
  role_id: 1,              // ← Should match above
  tipe_nasabah: "konvensional",
  status: "active"
}
🔗 URL: http://127.0.0.1:8000/api/admin/users/[X]
📥 Response status: 200    // ← Should be 200 (success)
📥 Response ok: true       // ← Should be true

✅ Backend success response: {
  status: "success",       // Or whatever format backend uses
  data: {
    user_id: [X],
    nama: "Alvin",
    role_id: 1,            // ← **KEY CHECK**: Should be 1 (updated)
    ...
  }
}

===== BACKEND RESPONSE =====
📥 Response: { success: true, data: {...} }
✅ Success: true
📊 Data: {
  user_id: [X],
  role_id: 1,              // ← Should show 1
  ...
}
===== END RESPONSE =====
```

**❓ Question 3:** What is the `Response status`?
**❓ Question 4:** Does backend response show `role_id: 1`?

---

## 🔍 Diagnostic Scenarios

### Scenario A: Frontend Sends Wrong Data
**Symptoms:**
```javascript
📤 Payload being sent: {
  role_id: 2,  // ← Still shows 2 instead of 1
  ...
}
```

**Cause:** Role conversion not working
**Fix:** Check `getRoleId()` function

---

### Scenario B: Backend Receives Data But Doesn't Update
**Symptoms:**
```javascript
📤 Payload being sent: { role_id: 1, ... }  // ✅ Correct
📥 Response status: 200                      // ✅ Success
✅ Backend success response: {
  data: { role_id: 2, ... }                  // ❌ Still shows old value!
}
```

**Cause:** Backend not actually updating database
**Fix:** Check backend controller:
```php
// AdminUserController.php
public function update(Request $request, $userId)
{
    $user = User::find($userId);
    
    // Make sure this line exists:
    $user->role_id = $request->role_id;  // ← Must be present
    
    $user->save();  // ← Must actually save
    
    return response()->json([...]);
}
```

---

### Scenario C: Backend Returns Success But Doesn't Save
**Symptoms:**
```javascript
📥 Response status: 200
✅ Backend success response: { status: "success" }
// But no actual data returned to verify
```

**Cause:** Backend returns success before actually saving
**Fix:** Backend should return updated user data:
```php
$user->role_id = $request->role_id;
$user->save();

return response()->json([
    'status' => 'success',
    'data' => $user->fresh()  // ← Return fresh data from DB
]);
```

---

### Scenario D: Field Name Mismatch
**Symptoms:**
```javascript
📤 Payload: { role_id: 1, ... }
Backend receives: { roleId: 1, ... }  // ← Camel case!
```

**Cause:** Backend expects different field name
**Check:** Backend validation rules
```php
$request->validate([
    'role_id' => 'required|integer',  // ← Must match exactly
]);
```

---

## 🎯 Expected Console Output (Success Case)

```javascript
// When modal opens
🔍 UserEditModal - Initial user data: { user_id: 12, nama: "Alvin", role_id: 2, ... }
📝 UserEditModal - Initial form data: { nama: "Alvin", role_id: 2, ... }

// When changing role
🔄 Role change: { roleName: "nasabah", roleId: 1, previousRoleId: 2 }

// When saving
===== USER UPDATE DEBUG =====
🆔 User ID: 12
📤 Payload being sent: { role_id: 1, tipe_nasabah: "konvensional", status: "active" }
🔢 role_id type: "number"
✅ role_id value: 1
===== END DEBUG =====

📡 adminApi.updateAdminUser called
🆔 userId: 12
📤 userData: { role_id: 1, tipe_nasabah: "konvensional", status: "active" }
🔗 URL: http://127.0.0.1:8000/api/admin/users/12
📥 Response status: 200
📥 Response ok: true
✅ Backend success response: {
  status: "success",
  data: {
    user_id: 12,
    nama: "Alvin",
    role_id: 1,  // ← Updated!
    tipe_nasabah: "konvensional",
    status: "active"
  }
}

===== BACKEND RESPONSE =====
📥 Response: { success: true, data: {...} }
✅ Success: true
📊 Data: { user_id: 12, role_id: 1, ... }
===== END RESPONSE =====
```

---

## 📋 Checklist for User

Please test and provide answers:

### Frontend Checks:
- [ ] Does modal show correct initial `role_id`?
- [ ] Does role change handler convert correctly (admin → 1)?
- [ ] Does payload show `role_id: 1` before sending?
- [ ] Is `role_id` type `"number"` (not string)?

### Backend Checks:
- [ ] What is the HTTP response status? (200, 400, 422, 500?)
- [ ] Does backend return updated data with `role_id: 1`?
- [ ] Does database query show `role_id = 1` after update?

### Database Verification:
```sql
-- Run this query after update:
SELECT user_id, nama, role_id, level, updated_at 
FROM users 
WHERE nama = 'Alvin';

-- Expected result:
-- role_id: 1 (not 2)
-- updated_at: Recent timestamp (should change)
```

---

## 🔧 Next Steps

Based on console output, we can determine:

1. **If payload is wrong** → Fix frontend
2. **If backend receives correct data but doesn't update** → Fix backend controller
3. **If backend updates but returns old data** → Fix backend response
4. **If database constraint prevents update** → Check DB foreign keys

---

## 📝 Information Needed

Please provide:
1. **Full console output** when editing user (copy paste entire console)
2. **Database query result** before and after update:
   ```sql
   SELECT * FROM users WHERE nama = 'Alvin';
   ```
3. **Backend logs** if available (Laravel log file)

---

**Status:** 🔍 Debugging mode enabled
**Next:** Please test and share console output
