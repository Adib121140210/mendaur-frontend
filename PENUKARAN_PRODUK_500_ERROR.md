# 🔍 500 Error - Penukaran Produk Creation Failure

**Status**: 500 Internal Server Error  
**Message**: "Terjadi kesalahan saat membuat penukaran produk"  
**When**: Trying to create redemption record after points validation passes  
**Endpoint**: POST `/api/penukaran-produk`

---

## 🎯 The Problem

The points validation is now fixed (✅), but creating the redemption record fails with a generic 500 error.

**This means the backend code is throwing an exception when trying to save to the database.**

---

## 🔧 Most Likely Causes (In Order)

### 1. ❌ Missing `status` Field

The `penukaran_produk` table likely has a `status` column that must be set, but it's not being provided.

```php
// WRONG - doesn't set status
PenukaranProduk::create([
    'user_id' => $user->id,
    'produk_id' => $request->produk_id,
    'jumlah_poin' => $request->jumlah_poin,
    // ❌ Missing 'status' => 'pending'
]);

// RIGHT - sets status
PenukaranProduk::create([
    'user_id' => $user->id,
    'produk_id' => $request->produk_id,
    'jumlah_poin' => $request->jumlah_poin,
    'status' => 'pending',  // ✅ Added
]);
```

### 2. ❌ Wrong Field Name for Points

Backend might be using different field name than `jumlah_poin`:

```php
// Check what the database column is actually named:
// Could be: jumlah_poin, poin_digunakan, total_poin, poin, etc.
```

### 3. ❌ Model `$fillable` Not Updated

The model might not allow mass assignment for required fields:

```php
// In PenukaranProduk model
// WRONG - doesn't include all fields
protected $fillable = ['user_id', 'produk_id'];

// RIGHT - includes all fields
protected $fillable = [
    'user_id',
    'produk_id',
    'jumlah_poin',
    'jumlah',
    'alamat_pengiriman',
    'status',
    'approved_at',
    'claimed_at',
    'rejection_reason',
    'admin_note',
];
```

### 4. ❌ Foreign Key Constraint Fails

Product ID might not exist or there's a relationship issue:

```sql
-- Product with ID 1 might not exist
SELECT * FROM produk WHERE id = 1;  -- Returns nothing? That's the problem!
```

### 5. ❌ Database Column Mismatch

Frontend sends one field name, backend expects another:

```javascript
// Frontend sends:
{
  "produk_id": 1,        // Backend expects this
  "jumlah_poin": 50,     // Backend expects this? Or "poin_digunakan"?
  "jumlah": 1,           // Backend expects this? Or "quantity"?
}
```

---

## 🧪 Immediate Debugging Steps

### Step 1: Enable Debug Mode (CRITICAL)

```bash
# Edit .env
APP_DEBUG=true
APP_LOG_LEVEL=debug
```

### Step 2: Check Laravel Logs

```bash
# Read the logs
tail -f storage/logs/laravel.log

# Look for the actual error stack trace
```

This is THE most important step. The logs will tell you exactly what's failing.

### Step 3: Test in Tinker

```bash
php artisan tinker

# Get the user
$user = User::find(1);
echo $user->name;  # Should show: Adib Surya

# Get a product
$product = Produk::find(1);
echo $product->nama;  # Should show product name

# Try creating
$penukaran = PenukaranProduk::create([
    'user_id' => $user->id,
    'produk_id' => $product->id,
    'jumlah_poin' => 50,
    'jumlah' => 1,
    'alamat_pengiriman' => 'Ambil di Bank Sampah',
    'status' => 'pending',  # IMPORTANT: Add this
]);

echo $penukaran->id;  # If this shows a number, creation works!
```

If it fails, the error message will show exactly what's wrong.

### Step 4: Check Table Structure

```sql
-- See what columns exist
DESCRIBE penukaran_produk;

-- Look for: status, jumlah_poin, jumlah, alamat_pengiriman
-- Check if any have "NOT NULL" without default value
```

---

## ✅ The Fix (Most Likely)

Add the `status` field when creating the redemption:

### Current Code (WRONG)
```php
// PenukaranProdukController@store

try {
    $penukaran = PenukaranProduk::create([
        'user_id' => $user->id,
        'produk_id' => $request->produk_id,
        'jumlah_poin' => $totalPoin,
        'jumlah' => $request->jumlah,
        'alamat_pengiriman' => $request->alamat_pengiriman,
        // ❌ Missing status - this causes 500 error!
    ]);
    
    // ...
} catch (\Exception $e) {
    return response()->json([
        'status' => 'error',
        'message' => 'Terjadi kesalahan saat membuat penukaran produk'
    ], 500);
}
```

### Fixed Code (RIGHT)
```php
// PenukaranProdukController@store

try {
    $penukaran = PenukaranProduk::create([
        'user_id' => $user->id,
        'produk_id' => $request->produk_id,
        'jumlah_poin' => $totalPoin,
        'jumlah' => $request->jumlah,
        'alamat_pengiriman' => $request->alamat_pengiriman,
        'status' => 'pending',  // ✅ Added this!
        'approved_at' => null,
        'claimed_at' => null,
        'rejection_reason' => null,
        'admin_note' => null,
    ]);
    
    // Deduct points
    $user->decrement('total_poin', $totalPoin);
    
    return response()->json([
        'status' => 'success',
        'data' => $penukaran
    ], 201);
    
} catch (\Exception $e) {
    \Log::error('Error creating penukaran', [
        'message' => $e->getMessage(),
        'user_id' => $user->id,
    ]);
    
    return response()->json([
        'status' => 'error',
        'message' => 'Terjadi kesalahan saat membuat penukaran produk',
        'debug' => config('app.debug') ? $e->getMessage() : null,  // Shows actual error in debug
    ], 500);
}
```

---

## 📋 Complete Debugging Checklist

### Backend Developer MUST Do These (In Order):

1. [ ] **Enable Debug Mode**
   ```bash
   Edit .env: APP_DEBUG=true
   ```

2. [ ] **Check Laravel Logs**
   ```bash
   tail -f storage/logs/laravel.log
   # Try redemption, see the actual error
   ```

3. [ ] **Verify Table Structure**
   ```sql
   DESCRIBE penukaran_produk;
   # Note all columns and their properties
   ```

4. [ ] **Test in Tinker**
   ```bash
   php artisan tinker
   # Run the test commands above
   ```

5. [ ] **Check Model Configuration**
   ```php
   # Open: app/Models/PenukaranProduk.php
   # Verify $fillable array includes all fields
   # Verify relationships exist
   ```

6. [ ] **Apply Fixes**
   - Add `status` field
   - Add error logging
   - Update $fillable if needed

7. [ ] **Test Again**
   ```bash
   # Try redemption
   # Should get 201 success or helpful error message
   ```

---

## 🎯 What Backend Dev Should Check

### Question 1: What does `DESCRIBE penukaran_produk;` show?
```
Columns should include:
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- produk_id (FOREIGN KEY)
- jumlah_poin (INT)
- jumlah (INT)
- alamat_pengiriman (VARCHAR)
- status (VARCHAR) ← Check if this has default or NOT NULL
- approved_at (TIMESTAMP)
- claimed_at (TIMESTAMP)
- rejection_reason (TEXT)
- admin_note (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Question 2: Does the model have these?
```php
// app/Models/PenukaranProduk.php should have:

protected $fillable = [
    'user_id',
    'produk_id',
    'jumlah_poin',
    'jumlah',
    'alamat_pengiriman',
    'status',
    'approved_at',
    'claimed_at',
    'rejection_reason',
    'admin_note',
];
```

### Question 3: Can creation work in Tinker?
```bash
php artisan tinker
# If yes → Issue is in HTTP layer (status code)
# If no → Shows exact error
```

---

## 📊 Expected After Fix

### Before Fix ❌
```
POST /api/penukaran-produk
Status: 500
Message: "Terjadi kesalahan saat membuat penukaran produk"
Data: Not saved to database
```

### After Fix ✅
```
POST /api/penukaran-produk
Status: 201
Message: "Success"
Data: Redemption record created
Points: Deducted from user account
```

---

## 💡 Most Likely Solution (90% Confidence)

The issue is **missing `status` field**.

Add this line to the `create()` call:
```php
'status' => 'pending',
```

That's probably all that's needed!

---

## 🚀 What to Do Now

1. **Send this doc to backend dev**
2. **Backend dev enables APP_DEBUG=true**
3. **Backend dev checks logs**
4. **Backend dev runs tinker test**
5. **Backend dev adds missing fields**
6. **You test redemption again**
7. **It should work!** ✅

