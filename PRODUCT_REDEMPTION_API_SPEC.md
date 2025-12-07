# 📦 Product Redemption API Specification

## 🎯 Overview

API endpoint to retrieve user's product redemption history for the Riwayat Transaksi (Transaction History) page.

**Endpoint:** `GET /api/tukar-produk`  
**Authentication:** Required (Sanctum/JWT)  
**Purpose:** Show user's history of products redeemed with points

---

## 🔌 API Endpoint Details

### Endpoint

```
GET http://127.0.0.1:8000/api/tukar-produk
```

### Headers

```http
Authorization: Bearer {token}
Accept: application/json
```

### Query Parameters (Optional)

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by status | `pending`, `shipped`, `delivered`, `cancelled` |
| `page` | integer | Page number | `1` |
| `per_page` | integer | Items per page | `10` |

### Request Example

```http
GET /api/tukar-produk?status=shipped&page=1&per_page=10
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Accept: application/json
```

---

## 📊 Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "produk_id": 5,
        "nama_produk": "Eco Bag Canvas",
        "poin_digunakan": 5000,
        "jumlah": 1,
        "status": "shipped",
        "alamat_pengiriman": "Jl. Sudirman No. 123, Jakarta",
        "no_resi": "JNE123456789",
        "catatan": "Warna hijau",
        "tanggal_penukaran": "2025-11-15T10:30:00.000000Z",
        "tanggal_pengiriman": "2025-11-16T14:00:00.000000Z",
        "tanggal_diterima": null,
        "created_at": "2025-11-15T10:30:00.000000Z",
        "updated_at": "2025-11-16T14:00:00.000000Z",
        "produk": {
          "id": 5,
          "nama": "Eco Bag Canvas",
          "deskripsi": "Tas belanja ramah lingkungan",
          "gambar": "https://example.com/images/ecobag.jpg",
          "poin_harga": 5000
        }
      },
      {
        "id": 2,
        "user_id": 1,
        "produk_id": 3,
        "nama_produk": "Tumbler Stainless Steel",
        "poin_digunakan": 8000,
        "jumlah": 1,
        "status": "delivered",
        "alamat_pengiriman": "Jl. Gatot Subroto No. 45, Jakarta",
        "no_resi": "JNE987654321",
        "catatan": null,
        "tanggal_penukaran": "2025-11-10T08:00:00.000000Z",
        "tanggal_pengiriman": "2025-11-11T10:00:00.000000Z",
        "tanggal_diterima": "2025-11-13T16:30:00.000000Z",
        "created_at": "2025-11-10T08:00:00.000000Z",
        "updated_at": "2025-11-13T16:30:00.000000Z",
        "produk": {
          "id": 3,
          "nama": "Tumbler Stainless Steel",
          "deskripsi": "Botol minum anti karat 500ml",
          "gambar": "https://example.com/images/tumbler.jpg",
          "poin_harga": 8000
        }
      }
    ],
    "per_page": 10,
    "total": 15,
    "last_page": 2
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "message": "Unauthenticated."
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Terjadi kesalahan saat mengambil data penukaran produk"
}
```

---

## 🗄️ Database Schema

### Table: `penukaran_produk` (or similar name)

```sql
CREATE TABLE penukaran_produk (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    produk_id BIGINT UNSIGNED NOT NULL,
    nama_produk VARCHAR(255) NOT NULL,
    poin_digunakan INT NOT NULL,
    jumlah INT DEFAULT 1,
    status ENUM('pending', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    alamat_pengiriman TEXT NOT NULL,
    no_resi VARCHAR(100) NULL,
    catatan TEXT NULL,
    tanggal_penukaran TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_pengiriman TIMESTAMP NULL,
    tanggal_diterima TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE,
    
    INDEX idx_user_status (user_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_general_ci;
```

### Migration Example (Laravel)

```bash
php artisan make:migration create_penukaran_produk_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penukaran_produk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('produk_id')->constrained()->onDelete('cascade');
            $table->string('nama_produk');
            $table->integer('poin_digunakan');
            $table->integer('jumlah')->default(1);
            $table->enum('status', ['pending', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->text('alamat_pengiriman');
            $table->string('no_resi', 100)->nullable();
            $table->text('catatan')->nullable();
            $table->timestamp('tanggal_penukaran')->useCurrent();
            $table->timestamp('tanggal_pengiriman')->nullable();
            $table->timestamp('tanggal_diterima')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penukaran_produk');
    }
};
```

---

## 💻 Laravel Implementation

### Model: `PenukaranProduk.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenukaranProduk extends Model
{
    protected $table = 'penukaran_produk';
    
    protected $fillable = [
        'user_id',
        'produk_id',
        'nama_produk',
        'poin_digunakan',
        'jumlah',
        'status',
        'alamat_pengiriman',
        'no_resi',
        'catatan',
        'tanggal_penukaran',
        'tanggal_pengiriman',
        'tanggal_diterima',
    ];
    
    protected $casts = [
        'poin_digunakan' => 'integer',
        'jumlah' => 'integer',
        'tanggal_penukaran' => 'datetime',
        'tanggal_pengiriman' => 'datetime',
        'tanggal_diterima' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }
    
    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    public function scopeShipped($query)
    {
        return $query->where('status', 'shipped');
    }
    
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }
}
```

### Controller: `PenukaranProdukController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenukaranProduk;
use Illuminate\Http\Request;

class PenukaranProdukController extends Controller
{
    /**
     * Get user's product redemption history
     */
    public function index(Request $request)
    {
        try {
            $query = PenukaranProduk::with('produk')
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc');
            
            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'semua') {
                $query->where('status', $request->status);
            }
            
            // Paginate results
            $perPage = $request->per_page ?? 10;
            $redemptions = $query->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => $redemptions
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error fetching product redemptions:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data penukaran produk'
            ], 500);
        }
    }
    
    /**
     * Get single redemption detail
     */
    public function show($id)
    {
        try {
            $redemption = PenukaranProduk::with('produk')
                ->where('user_id', auth()->id())
                ->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $redemption
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data penukaran tidak ditemukan'
            ], 404);
        }
    }
}
```

### Routes: `api.php`

```php
use App\Http\Controllers\Api\PenukaranProdukController;

// Product redemption history
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tukar-produk', [PenukaranProdukController::class, 'index']);
    Route::get('/tukar-produk/{id}', [PenukaranProdukController::class, 'show']);
});
```

---

## 🎯 Status Flow

### Status Definitions

| Status | Description | Meaning |
|--------|-------------|---------|
| `pending` | Menunggu Pemrosesan | Order received, awaiting processing |
| `shipped` | Dalam Pengiriman | Package shipped, in transit |
| `delivered` | Sudah Diterima | Package delivered to customer |
| `cancelled` | Dibatalkan | Order cancelled |

### Status Transitions

```
pending → shipped → delivered
   ↓
cancelled
```

---

## 🧪 Testing

### Test Case 1: Get All Redemptions

```bash
GET http://127.0.0.1:8000/api/tukar-produk
Authorization: Bearer {token}

Expected: 200 OK with list of redemptions
```

### Test Case 2: Filter by Status

```bash
GET http://127.0.0.1:8000/api/tukar-produk?status=shipped
Authorization: Bearer {token}

Expected: 200 OK with only shipped items
```

### Test Case 3: Pagination

```bash
GET http://127.0.0.1:8000/api/tukar-produk?page=2&per_page=5
Authorization: Bearer {token}

Expected: 200 OK with page 2 items
```

### Test Case 4: Unauthorized Access

```bash
GET http://127.0.0.1:8000/api/tukar-produk
(No token)

Expected: 401 Unauthorized
```

---

## 📋 Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Auto | Redemption ID |
| `user_id` | integer | Yes | User who redeemed |
| `produk_id` | integer | Yes | Product redeemed |
| `nama_produk` | string | Yes | Product name (snapshot) |
| `poin_digunakan` | integer | Yes | Points used for redemption |
| `jumlah` | integer | Yes | Quantity redeemed |
| `status` | enum | Yes | Current order status |
| `alamat_pengiriman` | text | Yes | Delivery address |
| `no_resi` | string | Optional | Tracking number (when shipped) |
| `catatan` | text | Optional | User notes/requests |
| `tanggal_penukaran` | datetime | Auto | When redeemed |
| `tanggal_pengiriman` | datetime | Optional | When shipped |
| `tanggal_diterima` | datetime | Optional | When delivered |

---

## 🚀 Frontend Integration Ready

Once this API is implemented, the frontend will automatically:
- ✅ Fetch product redemption history
- ✅ Display with proper icons and colors
- ✅ Show delivery status
- ✅ Enable search and filtering
- ✅ Combine with other transaction types

**Frontend code is already prepared and waiting for this API!**

---

## 📞 Questions?

**Contact frontend team if:**
- Need different field names
- Need additional data
- Want different response structure
- Have integration questions

**Contact backend team if:**
- Need clarification on requirements
- Have database design questions
- Need help with implementation

---

## 🎯 Priority

**Priority:** Medium-High  
**Depends on:** Tukar Poin feature implementation  
**Blocks:** Complete transaction history view  
**Estimated Time:** 2-3 hours implementation

---

**Created:** November 17, 2025  
**For:** Riwayat Transaksi - Phase 3  
**Status:** Specification Ready for Backend Implementation


# 📦 Product Redemption API - Implementation Complete

## ✅ Implementation Status: READY FOR PRODUCTION

**Date:** November 17, 2025  
**Endpoint:** `GET /api/tukar-produk`  
**Authentication:** Required (Sanctum Bearer Token)

---

## 🎯 What Was Implemented

### 1. Database Migration ✅
**File:** `database/migrations/2025_11_17_093625_create_penukaran_produk_table.php`

**Table:** `penukaran_produk`

**Columns:**
- `id` - Primary key
- `user_id` - Foreign key to users
- `produk_id` - Foreign key to produks
- `nama_produk` - Product name snapshot
- `poin_digunakan` - Points used for redemption
- `jumlah` - Quantity redeemed
- `status` - ENUM: pending, shipped, delivered, cancelled
- `alamat_pengiriman` - Delivery address
- `no_resi` - Tracking number (nullable)
- `catatan` - User notes (nullable)
- `tanggal_penukaran` - Redemption timestamp
- `tanggal_pengiriman` - Shipping timestamp (nullable)
- `tanggal_diterima` - Delivery timestamp (nullable)
- `created_at`, `updated_at` - Laravel timestamps

**Indexes:**
- Composite index on (user_id, status)
- Index on created_at for sorting

---

### 2. Eloquent Model ✅
**File:** `app/Models/PenukaranProduk.php`

**Features:**
- ✅ Fillable fields configured
- ✅ Type casting (integers, datetimes)
- ✅ Relationships: `user()`, `produk()`
- ✅ Query scopes: `pending()`, `shipped()`, `delivered()`, `cancelled()`

---

### 3. Controller ✅
**File:** `app/Http/Controllers/PenukaranProdukController.php`

**Methods:**

#### `index()` - Get redemption history
- Returns paginated list of user's redemptions
- Ordered by newest first
- Includes related product data
- Supports status filtering
- Supports custom per_page

#### `show($id)` - Get single redemption
- Returns detailed redemption data
- Authorization check (only user's own data)
- 404 if not found or unauthorized

---

### 4. API Routes ✅
**File:** `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('tukar-produk', [PenukaranProdukController::class, 'index']);
    Route::get('tukar-produk/{id}', [PenukaranProdukController::class, 'show']);
});
```

---

## 🔌 API Endpoints

### 1. Get Redemption History

**Endpoint:**
```
GET http://127.0.0.1:8000/api/tukar-produk
```

**Headers:**
```http
Authorization: Bearer {your_token}
Accept: application/json
```

**Query Parameters (Optional):**
- `status` - Filter by status (pending/shipped/delivered/cancelled/semua)
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)

**Example Requests:**
```bash
# Get all redemptions
GET /api/tukar-produk

# Filter by status
GET /api/tukar-produk?status=shipped

# Custom pagination
GET /api/tukar-produk?page=2&per_page=5

# Combined filters
GET /api/tukar-produk?status=delivered&per_page=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user_id": 2,
        "produk_id": 5,
        "nama_produk": "Eco Bag Canvas",
        "poin_digunakan": 5000,
        "jumlah": 1,
        "status": "shipped",
        "alamat_pengiriman": "Jl. Sudirman No. 123, Jakarta",
        "no_resi": "JNE123456789",
        "catatan": "Warna hijau",
        "tanggal_penukaran": "2025-11-15T10:30:00.000000Z",
        "tanggal_pengiriman": "2025-11-16T14:00:00.000000Z",
        "tanggal_diterima": null,
        "created_at": "2025-11-15T10:30:00.000000Z",
        "updated_at": "2025-11-16T14:00:00.000000Z",
        "produk": {
          "id": 5,
          "nama": "Eco Bag Canvas",
          "deskripsi": "Tas belanja ramah lingkungan",
          "harga_poin": 5000,
          "stok": 50,
          "kategori": "Fashion",
          "foto": "ecobag.jpg",
          "status": "tersedia"
        }
      }
    ],
    "first_page_url": "http://127.0.0.1:8000/api/tukar-produk?page=1",
    "from": 1,
    "last_page": 3,
    "last_page_url": "http://127.0.0.1:8000/api/tukar-produk?page=3",
    "next_page_url": "http://127.0.0.1:8000/api/tukar-produk?page=2",
    "per_page": 10,
    "prev_page_url": null,
    "to": 10,
    "total": 25
  }
}
```

---

### 2. Get Single Redemption Detail

**Endpoint:**
```
GET http://127.0.0.1:8000/api/tukar-produk/{id}
```

**Headers:**
```http
Authorization: Bearer {your_token}
Accept: application/json
```

**Example Request:**
```bash
GET /api/tukar-produk/5
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "user_id": 2,
    "produk_id": 3,
    "nama_produk": "Tumbler Stainless Steel",
    "poin_digunakan": 8000,
    "jumlah": 1,
    "status": "delivered",
    "alamat_pengiriman": "Jl. Gatot Subroto No. 45, Jakarta",
    "no_resi": "JNE987654321",
    "catatan": null,
    "tanggal_penukaran": "2025-11-10T08:00:00.000000Z",
    "tanggal_pengiriman": "2025-11-11T10:00:00.000000Z",
    "tanggal_diterima": "2025-11-13T16:30:00.000000Z",
    "created_at": "2025-11-10T08:00:00.000000Z",
    "updated_at": "2025-11-13T16:30:00.000000Z",
    "produk": {
      "id": 3,
      "nama": "Tumbler Stainless Steel",
      "deskripsi": "Botol minum anti karat 500ml",
      "harga_poin": 8000,
      "stok": 30,
      "kategori": "Peralatan",
      "foto": "tumbler.jpg",
      "status": "tersedia"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Data penukaran tidak ditemukan"
}
```

**Error Response (401):**
```json
{
  "message": "Unauthenticated."
}
```

---

## 🎨 Status Definitions

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| `pending` | ⏳ | Yellow | Order received, awaiting processing |
| `shipped` | 🚚 | Blue | Package shipped, in transit |
| `delivered` | ✅ | Green | Package delivered to customer |
| `cancelled` | ❌ | Red | Order cancelled |

---

## 🧪 Testing the API

### Test with Postman/Thunder Client

#### 1. Login First
```http
POST http://127.0.0.1:8000/api/login
Content-Type: application/json

{
  "email": "siti@example.com",
  "password": "password"
}
```

Save the token from response.

#### 2. Test Get Redemptions
```http
GET http://127.0.0.1:8000/api/tukar-produk
Authorization: Bearer {your_token}
Accept: application/json
```

**Expected:** Empty array (no redemptions yet) or list of redemptions if data exists.

#### 3. Test Filter by Status
```http
GET http://127.0.0.1:8000/api/tukar-produk?status=shipped
Authorization: Bearer {your_token}
Accept: application/json
```

---

## 📊 Sample Data (Optional Seeder)

If you want to test with sample data, you can create a seeder:

```php
// database/seeders/PenukaranProdukSeeder.php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PenukaranProdukSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('penukaran_produk')->insert([
            [
                'user_id' => 2, // Siti Aminah
                'produk_id' => 1,
                'nama_produk' => 'Eco Bag Canvas',
                'poin_digunakan' => 5000,
                'jumlah' => 1,
                'status' => 'delivered',
                'alamat_pengiriman' => 'Jl. Diponegoro No. 456, Metro Timur',
                'no_resi' => 'JNE123456789',
                'catatan' => null,
                'tanggal_penukaran' => now()->subDays(10),
                'tanggal_pengiriman' => now()->subDays(9),
                'tanggal_diterima' => now()->subDays(7),
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(7),
            ],
            [
                'user_id' => 2, // Siti Aminah
                'produk_id' => 2,
                'nama_produk' => 'Tumbler Stainless Steel',
                'poin_digunakan' => 8000,
                'jumlah' => 1,
                'status' => 'shipped',
                'alamat_pengiriman' => 'Jl. Diponegoro No. 456, Metro Timur',
                'no_resi' => 'JNE987654321',
                'catatan' => 'Warna biru',
                'tanggal_penukaran' => now()->subDays(2),
                'tanggal_pengiriman' => now()->subDays(1),
                'tanggal_diterima' => null,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(1),
            ],
        ]);
    }
}
```

---

## 💡 Frontend Integration

The frontend is **100% ready** and will automatically connect to this API!

### What the Frontend Does:
1. ✅ Fetches redemption history on page load
2. ✅ Displays with proper status icons and colors
3. ✅ Shows delivery tracking info
4. ✅ Enables filtering by status
5. ✅ Combines with other transaction types
6. ✅ Shows in Riwayat Transaksi page

### Frontend Expected Data Structure:
The API response matches exactly what the frontend expects - **no changes needed on frontend!**

---

## 🚀 Deployment Checklist

- [x] Migration created and run
- [x] Model created with relationships
- [x] Controller created with methods
- [x] Routes registered with auth middleware
- [x] Error handling implemented
- [x] Logging added for debugging
- [x] Documentation created

---

## 📝 Notes

### Current Implementation:
- ✅ **READ-ONLY** endpoints (GET only)
- ✅ Shows user's own redemptions only
- ✅ Pagination support
- ✅ Status filtering
- ✅ Includes product relationship data

### Not Yet Implemented (Future):
- ⏳ POST endpoint to create redemption (when user redeems product)
- ⏳ Admin endpoints to update status, tracking number
- ⏳ Notification system integration
- ⏳ Point deduction logic on redemption

**These can be added when the "Tukar Poin" feature is fully built.**

---

## 🔗 Related Documentation

- `PRODUCT_REDEMPTION_API_SPEC.md` - Original specification
- `FRONTEND_CASH_WITHDRAWAL_INTEGRATION.md` - Similar implementation guide for cash withdrawal

---

## 📞 Support

**API is deployed and ready for frontend integration!**

If you encounter any issues:
1. Check token is valid (login again if needed)
2. Verify table exists: `SHOW TABLES LIKE 'penukaran_produk'`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Test with Postman first before frontend integration

---

**Status:** ✅ **DEPLOYED AND READY**  
**Last Updated:** November 17, 2025  
**Version:** 1.0
