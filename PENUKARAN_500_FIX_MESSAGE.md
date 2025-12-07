# ⚡ URGENT: 500 Error When Creating Redemption

**Status**: Points validation fixed ✅, but creation fails ❌  
**Error**: 500 "Terjadi kesalahan saat membuat penukaran produk"  
**Likely Cause**: Missing `status` field in create() call  
**Time to Fix**: 1-2 minutes

---

## 🚨 For Backend Developer (READ NOW!)

### The Problem
After your fix for the points validation, trying to redeem now gives a **500 error** when creating the redemption record.

### The Most Likely Fix
In `PenukaranProdukController@store`, when creating the redemption, add the `status` field:

```php
// ADD THIS:
$penukaran = PenukaranProduk::create([
    'user_id' => $user->id,
    'produk_id' => $request->produk_id,
    'jumlah_poin' => $totalPoin,
    'jumlah' => $request->jumlah,
    'alamat_pengiriman' => $request->alamat_pengiriman,
    'status' => 'pending',  // ← ADD THIS LINE!
    'approved_at' => null,
    'claimed_at' => null,
    'rejection_reason' => null,
    'admin_note' => null,
]);
```

### Debug Steps (If above doesn't work)

1. **Enable debug mode**:
   ```bash
   # Edit .env
   APP_DEBUG=true
   ```

2. **Check logs** to see actual error:
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Test in tinker**:
   ```bash
   php artisan tinker
   $user = User::find(1);
   $product = Produk::find(1);
   $penukaran = PenukaranProduk::create([
       'user_id' => $user->id,
       'produk_id' => $product->id,
       'jumlah_poin' => 50,
       'jumlah' => 1,
       'alamat_pengiriman' => 'Ambil di Bank Sampah',
       'status' => 'pending',
   ]);
   ```

### Full Reference Doc
See **PENUKARAN_PRODUK_500_ERROR.md** for detailed debugging

---

## 🎯 What Likely Happened

**Database table probably has**:
```sql
status VARCHAR(20) NOT NULL
```

**Without default value**, so it MUST be provided when creating a record.

**Frontend sends**: `{produk_id, jumlah_poin, jumlah, alamat_pengiriman}`  
**Backend needs**: `{..., status, approved_at, claimed_at, ...}`  
**Result**: Fails to insert → 500 error ❌

---

## ✅ After Fix

- Add the missing `status` field
- Test redemption again
- Should see: 201 Created ✅
- Redemption should appear in database

---

## 📞 Need Help?

Check: **PENUKARAN_PRODUK_500_ERROR.md**

