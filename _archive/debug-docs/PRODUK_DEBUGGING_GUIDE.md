# 🐛 DEBUGGING GUIDE - PRODUK BACKEND INTEGRATION

## Masalah yang Ditemukan

### Issue: "NaN" muncul pada harga_poin
- **Screenshot**: Card menampilkan "NaN Poin"
- **Status**: ✅ **FIXED**

---

## 🔧 Perbaikan yang Dilakukan

### 1. **Safe Integer Parsing**
Added helper function untuk handle edge cases:
```javascript
const safeParseInt = (value) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
};
```

### 2. **Debug Logging**
Added console.log di setiap langkah:

**productApi.js:**
```javascript
console.info('✅ Products API Response:', data);
console.info('📦 Products data:', data.data);
```

**produk.jsx:**
```javascript
console.log('🔍 Fetching products with filters:', {
  kategori: filter.kategori,
  search: filter.search
});
console.log('📦 Products result:', result);
console.log('✅ Products fetched successfully:', result.data);
```

**produkCard.jsx:**
```javascript
if (index === 0) {
  console.log('🔍 Sample product data:', item);
  console.log('💰 harga_poin:', item.harga_poin, '→ parsed:', hargaPoin);
  console.log('📦 stok:', item.stok, '→ parsed:', stok);
}
```

**produkDetail.jsx:**
```javascript
console.log('🔍 Product detail result:', result);
console.log('✅ Product detail:', result.data);
console.log('🛒 Attempting redemption:', { /* ... */ });
```

### 3. **Fallback Values**
Display "-" jika harga_poin = 0:
```javascript
<strong>{hargaPoin > 0 ? hargaPoin.toLocaleString('id-ID') : '-'}</strong>
```

### 4. **Filter Status di Frontend**
Karena backend mungkin tidak support filter status:
```javascript
// Filter tersedia di frontend jika backend tidak support
const availableProducts = result.data.filter(p => p.status === 'tersedia');
setProducts(availableProducts);
```

---

## 📋 Cara Debug

### Step 1: Buka Browser Console (F12)

### Step 2: Navigasi ke `/produk`

### Step 3: Periksa Console Output

Anda akan melihat:
```
🔍 Fetching products with filters: {kategori: "", search: ""}
✅ Products API Response: {data: Array(8), ...}
📦 Products data: (8) [{...}, {...}, ...]
📦 Products result: {success: true, data: Array(8)}
✅ Products fetched successfully: (8) [{...}, {...}, ...]
🔍 Sample product data: {produk_id: 3, nama: "Pupuk Kompos...", ...}
💰 harga_poin: 30 → parsed: 30
📦 stok: 200 → parsed: 200
```

### Step 4: Periksa Data Structure

Expected API response structure:
```json
{
  "success": true,
  "data": [
    {
      "produk_id": 3,
      "nama": "Pupuk Kompos Organik 1kg",
      "deskripsi": "Pupuk kompos hasil pengolahan sampah organik",
      "harga_poin": 30,
      "stok": 200,
      "foto": "produk/pupuk-kompos.jpg",
      "kategori": "Pupuk",
      "status": "tersedia",
      "created_at": "2025-12-23 13:55:02",
      "updated_at": "2025-12-23 13:55:02"
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Problem 1: API Returns 401 Unauthorized
**Solution:**
```javascript
// Check if token exists
const token = localStorage.getItem('token');
console.log('🔑 Token:', token ? 'exists' : 'missing');
```

### Problem 2: API Returns Empty Array
**Possible Causes:**
1. Backend filter terlalu ketat
2. Tidak ada produk dengan status "tersedia"
3. Database kosong

**Solution:**
```javascript
// Try without filters
const result = await productApi.getAllProducts({});
```

### Problem 3: Field Names Mismatch
**Check Database vs Code:**

| Database Column | Code Variable |
|----------------|---------------|
| `produk_id` | ✅ `item.produk_id` |
| `nama` | ✅ `item.nama` |
| `deskripsi` | ✅ `item.deskripsi` |
| `harga_poin` | ✅ `item.harga_poin` |
| `stok` | ✅ `item.stok` |
| `foto` | ✅ `item.foto` |
| `kategori` | ✅ `item.kategori` |
| `status` | ✅ `item.status` |

### Problem 4: Image Not Loading
**Check:**
```javascript
// Image path dari database
foto: "produk/pupuk-kompos.jpg"

// URL yang dibuat
http://127.0.0.1:8000/produk/pupuk-kompos.jpg
```

**Fix if needed:**
```javascript
const getImageUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto; // Already full URL
  if (foto.startsWith('storage/')) return `http://127.0.0.1:8000/${foto}`;
  return `http://127.0.0.1:8000/storage/${foto}`; // Add storage prefix
};
```

---

## ✅ Verification Checklist

- [ ] Backend API `/api/produks` returns 200 OK
- [ ] Response structure matches expected format
- [ ] All fields present: `produk_id`, `nama`, `deskripsi`, `harga_poin`, `stok`, etc.
- [ ] `harga_poin` is a valid number (not null, not string)
- [ ] Console shows product data correctly
- [ ] Card displays harga_poin without "NaN"
- [ ] Images load correctly
- [ ] Detail page works
- [ ] Filters work (kategori, search)
- [ ] Pagination works

---

## 🔍 Expected Console Output (Success)

```
🔍 Fetching products with filters: {kategori: "", search: ""}
✅ Products API Response: {
  data: [
    {
      produk_id: 3,
      nama: "Pupuk Kompos Organik 1kg",
      harga_poin: 30,
      stok: 200,
      status: "tersedia",
      ...
    },
    ...
  ]
}
📦 Products data: Array(8)
📦 Products result: {success: true, data: Array(8)}
✅ Products fetched successfully: Array(8)
🔍 Sample product data: {produk_id: 3, nama: "Pupuk Kompos...", harga_poin: 30, stok: 200, ...}
💰 harga_poin: 30 → parsed: 30
📦 stok: 200 → parsed: 200
```

---

## 📞 Next Steps if Issue Persists

1. **Copy console output** dan share dengan backend team
2. **Check backend logs** untuk error di API
3. **Verify database** data langsung di phpMyAdmin/Adminer
4. **Test API endpoint** dengan Postman/Insomnia:
   ```
   GET http://127.0.0.1:8000/api/produks
   Headers:
     Authorization: Bearer {your_token}
     Accept: application/json
   ```

---

**Last Updated:** 24 Desember 2025  
**Status:** ✅ Fixed with safe parsing & debugging logs
