# 🔍 Backend Points Issue - Diagnostic Guide

## Your Current Situation

**User Account**: Adib Surya  
**Error**: `Poin tidak mencukupi untuk penukaran ini` (400)  
**Your Points**: At least some amount (need to verify exact)  
**Trying to Redeem**: An item that costs less than you have  

---

## The Core Problem

**The backend is rejecting your redemption with "Insufficient points" even though you have enough points.**

This is a **database column mismatch** issue. Here's the likely scenario:

---

## Most Likely Cause

Your Laravel backend likely has this database structure:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR,
    email VARCHAR,
    
    -- Multiple point columns (THIS IS THE PROBLEM!)
    total_poin INT,          -- Your actual total points
    poin_tersedia INT,       -- Available points (after pending deductions)
    poin_pending INT,        -- Points in pending transactions
);
```

And your backend code is checking the **wrong column**:

### ❌ Current Backend Code (WRONG)
```php
// PenukaranProdukController.php - store() method
$user = auth()->user();

if ($user->poin_tersedia < $request->jumlah_poin) {  // ← CHECKING WRONG COLUMN!
    return response()->json([
        'status' => 'error',
        'message' => 'Poin tidak mencukupi untuk penukaran ini'
    ], 400);
}
```

### ✅ Correct Backend Code
```php
// Should check: total_poin (not poin_tersedia)
if ($user->total_poin < $request->jumlah_poin) {
    return response()->json([
        'status' => 'error',
        'message' => 'Poin tidak mencukupi untuk penukaran ini'
    ], 400);
}
```

---

## Quick Diagnostic Steps

### Step 1: Check Your User's Database Record

Ask backend developer or access database directly:

```sql
-- Check your user data (ID 1 if you're the first user)
SELECT id, name, email, total_poin, poin_tersedia, poin_pending 
FROM users 
WHERE email LIKE '%Adib%';
```

**Expected output for you:**
```
id | name        | email              | total_poin | poin_tersedia | poin_pending
1  | Adib Surya  | adib@...           | 150+       | ???           | ???
```

---

### Step 2: Check What Points Columns Exist

```sql
-- See all columns in users table
DESCRIBE users;

-- Or this for MySQL:
SHOW COLUMNS FROM users;
```

**Look for columns like:**
- `total_poin` ✓
- `poin_tersedia` (optional)
- `poin_available` (optional)
- `poin_pending` (optional)
- `poin` (alternative name?)

---

### Step 3: Check Backend Controller

**File to check**: `app/Http/Controllers/PenukaranProdukController.php`

Look for the `store()` method and find this line:

```php
public function store(Request $request)
{
    $user = auth()->user();
    
    // THIS LINE - what does it check?
    if ($user->??? < $request->jumlah_poin) {  // ← What is ??? ?
        return response()->json([...], 400);
    }
}
```

---

## The Fix (Tell Backend Developer)

**File**: `app/Http/Controllers/PenukaranProdukController.php`

**In the `store()` method**, change:

### WRONG ❌
```php
if ($user->poin_tersedia < $request->jumlah_poin) {
```

### RIGHT ✅
```php
if ($user->total_poin < $request->jumlah_poin) {
```

**Reason**: 
- `total_poin` = your actual total points balance
- `poin_tersedia` = available points (may be less due to pending transactions)

For initial redemptions, you should check `total_poin`, not `poin_tersedia`.

---

## How to Verify the Fix Works

### After backend dev makes the change:

1. **Clear any caches** (if applicable):
```bash
php artisan cache:clear
php artisan config:clear
```

2. **Test with Postman/cURL**:
```bash
TOKEN="your_token_here"

curl -X POST http://127.0.0.1:8000/api/penukaran-produk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produk_id": 1,
    "jumlah_poin": 50,
    "jumlah": 1,
    "alamat_pengiriman": "Ambil di Bank Sampah"
  }'
```

3. **Expected result**: `201 Created` (not `400 Bad Request`)

---

## Alternative: Multiple Issues

It could also be:

### Issue A: Wrong Column Name
```php
// Maybe it's checking a different column:
if ($user->poin < $request->jumlah_poin) { ... }  // ← different name
```

### Issue B: Points as String
```php
// Maybe points are stored as string and comparison fails:
if ((int)$user->total_poin < $request->jumlah_poin) { ... }
```

### Issue C: Not Deducting Yet
```php
// Maybe it's checking: "if I deduct now, will I go negative?"
$pointsAfterDeduction = $user->total_poin - $request->jumlah_poin;
if ($pointsAfterDeduction < 0) { ... }  // This should work too
```

---

## Getting More Specific Help

### What to Ask Backend Developer:

1. "In PenukaranProdukController.php, what column are you checking in the points validation?"
2. "What's the value of `$user->total_poin` for the Adib Surya account?"
3. "What's the value of any other point columns (poin_tersedia, poin_available, etc)?"
4. "Can you check the Laravel logs for the exact error?"

### Show Them This

> "When user Adib Surya tries to redeem an item costing 50 poin, the backend returns 400 'Poin tidak mencukupi'. 
> 
> The user should have enough poin. This suggests the backend is checking a different column than `total_poin`.
>
> Can you verify:
> - 1. What column is being checked in PenukaranProdukController->store()?
> - 2. What's the value of user->total_poin?
> - 3. Are there multiple poin columns (poin_tersedia, poin_pending, etc)? If so, which should be checked?"

---

## Quick Fix Checklist

If you have access to the backend code:

- [ ] Open `app/Http/Controllers/PenukaranProdukController.php`
- [ ] Find the `store()` method
- [ ] Locate the line: `if ($user->??? < $request->jumlah_poin)`
- [ ] Change `???` to `total_poin`
- [ ] Save the file
- [ ] No restart needed (PHP picks up changes immediately)
- [ ] Test with the redemption again

---

## Expected vs Actual

### Current (BROKEN) Flow:
```
User: Adib Surya has 150+ poin
Try to redeem: 50 poin item
Backend checks: poin_tersedia (which is maybe 0?)
Response: 400 "Poin tidak mencukupi" ❌
```

### After Fix (CORRECT) Flow:
```
User: Adib Surya has 150+ poin
Try to redeem: 50 poin item
Backend checks: total_poin (which is 150+) ✓
Response: 201 "Redemption created successfully" ✅
```

---

## Need More Help?

1. **Check the debug output** from frontend (check browser console after trying to redeem)
   - Look for: `===== REDEMPTION DEBUG =====`
   - This shows exactly what data is being sent

2. **Check Laravel logs** on backend:
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Enable debug mode** on Laravel:
   - In `.env`: Set `APP_DEBUG=true`
   - This will show actual errors instead of generic 500/400 responses

---

## Summary

**The issue is 99% likely**: Backend is checking the wrong points column.

**The fix**: Change the validation from checking `poin_tersedia` (or similar) to `total_poin`.

**Time to fix**: 2 minutes

**Who can fix**: Any backend developer with access to the code

