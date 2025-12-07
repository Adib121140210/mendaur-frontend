# 📤 Backend Fix Request - Quick Summary

## Copy This to Send to Backend Team

---

## 🎯 Issues to Fix

### Issue 1: POST /api/penukaran-produk Returns 400
**Problem**: User has 150 poin, trying to redeem item costing 50 poin, but gets "Poin tidak mencukupi" error.

**Fix**: Check if backend is using wrong column (poin_tersedia instead of total_poin)

**Request**:
```bash
POST http://127.0.0.1:8000/api/penukaran-produk
{
  "produk_id": 1,
  "jumlah_poin": 50,
  "jumlah": 1,
  "alamat_pengiriman": "Ambil di Bank Sampah"
}
```

**Expected**: 201 Created  
**Current**: 400 Bad Request

---

### Issue 2: GET /api/penukaran-produk Returns 500
**Problem**: Fetching redemption history crashes with 500 error

**Fix**: Check if PenukaranProduk model has produk() relationship defined

**Request**:
```bash
GET http://127.0.0.1:8000/api/penukaran-produk
```

**Expected**: 200 OK with array  
**Current**: 500 Internal Server Error

---

## ✅ Checklist of Things to Check

### For POST Issue (400):
- [ ] Is `total_poin` column being checked or `poin_tersedia`?
- [ ] User has 150 poin but getting insufficient points error?
- [ ] Check Laravel logs for actual error: `tail -f storage/logs/laravel.log`
- [ ] Run: `$user->total_poin >= 50;` in tinker (should return true)
- [ ] Review controller validation logic

### For GET Issue (500):
- [ ] Does PenukaranProduk model have `produk()` relationship?
- [ ] Does penukaran_produk table exist in database?
- [ ] Does table have all required columns?
- [ ] Are there any query errors in logs?
- [ ] Can you manually run: `SELECT * FROM penukaran_produk WHERE user_id = 1;`?

---

## 📋 Full Fix Details

See: **BACKEND_PENUKARAN_PRODUK_FIX_PROMPT.md**

It includes:
- Detailed problem description
- Complete controller code to copy-paste
- Database queries to verify
- Step-by-step debugging instructions
- Testing commands with cURL
- Validation checklist

---

## 🚀 Once Fixed

Frontend will automatically:
- ✅ Allow users to redeem products
- ✅ Show redemptions in Riwayat Transaksi
- ✅ Display claim instructions when approved
- ✅ Show success messages

Feature will be **100% functional**!

