# 🔧 Database Sync Guide - After Database Wipe

**Status**: Database wiped, needs full sync  
**Priority**: HIGH - Blocks all features  
**Components Affected**: Tabung Sampah, Tukar Poin, Leaderboard

---

## 🎯 What Needs to be Synced

### 1. **hargaTabel** (Price/Points Table)

This table contains the conversion rates and pricing:

```sql
CREATE TABLE hargaTabel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_tabel VARCHAR(100),
    nilai_poin INT,
    deskripsi TEXT,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expected data:
INSERT INTO hargaTabel (nama_tabel, nilai_poin, deskripsi) VALUES
('Konversi Poin Sampah', 100, '1 KG Sampah = 100 Poin'),
('Penarikan Tunai', 100, '100 Poin = Rp 1.000'),
-- ... other rates
```

### 2. **produk** (Products Table)

Products displayed in Tukar Poin:

```sql
CREATE TABLE produk (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(255),
    deskripsi TEXT,
    harga_poin INT,
    stok INT,
    kategori VARCHAR(100),
    foto VARCHAR(255),
    status ENUM('tersedia', 'habis') DEFAULT 'tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Expected data:
INSERT INTO produk (nama, deskripsi, harga_poin, stok, kategori, status) VALUES
('Lampu LED', 'Lampu hemat energi', 500, 10, 'Elektronik', 'tersedia'),
('Botol Reusable', 'Botol minum ramah lingkungan', 150, 20, 'Aksesoris', 'tersedia'),
-- ... more products
```

### 3. **users** (User Data)

Must have the points column:

```sql
ALTER TABLE users ADD COLUMN total_poin INT DEFAULT 0;
ALTER TABLE users ADD COLUMN poin_tersedia INT DEFAULT 0;

-- Verify columns exist:
DESCRIBE users;
-- Should show: total_poin, poin_tersedia
```

### 4. **penukaran_produk** (Redemption Records)

```sql
CREATE TABLE penukaran_produk (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    produk_id INT NOT NULL,
    jumlah_poin INT NOT NULL,
    jumlah INT DEFAULT 1,
    alamat_pengiriman VARCHAR(255),
    status ENUM('pending', 'approved', 'claimed', 'rejected') DEFAULT 'pending',
    approved_at TIMESTAMP NULL,
    claimed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);
```

---

## 🚀 Database Sync Steps

### Step 1: Create Missing Tables

```bash
# Run Laravel migrations
php artisan migrate --fresh

# Or manually create tables (use SQL above)
```

### Step 2: Seed Data

```bash
# If you have seeders
php artisan db:seed

# Or create seeder file with sample data
php artisan make:seeder ProdukSeeder
```

### Step 3: Verify Data Exists

```sql
-- Check hargaTabel
SELECT * FROM hargaTabel;

-- Check produk
SELECT * FROM produk LIMIT 5;

-- Check users has points columns
DESCRIBE users;

-- Check penukaran_produk table
DESCRIBE penukaran_produk;
```

### Step 4: Verify API Endpoints

```bash
# Test hargaTabel endpoint
curl -X GET http://127.0.0.1:8000/api/hargaTabel

# Test products endpoint
curl -X GET http://127.0.0.1:8000/api/produk

# Test dashboard stats (with token)
TOKEN="your_token"
curl -X GET http://127.0.0.1:8000/api/dashboard/stats/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Testing Checklist

After syncing database, verify:

### Frontend Tests:
- [ ] Tabung Sampah page loads products
- [ ] Products show correct `harga_poin` values
- [ ] Categories filter works
- [ ] Search works
- [ ] Sort by price works
- [ ] Redeem button shows correct points
- [ ] Leaderboard shows correct user points
- [ ] Leaderboard calculates correct rank

### Browser Console Debug:
Open DevTools (F12) → Console and look for:
```
===== LEADERBOARD STATS DEBUG =====
User stats full response: {...}
Extracted user points: [NUMBER]
===== END DEBUG =====
```

If `Extracted user points: 0`, then backend isn't returning data correctly.

### API Tests:
```bash
# Get user stats
curl -X GET http://127.0.0.1:8000/api/dashboard/stats/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq .

# Should return: total_poin, sampah_terkumpul, etc.
```

---

## 🔍 Debugging Stats Not Syncing

### Symptom: Poinmu shows 0 but you should have points

### Check 1: Verify User Points in Database
```sql
SELECT id, name, email, total_poin FROM users WHERE email LIKE '%adib%';
-- Should show: total_poin > 0
```

### Check 2: Check API Response
```bash
# SSH to server or use terminal:
curl -X GET http://127.0.0.1:8000/api/dashboard/stats/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# Look at the response:
# {
#   "status": "success",
#   "data": {
#     "total_poin": 0 or null or missing?
#   }
# }
```

### Check 3: Verify Controller Returns Correct Field

**File**: `app/Http/Controllers/DashboardController.php` → `stats()` method

```php
public function stats($userId)
{
    $user = User::find($userId);
    
    // MUST return total_poin, not poin
    return response()->json([
        'status' => 'success',
        'data' => [
            'total_poin' => $user->total_poin,  // ✅ Correct
            'total_sampah' => $user->total_sampah,
            // ... other fields
        ]
    ]);
}
```

### Check 4: Frontend Extraction

**File**: `leaderboardHeader.jsx` line ~45

Current code tries multiple fields:
```javascript
const userPoints = userStats.total_poin || userStats.poin_terkumpul || userStats.poin || 0;
```

Check browser console output:
```
Extracted user points: [see if this is 0 or correct]
User stats full response: {see what backend actually returned}
```

---

## 📊 Quick Sync Commands

### Create Database from Scratch
```bash
# Drop and recreate
php artisan migrate:fresh --seed

# Check if migrations exist
php artisan migrate:status
```

### Seed Sample Data
```bash
php artisan tinker

# Create sample products
$products = [
    ['nama' => 'Lampu LED', 'deskripsi' => 'Hemat energi', 'harga_poin' => 500, 'stok' => 10, 'kategori' => 'Elektronik'],
    ['nama' => 'Botol Reusable', 'deskripsi' => 'Ramah lingkungan', 'harga_poin' => 150, 'stok' => 20, 'kategori' => 'Aksesoris'],
];

foreach ($products as $p) {
    Produk::create([...$p, 'status' => 'tersedia']);
}

# Add points to user
$user = User::find(1);
$user->update(['total_poin' => 1000]);
```

### Verify Everything
```bash
php artisan tinker

# Check products
Produk::count();  # Should show > 0

# Check user points
User::first()->total_poin;  # Should show > 0

# Check penukaran
PenukaranProduk::count();  # Should show > 0
```

---

## ✅ Verification Checklist

After sync is complete:

- [ ] `hargaTabel` table exists and has data
- [ ] `produk` table exists and has products
- [ ] `users` table has `total_poin` column
- [ ] `penukaran_produk` table exists
- [ ] At least one test user has points > 0
- [ ] API endpoints return correct data
- [ ] Frontend displays correct points
- [ ] No console errors
- [ ] Leaderboard shows correct stats

---

## 🚀 Expected Result After Sync

| Feature | Before | After |
|---------|--------|-------|
| Tabung Sampah loads | ❌ 0 products | ✅ Products show |
| Poinmu displays | ❌ Shows 0 | ✅ Shows actual points |
| Redeem works | ❌ No products | ✅ Can redeem |
| Leaderboard | ❌ All zeros | ✅ Shows real data |

---

## 📞 If Still Having Issues

1. **Check Laravel logs**: `tail -f storage/logs/laravel.log`
2. **Enable debug**: Set `APP_DEBUG=true` in .env
3. **Test API directly**: Use curl/Postman
4. **Verify database**: Use MySQL client
5. **Check relationships**: Ensure foreign keys work

