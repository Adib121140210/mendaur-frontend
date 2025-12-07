# 🔍 Backend Code Investigation Template

## For Backend Developer - IMMEDIATE ACTION NEEDED

### Step 1: Locate the File

**Path**: `app/Http/Controllers/PenukaranProdukController.php`

**Method to check**: `store(Request $request)`

### Step 2: Find the Problematic Code

Search for the pattern in the `store()` method:

```php
if ($user->??? < $request->jumlah_poin) {
```

### Step 3: Check What's Being Used

**The ??? could be one of these:**

| Column Name | Status | Action |
|------------|--------|--------|
| `total_poin` | ✅ CORRECT | Leave as is |
| `poin_tersedia` | ❌ WRONG | Change to `total_poin` |
| `poin_available` | ❌ WRONG | Change to `total_poin` |
| `poin` | ❌ WRONG | Change to `total_poin` |
| `points` | ❌ WRONG | Change to `total_poin` |
| `saldo_poin` | ❌ WRONG | Change to `total_poin` |

### Step 4: Common Patterns to Look For

**Pattern A: Direct Check**
```php
// Current (WRONG):
if ($user->poin_tersedia < $request->jumlah_poin) {
    return response()->json([...], 400);
}

// Fix: Change to
if ($user->total_poin < $request->jumlah_poin) {
    return response()->json([...], 400);
}
```

**Pattern B: Cached Check**
```php
// Current (WRONG):
$userPoints = $user->poin_tersedia;
if ($userPoints < $request->jumlah_poin) {
    return response()->json([...], 400);
}

// Fix: Change to
$userPoints = $user->total_poin;
if ($userPoints < $request->jumlah_poin) {
    return response()->json([...], 400);
}
```

**Pattern C: Ternary Operator**
```php
// Current (WRONG):
$availablePoints = $user->poin_tersedia ?? 0;
if ($availablePoints < $request->jumlah_poin) {
    return response()->json([...], 400);
}

// Fix: Change to
$availablePoints = $user->total_poin ?? 0;
if ($availablePoints < $request->jumlah_poin) {
    return response()->json([...], 400);
}
```

### Step 5: Verify Database Structure

Before making changes, verify the `users` table has these columns:

```sql
DESCRIBE users;
```

Should show at least:
- ✅ `id`
- ✅ `name`
- ✅ `email`
- ✅ `total_poin` ← This should exist
- ⚠️ `poin_tersedia` (optional, only check for available points after deductions)

---

## Debugging Commands

### Command 1: Check User Data
```bash
php artisan tinker

# Check Adib Surya's points
$user = User::where('name', 'like', '%Adib%')->first();
$user->total_poin;           # Show total
$user->poin_tersedia ?? 'NOT SET';  # Show available (if exists)
```

### Command 2: Add Temporary Debug Logging

**In `app/Http/Controllers/PenukaranProdukController.php`, in the `store()` method:**

```php
public function store(Request $request)
{
    $user = auth()->user();
    
    // ADD THIS FOR DEBUGGING:
    \Log::info('DEBUG: Redemption Request', [
        'user_id' => $user->id,
        'user_name' => $user->name,
        'total_poin' => $user->total_poin,
        'total_poin_type' => gettype($user->total_poin),
        'poin_tersedia' => $user->poin_tersedia ?? 'COLUMN_NOT_EXISTS',
        'requested_poin' => $request->jumlah_poin,
        'requested_poin_type' => gettype($request->jumlah_poin),
        'comparison_result_total' => ($user->total_poin >= $request->jumlah_poin),
        'comparison_result_tersedia' => (($user->poin_tersedia ?? 0) >= $request->jumlah_poin),
    ]);
    
    // Then your validation code...
}
```

Then check logs:
```bash
tail -f storage/logs/laravel.log
```

### Command 3: Query Database Directly
```sql
-- Check if Adib exists
SELECT id, name, email, total_poin FROM users WHERE name LIKE '%Adib%';

-- Check if poin_tersedia column exists
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='users' AND TABLE_SCHEMA=DATABASE();
```

---

## Expected vs Actual

### Before Fix ❌
```
User total_poin: 150
Item cost: 50
Backend checks: poin_tersedia (0)
Result: 0 < 50 = TRUE → Error
Response: 400 "Poin tidak mencukupi"
```

### After Fix ✅
```
User total_poin: 150
Item cost: 50
Backend checks: total_poin (150)
Result: 150 < 50 = FALSE → No error
Response: 201 Created
```

---

## How to Make the Fix

1. **Open file**: `app/Http/Controllers/PenukaranProdukController.php`

2. **Find line** containing the points check (usually line 40-70)

3. **Change the column name**:
   - Find: `$user->poin_tersedia` or `$user->poin_available` or similar
   - Replace with: `$user->total_poin`

4. **Save file**

5. **Test immediately**:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/penukaran-produk \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"produk_id": 1, "jumlah_poin": 50, "jumlah": 1, "alamat_pengiriman": "Ambil di Bank Sampah"}'
   ```

---

## Validation Checklist

After making the change, verify:

- [ ] File saved: `app/Http/Controllers/PenukaranProdukController.php`
- [ ] Method modified: `store(Request $request)`
- [ ] Column changed: Now using `$user->total_poin`
- [ ] Test with cURL or Postman: Should return 201 (not 400)
- [ ] Frontend can redeem: Test in browser
- [ ] User gets success message: Confirm redemption worked
- [ ] Points are deducted: Check user's total_poin decreased by redemption amount

---

## If Points Still Not Deducted

If redemption succeeds (201) but points aren't being deducted, check the rest of the `store()` method:

```php
// Should have this line (or similar):
$user->decrement('total_poin', $request->jumlah_poin);

// Or:
$user->total_poin -= $request->jumlah_poin;
$user->save();

// Or:
$user->update(['total_poin' => $user->total_poin - $request->jumlah_poin]);
```

If one of these isn't there, add it after the redemption record is created.

---

## Additional Notes

- **No restart needed**: PHP automatically picks up file changes
- **Cache clear not needed**: Unless you're using cached queries
- **Frontend is already correct**: No changes needed on frontend side
- **This is blocking production**: User cannot redeem any products until fixed

---

## Status Update Required

Once fix is made, confirm:

1. Adib Surya can now redeem products
2. Points are deducted correctly
3. Redemption history shows the new record
4. No errors in logs

