# 🔧 500 Error Fix - Code Patterns & Solutions

---

## 📋 Exact Code Patterns to Look For

### Pattern 1: Missing Status Field (MOST LIKELY)

**Location**: `app/Http/Controllers/PenukaranProdukController.php` → `store()` method

**Current Code (WRONG)**:
```php
try {
    // Line where it probably fails:
    $penukaran = PenukaranProduk::create([
        'user_id' => $user->id,
        'produk_id' => $request->produk_id,
        'jumlah_poin' => $totalPoin,
        'jumlah' => $request->jumlah,
        'alamat_pengiriman' => $request->alamat_pengiriman,
        // ❌ STATUS MISSING - This causes the error!
    ]);
```

**Fixed Code**:
```php
try {
    // Fixed version:
    $penukaran = PenukaranProduk::create([
        'user_id' => $user->id,
        'produk_id' => $request->produk_id,
        'jumlah_poin' => $totalPoin,
        'jumlah' => $request->jumlah,
        'alamat_pengiriman' => $request->alamat_pengiriman,
        'status' => 'pending',  // ✅ ADDED!
        'approved_at' => null,  // Optional but good
        'claimed_at' => null,   // Optional but good
        'rejection_reason' => null,  // Optional
        'admin_note' => null,   // Optional
    ]);
```

---

## 🔍 How to Find the Problem

### Search Pattern 1: Find the Create Statement
```bash
# In terminal, search for the create pattern
grep -n "PenukaranProduk::create" app/Http/Controllers/PenukaranProdukController.php

# This will show you the line number
```

### Search Pattern 2: Look for the Store Method
```bash
# Find the store method
grep -n "public function store" app/Http/Controllers/PenukaranProdukController.php
```

### Check the Actual Error
```bash
# Look at the exact line in the logs
tail -n 50 storage/logs/laravel.log | grep -i "penukaran\|status\|not null"
```

---

## 💻 Exact Steps to Fix

### Step 1: Find Line 1 - Locate store() method
```php
// Search for:
public function store(Request $request)
{
    // ... your code ...
}
```

### Step 2: Find Line 2 - Locate the create() call
Inside the store() method, find:
```php
$penukaran = PenukaranProduk::create([
    // ... fields ...
]);
```

### Step 3: Add Missing Fields
Inside the array, find where it ends (the `]`), and before that `]`, ensure these are present:

```php
'status' => 'pending',
'approved_at' => null,
'claimed_at' => null,
'rejection_reason' => null,
'admin_note' => null,
```

### Step 4: Save and Test
```bash
# No restart needed
# Just try the POST request again
```

---

## ✅ Complete Working Code Example

**Full store() method - Copy this if needed:**

```php
public function store(Request $request)
{
    $user = auth()->user();
    $totalPoin = (int)$request->jumlah_poin;
    
    // Validate input
    if (!$user) {
        return response()->json([
            'status' => 'error',
            'message' => 'Unauthorized'
        ], 401);
    }
    
    // Check points (after your previous fix)
    if ($user->total_poin < $totalPoin) {
        return response()->json([
            'status' => 'error',
            'message' => 'Poin tidak mencukupi untuk penukaran ini'
        ], 400);
    }
    
    try {
        // ✅ CREATE WITH ALL REQUIRED FIELDS
        $penukaran = PenukaranProduk::create([
            'user_id' => $user->id,
            'produk_id' => $request->produk_id,
            'jumlah_poin' => $totalPoin,
            'jumlah' => $request->jumlah ?? 1,
            'alamat_pengiriman' => $request->alamat_pengiriman ?? 'Ambil di Bank Sampah',
            'status' => 'pending',  // ✅ REQUIRED
            'approved_at' => null,
            'claimed_at' => null,
            'rejection_reason' => null,
            'admin_note' => null,
        ]);
        
        // Deduct points
        $user->decrement('total_poin', $totalPoin);
        
        \Log::info('Redemption created', [
            'penukaran_id' => $penukaran->id,
            'user_id' => $user->id,
            'points_deducted' => $totalPoin,
        ]);
        
        return response()->json([
            'status' => 'success',
            'data' => $penukaran
        ], 201);
        
    } catch (\Exception $e) {
        \Log::error('Error creating penukaran', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'user_id' => $user->id,
            'request_data' => $request->all(),
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat membuat penukaran produk',
            'error' => config('app.debug') ? $e->getMessage() : null,
        ], 500);
    }
}
```

---

## 🗂️ File Checklist

After fixing, verify these files are correct:

### File 1: PenukaranProdukController.php
```php
// Check these lines:

// ✅ Points validation uses total_poin
if ($user->total_poin < $request->jumlah_poin)

// ✅ Create includes status
$penukaran = PenukaranProduk::create([
    'status' => 'pending',  // ← Must exist
    ...
]);

// ✅ Points are deducted
$user->decrement('total_poin', $totalPoin);
```

### File 2: PenukaranProduk.php (Model)
```php
// Check these:

// ✅ $fillable includes all fields
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

// ✅ Relationships exist
public function user() {
    return $this->belongsTo(User::class);
}

public function produk() {
    return $this->belongsTo(Produk::class);
}
```

### File 3: Database Migration (penukaran_produk table)
```php
// Check these columns exist:

$table->id();
$table->foreignId('user_id')->constrained();
$table->foreignId('produk_id')->constrained();
$table->integer('jumlah_poin');
$table->integer('jumlah');
$table->string('alamat_pengiriman');
$table->string('status')->default('pending');  // ← Check default
$table->timestamp('approved_at')->nullable();
$table->timestamp('claimed_at')->nullable();
$table->text('rejection_reason')->nullable();
$table->text('admin_note')->nullable();
$table->timestamps();
```

---

## 🧪 Test After Fix

Run these commands to verify:

### Test 1: Check Model Configuration
```bash
php artisan tinker

# Load the model
$model = PenukaranProduk::first();
$model->getFillable();  # Should show all fields including 'status'
```

### Test 2: Manual Creation
```bash
php artisan tinker

$user = User::find(1);
$penukaran = PenukaranProduk::create([
    'user_id' => $user->id,
    'produk_id' => 1,
    'jumlah_poin' => 50,
    'jumlah' => 1,
    'alamat_pengiriman' => 'Ambil di Bank Sampah',
    'status' => 'pending',
    'approved_at' => null,
    'claimed_at' => null,
    'rejection_reason' => null,
    'admin_note' => null,
]);

echo "Created: " . $penukaran->id;  # Should show an ID number
```

### Test 3: HTTP Request
```bash
curl -X POST http://127.0.0.1:8000/api/penukaran-produk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produk_id": 1,
    "jumlah_poin": 50,
    "jumlah": 1,
    "alamat_pengiriman": "Ambil di Bank Sampah"
  }'

# Should return 201 Created
```

---

## 📊 Before & After Comparison

### Before Fix ❌
```
Request:
POST /api/penukaran-produk
{
  "produk_id": 1,
  "jumlah_poin": 50,
  "jumlah": 1,
  "alamat_pengiriman": "Ambil di Bank Sampah"
}

Response:
Status: 500
Body: {
  "status": "error",
  "message": "Terjadi kesalahan saat membuat penukaran produk"
}

Database: No record created ❌
```

### After Fix ✅
```
Request:
POST /api/penukaran-produk
{
  "produk_id": 1,
  "jumlah_poin": 50,
  "jumlah": 1,
  "alamat_pengiriman": "Ambil di Bank Sampah"
}

Response:
Status: 201
Body: {
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "produk_id": 1,
    "jumlah_poin": 50,
    "jumlah": 1,
    "alamat_pengiriman": "Ambil di Bank Sampah",
    "status": "pending",  # ← Now set correctly
    "created_at": "2025-11-19T..."
  }
}

Database: Record created ✅
User points: Deducted ✅
```

---

## 🎯 Summary

| Item | Details |
|------|---------|
| File | `PenukaranProdukController.php` |
| Method | `store()` |
| Line | Search for `PenukaranProduk::create(` |
| Missing Field | `'status' => 'pending',` |
| Time to Fix | 1-2 minutes |
| Difficulty | Very Easy |
| Risk | None |

Just add the missing field and test!

