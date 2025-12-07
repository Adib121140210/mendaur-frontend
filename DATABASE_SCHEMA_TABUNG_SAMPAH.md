# Database Schema for Setor Sampah Integration 🗄️

## Current Implementation Status

The form now sends the following data to the backend. Make sure your database schema matches!

---

## Table: `tabung_sampah` (Waste Deposits)

```sql
CREATE TABLE tabung_sampah (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  
  -- User & Schedule
  user_id BIGINT UNSIGNED NOT NULL REFERENCES users(id),
  jadwal_id BIGINT UNSIGNED NOT NULL REFERENCES jadwal_penyetoran(id),
  
  -- User Information (stored from form)
  nama_lengkap VARCHAR(255) NOT NULL,              -- Auto-filled from user.nama
  no_hp VARCHAR(20) NOT NULL,                      -- Auto-filled from user.no_hp
  
  -- Waste Details
  jenis_sampah VARCHAR(100) NOT NULL,              -- Category: Kertas, Plastik, Logam, etc.
  titik_lokasi LONGTEXT NOT NULL,                  -- GPS link: https://www.google.com/maps?q=...
  foto_sampah VARCHAR(255) NOT NULL,               -- File path: /storage/uploads/...
  
  -- Estimated Weight/Amount (optional but useful)
  estimasi_berat_sampah DECIMAL(8, 2) DEFAULT NULL,
  estimasi_jumlah_item INT DEFAULT NULL,
  
  -- Status Tracking
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  
  -- Additional Info
  catatan_admin TEXT DEFAULT NULL,
  bukti_penjemputan VARCHAR(255) DEFAULT NULL,     -- Photo after pickup
  berat_asli_sampah DECIMAL(8, 2) DEFAULT NULL,    -- Actual weight after pickup
  poin_diberikan INT DEFAULT 0,                    -- Points earned
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_at TIMESTAMP DEFAULT NULL,
  rejected_at TIMESTAMP DEFAULT NULL,
  completed_at TIMESTAMP DEFAULT NULL,
  
  -- Indexes for queries
  INDEX idx_user_id (user_id),
  INDEX idx_jadwal_id (jadwal_id),
  INDEX idx_jenis_sampah (jenis_sampah),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

---

## Migration (Laravel)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tabung_sampah', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('jadwal_id')->constrained('jadwal_penyetoran')->onDelete('cascade');
            
            // User information from form
            $table->string('nama_lengkap');
            $table->string('no_hp');
            
            // Waste details - THESE ARE NEW!
            $table->string('jenis_sampah');     // Category selected by user
            $table->longText('titik_lokasi');   // GPS coordinates as Google Maps link
            $table->string('foto_sampah');      // Uploaded waste photo
            
            // Additional fields
            $table->decimal('estimasi_berat_sampah', 8, 2)->nullable();
            $table->integer('estimasi_jumlah_item')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->text('catatan_admin')->nullable();
            
            // Pickup verification
            $table->string('bukti_penjemputan')->nullable();
            $table->decimal('berat_asli_sampah', 8, 2)->nullable();
            $table->integer('poin_diberikan')->default(0);
            
            // Timestamps
            $table->timestamps();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            // Indexes
            $table->index('user_id');
            $table->index('jadwal_id');
            $table->index('jenis_sampah');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tabung_sampah');
    }
};
```

---

## Valid `jenis_sampah` Values

These must match the categories defined in frontend:

```php
<?php

// Allowed waste categories
const WASTE_CATEGORIES = [
    'Kertas',      // Paper (Kardus, kertas bekas, majalah)
    'Plastik',     // Plastic (Botol, tas, bungkus)
    'Logam',       // Metal (Kaleng, besi, alumunium)
    'Tekstil',     // Textile (Baju, kain, sepatu bekas)
    'Elektronik',  // Electronics (HP, TV, laptop)
    'Campuran',    // Mixed/Other
];

// Optional: Store in database
Schema::create('waste_categories', function (Blueprint $table) {
    $table->id();
    $table->string('nama_kategori')->unique();
    $table->string('warna_hex');  // e.g., '#047857'
    $table->integer('poin_per_kg')->default(100);
    $table->boolean('aktif')->default(true);
    $table->timestamps();
});
```

---

## Data Examples

### Example 1: Plastik Deposit

```json
{
  "user_id": 1,
  "jadwal_id": 3,
  "nama_lengkap": "Adib Surya",
  "no_hp": "081234567890",
  "jenis_sampah": "Plastik",
  "titik_lokasi": "https://www.google.com/maps?q=-6.2088,106.8456",
  "foto_sampah": "uploads/tabung_sampah_1234567890.jpg",
  "estimasi_berat_sampah": 5.5,
  "estimasi_jumlah_item": 12,
  "status": "pending",
  "created_at": "2024-11-20T10:30:00Z"
}
```

### Example 2: Logam Deposit

```json
{
  "user_id": 2,
  "jadwal_id": 5,
  "nama_lengkap": "Desi Oktaviani",
  "no_hp": "081234567002",
  "jenis_sampah": "Logam",
  "titik_lokasi": "https://www.google.com/maps?q=-6.1753,106.8249",
  "foto_sampah": "uploads/tabung_sampah_9876543210.jpg",
  "estimasi_berat_sampah": 3.2,
  "estimasi_jumlah_item": 8,
  "status": "pending",
  "created_at": "2024-11-20T11:45:00Z"
}
```

---

## Backend Controller Example

```php
<?php

namespace App\Http\Controllers;

use App\Models\TabungSampah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TabungSampahController extends Controller
{
    public function store(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'jadwal_id' => 'required|integer|exists:jadwal_penyetoran,id',
            'nama_lengkap' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'jenis_sampah' => 'required|in:Kertas,Plastik,Logam,Tekstil,Elektronik,Campuran',
            'titik_lokasi' => 'required|string',
            'foto_sampah' => 'required|image|max:5120', // 5MB max
            'estimasi_berat_sampah' => 'nullable|numeric|min:3', // Minimum 3kg
        ]);

        // Store uploaded photo
        if ($request->hasFile('foto_sampah')) {
            $path = $request->file('foto_sampah')->store(
                'tabung_sampah',
                'public'
            );
            $validated['foto_sampah'] = $path;
        }

        // Set initial status
        $validated['status'] = 'pending';

        // Create record
        $tabungSampah = TabungSampah::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Setor sampah berhasil!',
            'data' => $tabungSampah,
        ], 201);
    }

    public function getUserDeposits($userId)
    {
        $deposits = TabungSampah::where('user_id', $userId)
            ->with('jadwal')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $deposits,
        ]);
    }

    public function getByCategory($category)
    {
        $deposits = TabungSampah::where('jenis_sampah', $category)
            ->where('status', '!=', 'rejected')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $deposits,
        ]);
    }

    public function getStatistics()
    {
        // Analytics for dashboard
        $stats = [
            'total_deposits' => TabungSampah::count(),
            'pending_pickups' => TabungSampah::where('status', 'pending')->count(),
            'completed_pickups' => TabungSampah::where('status', 'completed')->count(),
            'by_category' => TabungSampah::groupBy('jenis_sampah')
                ->selectRaw('jenis_sampah, COUNT(*) as count, SUM(berat_asli_sampah) as total_berat')
                ->get(),
            'by_location' => TabungSampah::selectRaw('titik_lokasi, COUNT(*) as count')
                ->groupBy('titik_lokasi')
                ->get(),
        ];

        return response()->json($stats);
    }
}
```

---

## Routes (Laravel)

```php
<?php

Route::middleware('auth:sanctum')->group(function () {
    // Store new deposit
    Route::post('/tabung-sampah', [TabungSampahController::class, 'store']);
    
    // Get user's deposits
    Route::get('/tabung-sampah/user/{userId}', [TabungSampahController::class, 'getUserDeposits']);
    
    // Get deposits by category
    Route::get('/tabung-sampah/category/{category}', [TabungSampahController::class, 'getByCategory']);
    
    // Admin: Get statistics
    Route::get('/tabung-sampah/stats', [TabungSampahController::class, 'getStatistics'])->middleware('admin');
});
```

---

## Query Examples

### Get all "Plastik" deposits this month
```sql
SELECT * FROM tabung_sampah
WHERE jenis_sampah = 'Plastik'
  AND MONTH(created_at) = MONTH(NOW())
  AND YEAR(created_at) = YEAR(NOW())
ORDER BY created_at DESC;
```

### Get total waste by category
```sql
SELECT 
  jenis_sampah,
  COUNT(*) as jumlah_setoran,
  SUM(berat_asli_sampah) as total_berat_kg
FROM tabung_sampah
WHERE status = 'completed'
GROUP BY jenis_sampah
ORDER BY total_berat_kg DESC;
```

### Get deposits needing pickup
```sql
SELECT ts.*, u.nama, j.tanggal, j.lokasi
FROM tabung_sampah ts
JOIN users u ON ts.user_id = u.id
JOIN jadwal_penyetoran j ON ts.jadwal_id = j.id
WHERE ts.status = 'approved'
ORDER BY j.tanggal ASC;
```

### Get heat map data (deposits by location)
```sql
SELECT 
  titik_lokasi,
  COUNT(*) as frequency,
  MAX(created_at) as latest
FROM tabung_sampah
WHERE status IN ('approved', 'completed')
GROUP BY titik_lokasi
ORDER BY frequency DESC;
```

---

## Validation Rules

The backend should validate:

```php
<?php

// Validate category
if (!in_array($jenis_sampah, ['Kertas', 'Plastik', 'Logam', 'Tekstil', 'Elektronik', 'Campuran'])) {
    return error('Kategori sampah tidak valid');
}

// Validate GPS link
if (!preg_match('/https:\/\/www\.google\.com\/maps\?q=/', $titik_lokasi)) {
    return error('Titik lokasi harus berupa link Google Maps');
}

// Validate weight
if ($estimasi_berat_sampah < 3) {
    return error('Berat minimum sampah adalah 3 kg');
}

// Validate photo
if (!in_array($foto_sampah->getClientMimeType(), ['image/jpeg', 'image/png', 'image/webp'])) {
    return error('File harus berupa gambar (JPEG, PNG, WebP)');
}

// Validate user & schedule exist
if (!User::find($user_id) || !JadwalPenyetoran::find($jadwal_id)) {
    return error('User atau jadwal tidak ditemukan');
}
```

---

## Points Calculation Example

```php
<?php

// Define points per kg by category
const POINTS_PER_KG = [
    'Kertas' => 50,        // 50 points per kg
    'Plastik' => 75,       // 75 points per kg
    'Logam' => 150,        // 150 points per kg (valuable)
    'Tekstil' => 30,       // 30 points per kg
    'Elektronik' => 200,   // 200 points per kg (hazardous)
    'Campuran' => 25,      // 25 points per kg
];

// Calculate when pickup is completed
$tabung = TabungSampah::find($id);

if ($tabung->status === 'completed' && $tabung->berat_asli_sampah) {
    $poinDiberikan = $tabung->berat_asli_sampah * POINTS_PER_KG[$tabung->jenis_sampah];
    
    // Update user points
    $user = User::find($tabung->user_id);
    $user->total_poin += $poinDiberikan;
    $user->save();
    
    // Record in database
    $tabung->poin_diberikan = $poinDiberikan;
    $tabung->save();
}
```

---

## Indexing for Performance

```sql
-- Speed up common queries
CREATE INDEX idx_user_jenis ON tabung_sampah(user_id, jenis_sampah);
CREATE INDEX idx_status_date ON tabung_sampah(status, created_at DESC);
CREATE INDEX idx_jadwal_status ON tabung_sampah(jadwal_id, status);
CREATE INDEX idx_kategori_bulan ON tabung_sampah(jenis_sampah, MONTH(created_at));
```

---

## Monitoring & Analytics

Track these metrics:

```javascript
{
  "total_deposits": 1250,
  "pending_pickups": 45,
  "average_weight_per_deposit": 4.2,
  "most_common_category": "Plastik",
  "deposits_this_week": 280,
  "top_locations": [
    { "location": "Jalan Merdeka", "count": 125 },
    { "location": "Jalan Sudirman", "count": 98 }
  ],
  "categories_distribution": {
    "Plastik": "45%",
    "Kertas": "25%",
    "Logam": "15%",
    "Tekstil": "10%",
    "Elektronik": "3%",
    "Campuran": "2%"
  }
}
```

---

## Migration Checklist

Before deploying, ensure:

- [ ] Database has `tabung_sampah` table
- [ ] All columns present with correct types
- [ ] Foreign keys configured
- [ ] Indexes created for performance
- [ ] `jenis_sampah` ENUM includes all 6 categories
- [ ] `status` ENUM includes: pending, approved, rejected, completed
- [ ] `titik_lokasi` is LONGTEXT (to store full URL)
- [ ] File storage path configured (`storage/app/public/tabung_sampah/`)
- [ ] Backend validation matches schema
- [ ] Tests pass for CRUD operations

---

**Status**: ✅ **READY FOR BACKEND INTEGRATION**

If your schema doesn't match, update it to include the `jenis_sampah` and `titik_lokasi` fields!
