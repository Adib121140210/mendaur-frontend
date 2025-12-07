# 🔍 Redemption Debugging Guide

## Current Status

### ✅ Fixed Issues
1. **React Key Prop Warning** - Changed from `index` to `item.label` for exchange options
2. **Backend Validation (422)** - Added required fields `jumlah` and `alamat_pengiriman`

### ⚠️ Current Issues
1. **500 Internal Server Error** - Backend is encountering an error when creating redemption
2. **React Key Warning (Possible False Positive)** - May be from hot reload

---

## 🐛 500 Internal Server Error Analysis

### What We're Sending
```javascript
POST http://127.0.0.1:8000/api/penukaran-produk

Headers:
- Content-Type: application/json
- Accept: application/json
- Authorization: Bearer {token}

Body:
{
  "produk_id": 1,           // Converted to integer
  "jumlah_poin": 500,       // Required points
  "jumlah": 1,              // Quantity
  "alamat_pengiriman": "Ambil di Bank Sampah"  // Pickup location
}
```

### What Backend Returns (500)
```json
{
  "status": "error",
  "message": "Terjadi kesalahan saat membuat penukaran produk"
}
```

---

## 🔧 Debugging Steps

### 1. Check Backend Logs
The 500 error means the backend encountered an exception. Check Laravel logs:
```bash
# Check Laravel log file
tail -f storage/logs/laravel.log

# Or use artisan
php artisan log:tail
```

### 2. Common Backend Issues

#### A. **Database Connection**
```php
// Check if database is connected
DB::connection()->getPdo();
```

#### B. **Missing User ID**
The backend might be trying to get `user_id` from auth but failing:
```php
// In controller
$user = auth()->user();
if (!$user) {
    return response()->json(['error' => 'Unauthorized'], 401);
}
```

#### C. **Database Schema Issues**
Check if `penukaran_produk` table exists and has all columns:
```sql
DESCRIBE penukaran_produk;

-- Expected columns:
-- id
-- user_id
-- produk_id
-- jumlah_poin
-- jumlah
-- alamat_pengiriman
-- status (default: 'pending')
-- catatan_admin (nullable)
-- created_at
-- updated_at
-- approved_at (nullable)
-- claimed_at (nullable)
-- rejected_at (nullable)
```

#### D. **Foreign Key Constraints**
```sql
-- Check if produk_id exists in produk table
SELECT * FROM produk WHERE id = 1;

-- Check if user_id exists in users table
SELECT * FROM users WHERE id = {user_id};
```

#### E. **Mass Assignment Protection**
```php
// In PenukaranProduk model
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
```

---

## 🧪 Frontend Debugging

### Console Logs Added
1. **Request Payload**: `console.log('Sending redemption request:', payload)`
2. **Response Data**: `console.log('Backend response:', result)`
3. **Error Details**: `console.error('Backend error (status ' + response.status + '):', result)`

### How to Debug
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to redeem a product
4. Look for:
   ```
   Sending redemption request: {...}
   Backend response: {...}
   Backend error (status 500): {...}
   ```

### Check Network Tab
1. Go to **Network** tab in DevTools
2. Filter by **Fetch/XHR**
3. Find `penukaran-produk` request
4. Check:
   - Request Headers (Authorization token present?)
   - Request Payload (correct data?)
   - Response (actual error message from backend)

---

## 🎯 Likely Root Causes

### Priority 1: Authentication
- Token might be expired or invalid
- User not authenticated properly
- Middleware blocking the request

**Test:**
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
console.log('User ID:', localStorage.getItem('id_user'));
```

### Priority 2: Database Relations
- `produk_id` doesn't exist in database
- User points not being deducted properly
- Foreign key constraint failing

**Backend Check:**
```php
// In controller
Log::info('Creating redemption', [
    'user_id' => auth()->id(),
    'produk_id' => $request->produk_id,
    'jumlah_poin' => $request->jumlah_poin,
]);

try {
    $penukaran = PenukaranProduk::create([...]);
    Log::info('Redemption created successfully', ['id' => $penukaran->id]);
} catch (\Exception $e) {
    Log::error('Redemption creation failed', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
    ]);
    throw $e;
}
```

### Priority 3: Validation Rules
Backend might have additional validation not documented:
```php
// Check validation rules in controller
$validated = $request->validate([
    'produk_id' => 'required|exists:produk,id',
    'jumlah_poin' => 'required|integer|min:1',
    'jumlah' => 'required|integer|min:1',
    'alamat_pengiriman' => 'required|string|max:255',
]);
```

---

## 🔨 Quick Fixes to Try

### 1. Simplify Payload
Test with absolute minimum:
```javascript
body: JSON.stringify({
  produk_id: 1,
  jumlah_poin: 100,
  jumlah: 1,
  alamat_pengiriman: 'Bank Sampah',
})
```

### 2. Check Product ID Conversion
```javascript
// In console before redemption
console.log('Original ID:', selectedProduct.id_produk);
console.log('Extracted ID:', selectedProduct.id_produk.replace('produk-', ''));
console.log('As Integer:', parseInt(selectedProduct.id_produk.replace('produk-', '')));
```

### 3. Test Endpoint Directly with cURL
```bash
curl -X POST http://127.0.0.1:8000/api/penukaran-produk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "produk_id": 1,
    "jumlah_poin": 100,
    "jumlah": 1,
    "alamat_pengiriman": "Bank Sampah"
  }'
```

### 4. Test with Postman/Thunder Client
1. Create POST request to `http://127.0.0.1:8000/api/penukaran-produk`
2. Add Authorization header: `Bearer {token}`
3. Add JSON body with test data
4. Send and check full error response

---

## 📋 Backend Controller Expected Structure

```php
<?php

namespace App\Http\Controllers;

use App\Models\PenukaranProduk;
use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PenukaranProdukController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'produk_id' => 'required|exists:produk,id',
                'jumlah_poin' => 'required|integer|min:1',
                'jumlah' => 'required|integer|min:1',
                'alamat_pengiriman' => 'required|string|max:255',
            ]);

            $user = auth()->user();
            
            // Check user has enough points
            if ($user->total_poin < $validated['jumlah_poin']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Poin tidak mencukupi'
                ], 400);
            }

            // Check product stock
            $produk = Produk::find($validated['produk_id']);
            if ($produk->stok < $validated['jumlah']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stok produk tidak mencukupi'
                ], 400);
            }

            $penukaran = PenukaranProduk::create([
                'user_id' => $user->id,
                'produk_id' => $validated['produk_id'],
                'jumlah_poin' => $validated['jumlah_poin'],
                'jumlah' => $validated['jumlah'],
                'alamat_pengiriman' => $validated['alamat_pengiriman'],
                'status' => 'pending',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Penukaran produk berhasil dibuat',
                'data' => $penukaran->load('produk')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Error creating redemption: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat membuat penukaran produk',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function index()
    {
        $user = auth()->user();
        
        $penukaran = PenukaranProduk::where('user_id', $user->id)
            ->with('produk')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $penukaran
        ]);
    }
}
```

---

## ✅ Next Steps

1. **Check Backend Logs** - Look for actual error message
2. **Verify Database** - Ensure tables and relations exist
3. **Test Authentication** - Confirm token is valid
4. **Check Product IDs** - Verify product exists in database
5. **Review Console** - Check new debug logs in browser
6. **Test with cURL** - Isolate if issue is frontend or backend

Once the 500 error is resolved, the redemption flow should work perfectly! The frontend is completely ready.

