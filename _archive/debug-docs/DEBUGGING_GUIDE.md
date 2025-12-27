# 🐛 Debugging Guide - Mendaur Frontend

## Masalah yang Ditemukan dan Solusinya

### 1. 🔴 Request Penarikan Tunai Tidak Masuk ke Database

**Gejala:**
- User mengajukan penarikan tunai
- Alert "berhasil" muncul
- Tapi data tidak tersimpan di tabel `penarikan_tunai`

**Kemungkinan Penyebab:**
1. Backend tidak menerima `user_id` dari authenticated token
2. Validation error di backend (tidak terlihat di frontend)
3. Database constraint error (foreign key, etc)
4. CSRF/CORS issue

**Solusi yang Diterapkan:**

#### A. Tambahkan Debug Logging di Frontend
File: `src/Components/Pages/tukarPoin/tukarPoin.jsx`

```javascript
// DEBUG: Log withdrawal request details
console.log('===== CASH WITHDRAWAL DEBUG =====');
console.log('Current user:', user);
console.log('User ID from localStorage:', localStorage.getItem('id_user'));
console.log('Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
console.log('Withdrawal payload:', payload);
console.log('===== END DEBUG =====');

// After response
console.log('===== WITHDRAWAL RESPONSE =====');
console.log('Status:', response.status);
console.log('Response OK:', response.ok);
console.log('Result:', result);
console.log('===== END RESPONSE =====');
```

#### B. Cek Console Browser Setelah Submit
Buka Developer Tools (F12) → Console, lalu submit penarikan tunai.

**Yang Harus Dilihat:**
```javascript
===== CASH WITHDRAWAL DEBUG =====
Current user: {id: 123, nama: "...", total_poin: 5000}
User ID from localStorage: "123"
Token: "eyJ0eXAiOiJKV1QiLCJ..."
Withdrawal payload: {
  jumlah_poin: 2000,
  nomor_rekening: "1234567890",
  nama_bank: "BCA",
  nama_penerima: "John Doe"
}
===== END DEBUG =====

===== WITHDRAWAL RESPONSE =====
Status: 200 ✅ (atau 400/500 jika error)
Response OK: true
Result: {status: "success", data: {...}}
===== END RESPONSE =====
```

#### C. Kemungkinan Hasil Debug:

**Kasus 1: Response 401 (Unauthorized)**
```javascript
Status: 401
Result: {message: "Unauthenticated"}
```
**Solusi:** Token expired atau invalid → User harus login ulang

**Kasus 2: Response 422 (Validation Error)**
```javascript
Status: 422
Result: {
  errors: {
    user_id: ["The user_id field is required"],
    jumlah_poin: ["The jumlah_poin must be at least 2000"]
  }
}
```
**Solusi:** Backend validation error → Periksa field yang required

**Kasus 3: Response 500 (Server Error)**
```javascript
Status: 500
Result: {message: "SQLSTATE[23000]: Integrity constraint violation"}
```
**Solusi:** Database error → Cek foreign key constraints di backend

**Kasus 4: Response 200 tapi data tidak tersimpan**
```javascript
Status: 200
Result: {status: "success", data: {...}}
```
**Solusi:** Backend response sukses tapi tidak save ke DB → Periksa backend controller

---

### 2. 🟡 Console Menampilkan Log Berulang

**Gejala:**
```
tukarPoin.jsx:57 🔍 Fetching products for TukarPoin...
tukarPoin.jsx:57 🔍 Fetching products for TukarPoin...  ← Duplicate
produkCard.jsx:59 🔍 Sample product data: {nama: 'testing'...}
produkCard.jsx:59 🔍 Sample product data: {nama: 'testing'...}  ← Duplicate
produkCard.jsx:59 🔍 Sample product data: {nama: 'testing'...}  ← Duplicate lagi
produkCard.jsx:59 🔍 Sample product data: {nama: 'testing'...}  ← Duplicate lagi
```

**Penyebab:**
1. **React 18 StrictMode** → Component di-render 2x di development mode
2. **Multiple components** → ProdukCard digunakan di 2 halaman (Produk & TukarPoin)

**Math:**
- React StrictMode: 2x render
- 2 Pages using ProdukCard: 2x
- **Total: 2 × 2 = 4x log muncul**

**Apakah Ini Bug?**
❌ **BUKAN BUG!** Ini behavior normal React StrictMode di development.

**Kenapa React Melakukan Ini?**
- Untuk mendeteksi side effects yang tidak aman
- Memastikan component bisa di-remount dengan aman
- Hanya terjadi di **development mode**
- Di **production build**, tidak akan ada double render

**Solusi yang Diterapkan:**

#### A. Kurangi Noise di Console
File: `src/Components/Pages/produk/produkCard.jsx`

**Before:**
```javascript
if (index === 0) {
  console.log('🔍 Sample product data:', item);
  console.log('💰 harga_poin:', item.harga_poin, '→ parsed:', hargaPoin);
  console.log('📦 stok:', item.stok, '→ parsed:', stok);
}
```

**After:**
```javascript
if (index === 0 && import.meta.env.DEV) {
  console.log('🔍 Sample product from:', item.nama);
}
```

#### B. (Optional) Disable StrictMode - TIDAK DIREKOMENDASIKAN
File: `src/main.jsx`

```javascript
// ❌ JANGAN LAKUKAN INI - StrictMode berguna untuk development
createRoot(document.getElementById('root')).render(
  // <StrictMode>  ← Remove this
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  // </StrictMode>  ← Remove this
)
```

**Kenapa Tidak Direkomendasikan?**
- StrictMode membantu menemukan bug potensial
- Production build tetap akan optimal (no double render)
- Better safe than sorry

---

## 🧪 Testing Checklist

### Testing Penarikan Tunai:

1. ✅ Buka Developer Tools (F12) → Console Tab
2. ✅ Login sebagai nasabah
3. ✅ Pergi ke halaman Tukar Poin
4. ✅ Klik "Tarik Tunai"
5. ✅ Isi form:
   - Jumlah Poin: 2000
   - Nama Bank: BCA
   - Nomor Rekening: 1234567890
   - Nama Pemilik: [Nama Anda]
6. ✅ Klik "Ajukan Penarikan"
7. ✅ Lihat Console Log

**Expected Console Output:**
```javascript
===== CASH WITHDRAWAL DEBUG =====
Current user: {id_user: 123, nama: "...", total_poin: 5000}
User ID from localStorage: "123"
Token: "eyJ0eXAiOiJKV1QiLCJ..."
Withdrawal payload: {
  jumlah_poin: 2000,
  nomor_rekening: "1234567890",
  nama_bank: "BCA",
  nama_penerima: "John Doe"
}
===== END DEBUG =====

===== WITHDRAWAL RESPONSE =====
Status: 200  ← Should be 200
Response OK: true  ← Should be true
Result: {status: "success", data: {penarikan_tunai_id: 123, ...}}
===== END RESPONSE =====

✅ User data refreshed: 3000  ← Points updated
```

8. ✅ Cek database: `SELECT * FROM penarikan_tunai ORDER BY created_at DESC LIMIT 1;`
9. ✅ Cek halaman Riwayat Transaksi → Harus muncul penarikan tunai baru

### Testing Filter Riwayat Per User:

1. ✅ Login sebagai User A
2. ✅ Buka halaman Riwayat Transaksi
3. ✅ Lihat Console Log:
```javascript
🔍 Fetching transactions for user: 123
💰 Raw withdrawals response: {...}
✅ Filtered 3 withdrawals from 10 total  ← Should filter
```
4. ✅ Logout
5. ✅ Login sebagai User B
6. ✅ Buka halaman Riwayat Transaksi
7. ✅ Verify: Tidak ada transaksi User A yang terlihat

---

## 🔍 Common Issues & Solutions

### Issue 1: Token Expired
**Error:** `401 Unauthorized` or `Unauthenticated`
**Solution:** Logout dan login kembali

### Issue 2: User ID Not Found
**Error:** `user_id is required`
**Check:**
```javascript
console.log(localStorage.getItem('id_user')); // Should not be null
console.log(user?.id_user); // Should match localStorage
```
**Solution:** Periksa AuthContext login function, pastikan menyimpan id_user

### Issue 3: Points Not Updated After Transaction
**Check:**
```javascript
// After transaction, check console for:
✅ User data refreshed: [new_points]  // Should appear
```
**Solution:** Pastikan `refreshUser()` dipanggil setelah transaction success

### Issue 4: Riwayat Menampilkan Data User Lain
**Check Console:**
```javascript
🔍 Fetching transactions for user: 123
✅ Filtered 3 withdrawals from 10 total
```
If not filtering, check:
```javascript
const userId = localStorage.getItem('id_user');
console.log('Current user ID:', userId);
console.log('Withdrawal user_id:', item.user_id);
console.log('Match?', item.user_id?.toString() === userId?.toString());
```

---

## 📊 Backend Requirements

Untuk fitur ini bekerja dengan baik, backend harus:

### 1. Endpoint: `POST /api/penarikan-tunai`
```php
// PenarikanTunaiController.php
public function store(Request $request)
{
    $validated = $request->validate([
        'jumlah_poin' => 'required|integer|min:2000',
        'nomor_rekening' => 'required|string',
        'nama_bank' => 'required|string',
        'nama_penerima' => 'required|string',
    ]);

    // Get user_id from authenticated user
    $userId = auth()->id();
    
    // Check if user has enough points
    $user = User::find($userId);
    if ($user->total_poin < $validated['jumlah_poin']) {
        return response()->json([
            'status' => 'error',
            'message' => 'Poin tidak mencukupi'
        ], 400);
    }

    // Create withdrawal request
    $withdrawal = PenarikanTunai::create([
        'user_id' => $userId,
        'jumlah_poin' => $validated['jumlah_poin'],
        'jumlah_rupiah' => ($validated['jumlah_poin'] / 100) * 1000,
        'nomor_rekening' => $validated['nomor_rekening'],
        'nama_bank' => $validated['nama_bank'],
        'nama_penerima' => $validated['nama_penerima'],
        'status' => 'pending',
    ]);

    // Deduct points immediately (even though status is pending)
    $user->total_poin -= $validated['jumlah_poin'];
    $user->save();

    return response()->json([
        'status' => 'success',
        'data' => $withdrawal
    ], 201);
}
```

### 2. Endpoint: `GET /api/penarikan-tunai`
```php
public function index(Request $request)
{
    // Return only withdrawals for authenticated user
    $userId = auth()->id();
    
    $withdrawals = PenarikanTunai::where('user_id', $userId)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'status' => 'success',
        'data' => [
            'data' => $withdrawals
        ]
    ]);
}
```

### 3. Database Migration
```php
Schema::create('penarikan_tunai', function (Blueprint $table) {
    $table->id('penarikan_tunai_id');
    $table->unsignedBigInteger('user_id');
    $table->integer('jumlah_poin');
    $table->decimal('jumlah_rupiah', 10, 2);
    $table->string('nomor_rekening');
    $table->string('nama_bank');
    $table->string('nama_penerima');
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->text('catatan_admin')->nullable();
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();
    
    $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
});
```

---

## 🎯 Next Steps

1. ✅ Test penarikan tunai dengan debug logging aktif
2. ✅ Screenshoot console output jika masih error
3. ✅ Check database setelah submit
4. ✅ Verify points berkurang di UI
5. ✅ Test riwayat transaksi tidak menampilkan data user lain

**Jika masih error, berikan informasi:**
- Console log lengkap (copy paste)
- Response status code
- Error message dari backend
- Screenshot jika perlu
