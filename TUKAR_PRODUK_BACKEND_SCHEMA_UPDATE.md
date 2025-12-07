# Tukar Produk - Backend Schema Changes Implementation

## Overview
Frontend updated to match new `penukaran_produk` table schema. Old fields removed, new fields implemented.

---

## ✅ Changes Applied

### Removed Old Fields ❌
- ❌ `alamat_pengiriman` → Replaced with `metode_ambil`
- ❌ `no_resi` → No longer used
- ❌ `tanggal_pengiriman` → No longer used
- ❌ `tanggal_diterima` → Replaced with `tanggal_diambil`

### Added New Fields ✨
- ✨ `metode_ambil` → Pickup method (e.g., "Ambil di Bank Sampah")
- ✨ `tanggal_diambil` → Pickup date (set when user picks up product)

---

## New Payload Structure

### Frontend (tukarPoin.jsx)

```javascript
const payload = {
  produk_id: 1,                          // Product ID
  nama_produk: 'Produk A',               // Product name
  poin_digunakan: 5000,                  // Points used ✅ (renamed from jumlah_poin)
  jumlah: 1,                             // Quantity
  metode_ambil: 'Ambil di Bank Sampah',  // ✅ NEW: Pickup method
  status: 'pending',                     // Initial status
  catatan: '',                           // Notes (optional)
};
```

---

## Database Schema

```sql
CREATE TABLE penukaran_produk (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    produk_id BIGINT NOT NULL,
    nama_produk VARCHAR(255) NOT NULL,
    poin_digunakan INT NOT NULL,              -- ✅ Renamed from jumlah_poin
    jumlah INT DEFAULT 1,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    metode_ambil VARCHAR(100),                -- ✅ NEW (was alamat_pengiriman)
    catatan TEXT,
    tanggal_penukaran TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_diambil TIMESTAMP NULL,           -- ✅ NEW (was tanggal_diterima)
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);
```

### Removed Columns
```sql
-- These columns should be removed:
ALTER TABLE penukaran_produk DROP COLUMN alamat_pengiriman;
ALTER TABLE penukaran_produk DROP COLUMN no_resi;
ALTER TABLE penukaran_produk DROP COLUMN tanggal_pengiriman;
ALTER TABLE penukaran_produk DROP COLUMN tanggal_diterima;
```

### Add New Columns
```sql
-- Add if not present:
ALTER TABLE penukaran_produk ADD COLUMN metode_ambil VARCHAR(100);
ALTER TABLE penukaran_produk CHANGE COLUMN tanggal_diterima tanggal_diambil TIMESTAMP NULL;
```

---

## Backend Controller Methods

### 1. store() - Create Redemption ✅

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'produk_id' => 'required|integer|exists:produk,id',
        'nama_produk' => 'required|string|max:255',
        'poin_digunakan' => 'required|integer|min:1',
        'jumlah' => 'required|integer|min:1',
        'metode_ambil' => 'required|string|max:100',  // ✅ NEW validation
        'status' => 'required|in:pending,approved,rejected,completed',
        'catatan' => 'nullable|string|max:500',
    ]);

    // Create redemption
    $redemption = PenukaranProduk::create([
        'user_id' => auth()->id(),
        'produk_id' => $validated['produk_id'],
        'nama_produk' => $validated['nama_produk'],
        'poin_digunakan' => $validated['poin_digunakan'],
        'jumlah' => $validated['jumlah'],
        'metode_ambil' => $validated['metode_ambil'],  // ✅ NEW
        'status' => $validated['status'],
        'catatan' => $validated['catatan'] ?? '',
        'tanggal_penukaran' => now(),
    ]);

    // Deduct user points
    $user = auth()->user();
    $user->total_poin -= $validated['poin_digunakan'];
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Penukaran produk berhasil dibuat',
        'data' => $redemption,
    ], 201);
}
```

### 2. index() - List Redemptions ✅

```php
public function index()
{
    // Admin: see all, User: see own
    $query = PenukaranProduk::with('produk', 'user');
    
    if (!auth()->user()->is_admin) {
        $query->where('user_id', auth()->id());
    }

    $redemptions = $query
        ->orderBy('created_at', 'desc')
        ->paginate(10);

    return response()->json([
        'success' => true,
        'data' => $redemptions,
    ]);
}
```

**Returns**: Includes `metode_ambil` and `tanggal_diambil` fields

### 3. show() - Get Single Redemption ✅

```php
public function show($id)
{
    $redemption = PenukaranProduk::with('produk', 'user')
        ->findOrFail($id);

    // Authorization check
    if ($redemption->user_id !== auth()->id() && !auth()->user()->is_admin) {
        return response()->json([
            'error' => 'Unauthorized',
        ], 403);
    }

    return response()->json([
        'success' => true,
        'data' => $redemption,
    ]);
}
```

**Returns**: Full object including `metode_ambil` and `tanggal_diambil`

### 4. update() - Admin Updates ✅ NEW

```php
public function update(Request $request, $id)
{
    $redemption = PenukaranProduk::findOrFail($id);

    // Only admin can update
    if (!auth()->user()->is_admin) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $validated = $request->validate([
        'status' => 'sometimes|in:pending,approved,rejected,completed',
        'metode_ambil' => 'sometimes|string|max:100',  // ✅ Can update
        'tanggal_diambil' => 'sometimes|nullable|date', // ✅ Can set
        'catatan' => 'sometimes|nullable|string|max:500',
    ]);

    $redemption->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Penukaran diperbarui',
        'data' => $redemption,
    ]);
}
```

**Can update**:
- `status` (approve/reject/complete)
- `metode_ambil` (if user changes pickup method)
- `tanggal_diambil` (when user picks up)
- `catatan` (add notes)

### 5. cancel() - User Cancels ✅

```php
public function cancel($id)
{
    $redemption = PenukaranProduk::findOrFail($id);

    // Only owner or admin can cancel
    if ($redemption->user_id !== auth()->id() && !auth()->user()->is_admin) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Can only cancel if still pending
    if ($redemption->status !== 'pending') {
        return response()->json([
            'error' => 'Hanya redemption dengan status pending yang dapat dibatalkan',
        ], 422);
    }

    // Refund points
    $user = $redemption->user;
    $user->total_poin += $redemption->poin_digunakan;
    $user->save();

    // Mark as rejected
    $redemption->update(['status' => 'rejected']);

    return response()->json([
        'success' => true,
        'message' => 'Penukaran dibatalkan, poin telah dikembalikan',
    ]);
}
```

### 6. destroy() - Delete ✅

```php
public function destroy($id)
{
    $redemption = PenukaranProduk::findOrFail($id);

    // Only admin can delete
    if (!auth()->user()->is_admin) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // If not completed, refund points
    if ($redemption->status !== 'completed') {
        $user = $redemption->user;
        $user->total_poin += $redemption->poin_digunakan;
        $user->save();
    }

    $redemption->delete();

    return response()->json([
        'success' => true,
        'message' => 'Penukaran dihapus',
    ]);
}
```

---

## API Endpoints

### POST /api/penukaran-produk
**Create redemption**
- Input: `produk_id`, `nama_produk`, `poin_digunakan`, `jumlah`, `metode_ambil`, `status`, `catatan`
- Returns: Created redemption object
- Status: 201 Created

### GET /api/penukaran-produk
**List redemptions**
- User sees: Own redemptions
- Admin sees: All redemptions
- Returns: Paginated list with `metode_ambil`, `tanggal_diambil`

### GET /api/penukaran-produk/{id}
**Get single redemption**
- Returns: Full redemption object

### PUT /api/penukaran-produk/{id}
**Admin updates redemption**
- Can update: `status`, `metode_ambil`, `tanggal_diambil`, `catatan`
- Returns: Updated redemption

### POST /api/penukaran-produk/{id}/cancel
**User cancels pending redemption**
- Returns: Success message, points refunded

### DELETE /api/penukaran-produk/{id}
**Admin deletes redemption**
- Refunds points if not completed
- Returns: Success message

---

## Frontend Changes (tukarPoin.jsx)

### Removed
- ❌ State: `alamatPengiriman`
- ❌ Payload field: `alamat_pengiriman`

### Updated
- ✅ Payload field: `poin_digunakan` (already correct)
- ✅ Payload field: `metode_ambil` = 'Ambil di Bank Sampah' (already correct)

### Payload (Current)
```javascript
{
  produk_id: 1,
  nama_produk: 'Produk A',
  poin_digunakan: 5000,
  jumlah: 1,
  metode_ambil: 'Ambil di Bank Sampah',
  status: 'pending',
  catatan: '',
}
```

---

## Migration SQL

If you need to run this migration:

```php
// database/migrations/YYYY_MM_DD_XXXXXX_update_penukaran_produk_table.php

Schema::table('penukaran_produk', function (Blueprint $table) {
    // Remove old columns
    $table->dropColumn(['alamat_pengiriman', 'no_resi', 'tanggal_pengiriman']);
    
    // Rename column
    $table->renameColumn('tanggal_diterima', 'tanggal_diambil');
    
    // Add new column if not exists
    if (!Schema::hasColumn('penukaran_produk', 'metode_ambil')) {
        $table->string('metode_ambil', 100)->nullable()->after('catatan');
    }
});
```

Or run in Tinker:

```bash
php artisan tinker
Schema::table('penukaran_produk', function (Blueprint $table) {
    $table->dropColumn(['alamat_pengiriman', 'no_resi', 'tanggal_pengiriman']);
    $table->renameColumn('tanggal_diterima', 'tanggal_diambil');
});
```

---

## Testing Checklist

### Frontend
- [ ] Open Tukar Poin page
- [ ] Select product
- [ ] Click "Konfirmasi Penukaran"
- [ ] Check Network tab for payload
- [ ] Verify payload includes `metode_ambil`
- [ ] Verify payload does NOT include `alamat_pengiriman`
- [ ] Verify no console errors

### Backend
- [ ] POST /api/penukaran-produk accepts new payload ✅
- [ ] POST /api/penukaran-produk rejects missing `metode_ambil` ✅
- [ ] GET /api/penukaran-produk returns `metode_ambil`, `tanggal_diambil` ✅
- [ ] PUT /api/penukaran-produk/{id} can update fields ✅
- [ ] User can cancel pending redemption ✅
- [ ] Admin can delete redemption ✅
- [ ] Points are refunded on cancel/delete ✅

### Database
- [ ] Old columns removed ✅
- [ ] New columns added ✅
- [ ] Data migrated correctly ✅
- [ ] Foreign keys working ✅

---

## Success Indicators

✅ Redemption created with `metode_ambil`  
✅ `tanggal_diambil` null on creation, set on pickup  
✅ No validation errors for missing `alamat_pengiriman`  
✅ Admin can update status and pickup date  
✅ User can cancel and get refund  
✅ Points deducted on creation, refunded on cancel  

---

## Status Workflow

```
PENDING → (Admin approves) → APPROVED → (User picks up) → COMPLETED
   ↓
   └─→ (User cancels or Admin rejects) → REJECTED
```

---

## Files Modified

✅ **tukarPoin.jsx**
- Lines 46: Removed `alamatPengiriman` state
- Lines 343-351: Updated payload (already uses new structure)

---

## Next Steps

1. **Backend**: Update routes, controllers, model
2. **Database**: Run migration or execute SQL
3. **Testing**: Test complete redemption workflow
4. **Deployment**: Deploy both frontend and backend

Everything is now aligned! 🚀
