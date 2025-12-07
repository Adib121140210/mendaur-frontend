# 🔧 Backend Fix Request - Penukaran Produk API Issues

## Summary
Two critical issues with the `/api/penukaran-produk` endpoint need to be fixed:
1. **POST request returns 400** with "Poin tidak mencukupi" error despite user having sufficient points
2. **GET request returns 500** Internal Server Error when fetching redemption history

---

## Issue #1: POST /api/penukaran-produk - 400 Error (Priority: HIGH)

### Problem Description
When user tries to redeem a product:
- User has: **150 poin**
- Product costs: **50 poin**
- Expected: Success (150 >= 50)
- Actual: Returns 400 Bad Request with message "Poin tidak mencukupi untuk penukaran ini"

### Request Details
```bash
POST http://127.0.0.1:8000/api/penukaran-produk
Authorization: Bearer {valid_token}
Content-Type: application/json

{
  "produk_id": 1,
  "jumlah_poin": 50,
  "jumlah": 1,
  "alamat_pengiriman": "Ambil di Bank Sampah"
}
```

### Expected Response (Success)
```json
{
  "status": "success",
  "message": "Penukaran produk berhasil dibuat",
  "data": {
    "id": 1,
    "user_id": 1,
    "produk_id": 1,
    "jumlah_poin": 50,
    "jumlah": 1,
    "alamat_pengiriman": "Ambil di Bank Sampah",
    "status": "pending",
    "created_at": "2025-11-19T10:30:00.000Z"
  }
}
```

### Current Response (Error)
```json
{
  "status": "error",
  "message": "Poin tidak mencukupi untuk penukaran ini",
  "data": {...}
}
```

### Root Cause Analysis
The issue is likely in the `PenukaranProdukController@store` method. Possible causes:

1. **Wrong Column Being Checked**
   - Backend checking `$user->poin_tersedia` (available points) instead of `$user->total_poin`
   - If user has pending redemptions, `poin_tersedia` might be 0 while `total_poin` is 150

2. **Incorrect Logic**
   - Points deduction logic is wrong
   - Multiple point columns are out of sync

### How to Fix

#### Step 1: Debug the User's Points
```bash
php artisan tinker

# Check the user who tried to redeem
$user = User::find(1);  # Use the actual user ID from the request
$user->total_poin;      # Should show 150
$user->poin_tersedia ?? 'Column does not exist';
$user->poin_pending ?? 'Column does not exist';

# Verify the comparison
$user->total_poin >= 50;  # Should return true
```

#### Step 2: Review the POST Controller Logic
```php
// In app/Http/Controllers/PenukaranProdukController.php

public function store(Request $request)
{
    // Validate input
    $validated = $request->validate([
        'produk_id' => 'required|exists:produk,id',
        'jumlah_poin' => 'required|integer|min:1',
        'jumlah' => 'required|integer|min:1',
        'alamat_pengiriman' => 'required|string|max:255',
    ]);

    $user = auth()->user();
    
    // ADD LOGGING HERE
    Log::info('Redemption attempt', [
        'user_id' => $user->id,
        'total_poin' => $user->total_poin,
        'requested_poin' => $validated['jumlah_poin'],
        'comparison_result' => $user->total_poin >= $validated['jumlah_poin'],
    ]);

    // FIX: Check if user has enough points
    // IMPORTANT: Use total_poin, not poin_tersedia
    if ($user->total_poin < $validated['jumlah_poin']) {
        Log::warning('Insufficient points', [
            'available' => $user->total_poin,
            'needed' => $validated['jumlah_poin'],
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Poin tidak mencukupi untuk penukaran ini'
        ], 400);
    }

    // Check product stock
    $produk = Produk::find($validated['produk_id']);
    if (!$produk || $produk->stok < $validated['jumlah']) {
        return response()->json([
            'status' => 'error',
            'message' => 'Stok produk tidak mencukupi'
        ], 400);
    }

    try {
        // Create redemption record
        $penukaran = PenukaranProduk::create([
            'user_id' => $user->id,
            'produk_id' => $validated['produk_id'],
            'jumlah_poin' => $validated['jumlah_poin'],
            'jumlah' => $validated['jumlah'],
            'alamat_pengiriman' => $validated['alamat_pengiriman'],
            'status' => 'pending',
        ]);

        Log::info('Redemption created successfully', [
            'penukaran_id' => $penukaran->id,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Penukaran produk berhasil dibuat',
            'data' => $penukaran->load('produk')
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error creating redemption', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        
        return response()->json([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat membuat penukaran produk',
            'error' => config('app.debug') ? $e->getMessage() : null
        ], 500);
    }
}
```

#### Step 3: Verify in Laravel Logs
```bash
# Check logs after trying the request
tail -f storage/logs/laravel.log

# Look for lines like:
# [2025-11-19 10:30:00] local.INFO: Redemption attempt {"user_id":1,"total_poin":150,"requested_poin":50,"comparison_result":true}
# [2025-11-19 10:30:01] local.INFO: Redemption created successfully {"penukaran_id":1,"user_id":1}
```

---

## Issue #2: GET /api/penukaran-produk - 500 Error (Priority: HIGH)

### Problem Description
When user tries to view redemption history:
- Expected: Returns list of user's redemptions
- Actual: Returns 500 Internal Server Error

### Request Details
```bash
GET http://127.0.0.1:8000/api/penukaran-produk
Authorization: Bearer {valid_token}
```

### Expected Response (Success)
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "produk_id": 1,
      "jumlah_poin": 50,
      "jumlah": 1,
      "alamat_pengiriman": "Ambil di Bank Sampah",
      "status": "pending",
      "catatan_admin": null,
      "created_at": "2025-11-19T10:30:00.000Z",
      "updated_at": "2025-11-19T10:30:00.000Z",
      "approved_at": null,
      "claimed_at": null,
      "rejected_at": null,
      "produk": {
        "id": 1,
        "nama": "Tas Ramah Lingkungan",
        "kategori": "Fashion"
      }
    }
  ]
}
```

### Current Response (Error)
```
500 Internal Server Error
```

### Root Cause Analysis
Likely causes:

1. **Missing Model Relationship**
   - `PenukaranProduk` model doesn't have `produk()` relationship defined

2. **Database Query Error**
   - Table doesn't exist
   - Missing columns
   - Foreign key constraint failure

3. **Relationship Not Loaded Properly**
   - `.with('produk')` fails because relationship isn't defined

### How to Fix

#### Step 1: Verify Model Relationships
```php
// In app/Models/PenukaranProduk.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenukaranProduk extends Model
{
    protected $table = 'penukaran_produk';
    
    protected $fillable = [
        'user_id',
        'produk_id',
        'jumlah_poin',
        'jumlah',
        'alamat_pengiriman',
        'status',
        'catatan_admin',
        'approved_at',
        'claimed_at',
        'rejected_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'claimed_at' => 'datetime',
        'rejected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ADD THIS RELATIONSHIP
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

#### Step 2: Review GET Controller Logic
```php
// In app/Http/Controllers/PenukaranProdukController.php

public function index()
{
    try {
        $user = auth()->user();
        
        Log::info('Fetching redemptions', [
            'user_id' => $user->id,
        ]);

        // Fetch all redemptions for the user
        $penukaran = PenukaranProduk::where('user_id', $user->id)
            ->with('produk')  // IMPORTANT: Load produk relationship
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Redemptions fetched', [
            'user_id' => $user->id,
            'count' => $penukaran->count(),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $penukaran
        ], 200);

    } catch (\Exception $e) {
        Log::error('Error fetching redemptions', [
            'user_id' => auth()->id(),
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat mengambil riwayat penukaran',
            'error' => config('app.debug') ? $e->getMessage() : null
        ], 500);
    }
}
```

#### Step 3: Verify Database Structure
```sql
-- Check if table exists
SHOW TABLES LIKE 'penukaran_produk';

-- Check table structure
DESCRIBE penukaran_produk;

-- Expected columns:
-- id (primary key)
-- user_id (foreign key → users)
-- produk_id (foreign key → produk)
-- jumlah_poin (integer)
-- jumlah (integer)
-- alamat_pengiriman (varchar)
-- status (varchar) - pending, approved, claimed, rejected
-- catatan_admin (text, nullable)
-- approved_at (timestamp, nullable)
-- claimed_at (timestamp, nullable)
-- rejected_at (timestamp, nullable)
-- created_at (timestamp)
-- updated_at (timestamp)

-- Check if any records exist
SELECT COUNT(*) FROM penukaran_produk;

-- Test the query manually
SELECT * FROM penukaran_produk 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

---

## Testing Instructions

### After making fixes:

#### Test 1: POST Endpoint (Create Redemption)
```bash
TOKEN="5|NcezJVcB6k0O0S800V..."

curl -X POST http://127.0.0.1:8000/api/penukaran-produk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produk_id": 1,
    "jumlah_poin": 50,
    "jumlah": 1,
    "alamat_pengiriman": "Ambil di Bank Sampah"
  }'

# Expected: 201 Created with redemption data
# Check: Status code should be 201, not 400
```

#### Test 2: GET Endpoint (Fetch Redemptions)
```bash
TOKEN="5|NcezJVcB6k0O0S800V..."

curl -X GET http://127.0.0.1:8000/api/penukaran-produk \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with array of redemptions
# Check: Status code should be 200, not 500
```

#### Test 3: In Browser
1. Go to **Tukar Poin** page
2. Click **"Tukar Sekarang"** on any product
3. Confirm redemption
4. Should see success alert (not error)
5. Go to **Riwayat Transaksi** page
6. Should see your redemption in the list (not crash)

---

## Validation Checklist

Before considering this complete, verify:

- [ ] User with 150 poin can redeem item costing 50 poin
- [ ] POST returns 201 Created status
- [ ] POST response includes complete redemption data
- [ ] GET returns 200 OK status
- [ ] GET returns array of user's redemptions
- [ ] GET response includes produk relationship data
- [ ] No 400 errors for valid redemptions
- [ ] No 500 errors when fetching history
- [ ] Laravel logs show successful operations
- [ ] Points logic is correct (total_poin not poin_tersedia)

---

## Additional Notes

### Frontend Context
- Frontend is sending correct data structure
- Frontend has proper authentication token
- Frontend error logging is enhanced for debugging
- Frontend is ready for backend fixes

### API Contract
The frontend expects this exact response structure:

**POST Response (201):**
```json
{
  "status": "success",
  "message": "Penukaran produk berhasil dibuat",
  "data": { /* redemption object */ }
}
```

**GET Response (200):**
```json
{
  "status": "success",
  "data": [ /* array of redemptions */ ]
}
```

**Error Response (400/500):**
```json
{
  "status": "error",
  "message": "Error description",
  "data": {}
}
```

---

## Questions for Backend Team

1. What column should be checked for points validation: `total_poin` or `poin_tersedia`?
2. Are there multiple point columns in the users table?
3. Does the `penukaran_produk` table exist with all required columns?
4. Is the `PenukaranProduk` model properly defined with relationships?
5. Are there any existing pending/draft redemptions affecting the points calculation?

---

## Priority Timeline

- **Critical**: Fix POST and GET endpoints (blocking feature)
- **Important**: Add logging and error handling
- **Nice to Have**: Add tests for edge cases

---

## Contact & Updates

Frontend is ready and waiting for these fixes. Once backend is updated, the feature will be fully functional.

Current status:
- ✅ Frontend: 100% Complete
- ❌ Backend POST: Needs Fix
- ❌ Backend GET: Needs Fix

