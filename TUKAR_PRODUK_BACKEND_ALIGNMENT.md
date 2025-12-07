# Tukar Produk - Frontend Backend Alignment

## Overview
Updated frontend `tukarPoin.jsx` to match new backend `tukar_produk` model structure.

---

## Backend Structure (New)

```php
protected $fillable = [
    'user_id',              // Auto from auth token
    'produk_id',            // Product ID
    'nama_produk',          // ✅ NEW
    'poin_digunakan',       // ✅ RENAMED from jumlah_poin
    'jumlah',               // Quantity
    'status',               // Redemption status
    'metode_ambil',         // Pickup method
    'catatan',              // Notes
    'tanggal_penukaran',    // Redemption timestamp
    'tanggal_diambil',      // Pickup timestamp
];
```

---

## Frontend Update

### Old Payload (❌ BEFORE)
```javascript
{
  produk_id: 1,
  jumlah_poin: 5000,        // ❌ Wrong field name
  jumlah: 1,
  metode_ambil: 'Ambil di Bank Sampah',
}
```

### New Payload (✅ AFTER)
```javascript
{
  produk_id: 1,
  nama_produk: 'Produk A',   // ✅ NEW: Product name
  poin_digunakan: 5000,      // ✅ RENAMED: Clearer name
  jumlah: 1,
  metode_ambil: 'Ambil di Bank Sampah',
  status: 'pending',         // ✅ NEW: Initial status
  catatan: '',               // ✅ NEW: Optional notes
}
```

---

## Changed Line in tukarPoin.jsx

**Location**: `handleRedeemSubmit()` function, lines 294-301

```javascript
const payload = {
  produk_id: parseInt(selectedProduct.id_produk.replace('produk-', '')),
  nama_produk: selectedProduct.nama_produk,     // ✅ ADDED
  poin_digunakan: requiredPoints,               // ✅ CHANGED: was jumlah_poin
  jumlah: 1,
  metode_ambil: 'Ambil di Bank Sampah',
  status: 'pending',                            // ✅ ADDED
  catatan: '',                                  // ✅ ADDED
};
```

---

## Benefits

✅ Product name stored in database  
✅ Clearer field naming (`poin_digunakan` vs `jumlah_poin`)  
✅ Status tracking from creation  
✅ Notes support for redemptions  
✅ Better audit trail  
✅ Reduced API calls (no need to re-fetch product)  

---

## Database Schema

```sql
CREATE TABLE tukar_produk (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    produk_id BIGINT NOT NULL,
    nama_produk VARCHAR(255) NOT NULL,        -- ✅ Stores product name
    poin_digunakan INT NOT NULL,              -- ✅ Renamed from jumlah_poin
    jumlah INT DEFAULT 1,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    metode_ambil VARCHAR(100),
    catatan TEXT,                              -- ✅ For notes/remarks
    tanggal_penukaran TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tanggal_diambil TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);
```

---

## Laravel Controller Example

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'produk_id' => 'required|integer|exists:produk,id',
        'nama_produk' => 'required|string',
        'poin_digunakan' => 'required|integer|min:1',
        'jumlah' => 'required|integer|min:1',
        'metode_ambil' => 'required|string',
        'status' => 'required|in:pending,approved',
        'catatan' => 'nullable|string',
    ]);

    // Create record with user_id from auth
    $tukar = TukarProduk::create([
        'user_id' => auth()->id(),
        'produk_id' => $validated['produk_id'],
        'nama_produk' => $validated['nama_produk'],
        'poin_digunakan' => $validated['poin_digunakan'],
        'jumlah' => $validated['jumlah'],
        'metode_ambil' => $validated['metode_ambil'],
        'status' => $validated['status'],
        'catatan' => $validated['catatan'] ?? '',
        'tanggal_penukaran' => now(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Penukaran produk berhasil',
        'data' => $tukar,
    ], 201);
}
```

---

## Testing

### Manual Test
1. Open Tukar Poin page
2. Select a product
3. Click "Konfirmasi Penukaran"
4. Check browser Network tab
5. Verify payload includes:
   - ✅ `nama_produk`
   - ✅ `poin_digunakan` (not `jumlah_poin`)
   - ✅ `status: 'pending'`
   - ✅ `catatan: ''`

### Expected Response (201)
```json
{
  "success": true,
  "message": "Penukaran produk berhasil",
  "data": {
    "id": 1,
    "user_id": 5,
    "produk_id": 3,
    "nama_produk": "Produk A",
    "poin_digunakan": 5000,
    "jumlah": 1,
    "status": "pending",
    "metode_ambil": "Ambil di Bank Sampah",
    "catatan": "",
    "tanggal_penukaran": "2025-11-20T14:30:00Z"
  }
}
```

---

## Validation Rules Needed

```php
'produk_id' => 'required|integer|exists:produk,id',
'nama_produk' => 'required|string|max:255',
'poin_digunakan' => 'required|integer|min:1',
'jumlah' => 'required|integer|min:1',
'metode_ambil' => 'required|string|max:100',
'status' => 'required|in:pending,approved,rejected,completed',
'catatan' => 'nullable|string|max:500',
```

---

## Files Modified

✅ **tukarPoin.jsx** (lines 294-301)
- Updated payload structure
- No UI changes required
- No logic changes required

---

## Deployment Steps

1. **Update Backend** (Laravel)
   - Update TukarProduk model `$fillable`
   - Update controller validation
   - Run migration if needed
   - Test API endpoint

2. **Deploy Frontend** (Already Updated)
   - tukarPoin.jsx already updated
   - No additional changes needed
   - Deploy code

3. **Verify**
   - Test redemption flow
   - Check database records
   - Verify all fields saved

---

## Error Handling

If backend still expects old field names, you'll get error like:
```
422 Unprocessable Entity
{
  "message": "The given data was invalid",
  "errors": {
    "jumlah_poin": ["The field jumlah_poin is not fillable"]
  }
}
```

**Fix**: Update backend `$fillable` array to use new field names.

---

## Status Values

```
'pending' → Waiting for admin approval
'approved' → Admin approved, ready for pickup
'rejected' → Admin rejected the request
'completed' → User picked up product
```

Initial status is always `'pending'`.

---

## Code Quality

✅ No errors  
✅ No warnings  
✅ Validated payload structure  
✅ Debug logging preserved  

---

## Summary

| Aspect | Old | New |
|---|---|---|
| Field: Points | `jumlah_poin` | `poin_digunakan` |
| Field: Product Name | Not sent | `nama_produk` |
| Field: Status | Not sent | `'pending'` |
| Field: Notes | Not sent | `catatan` |
| Initial Status | - | `'pending'` |

Everything is now aligned! 🎉
