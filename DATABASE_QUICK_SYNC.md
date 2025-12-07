# ⚡ Quick Actions - Database Sync & Stats Fix

**Issue**: Database wiped, stats not syncing  
**Status**: Frontend code is ready ✅, backend data needs sync ⏳  
**Time to fix**: 15-20 minutes

---

## 🎯 Immediate Actions (Do These First)

### Action 1: Verify Database Tables Exist (2 min)

```bash
# SSH to server and run:
php artisan migrate:status

# Should show all migrations as "Ran"
# If not, run:
php artisan migrate --fresh
```

### Action 2: Check User Points in Database (2 min)

```bash
php artisan tinker

# Check your user (Adib Surya)
$user = User::where('email', 'like', '%adib%')->first();
echo $user->name . ": " . $user->total_poin . " poin";

# If total_poin is NULL or 0, add points:
$user->update(['total_poin' => 1000]);
```

### Action 3: Seed Product Data (3 min)

```bash
php artisan tinker

# Add sample products
Produk::create([
    'nama' => 'Lampu LED',
    'deskripsi' => 'Lampu hemat energi',
    'harga_poin' => 500,
    'stok' => 10,
    'kategori' => 'Elektronik',
    'status' => 'tersedia',
]);

Produk::create([
    'nama' => 'Botol Reusable',
    'deskripsi' => 'Botol minum ramah lingkungan',
    'harga_poin' => 150,
    'stok' => 20,
    'kategori' => 'Aksesoris',
    'status' => 'tersedia',
]);

# Verify
Produk::all();
```

### Action 4: Test API Endpoints (2 min)

```bash
# Get your token from localStorage in browser

# Test products API
curl -X GET http://127.0.0.1:8000/api/produk

# Test stats API (with your token)
TOKEN="your_token_here"
curl -X GET http://127.0.0.1:8000/api/dashboard/stats/1 \
  -H "Authorization: Bearer $TOKEN"

# Should return your total_poin
```

### Action 5: Test in Browser (2 min)

1. **Refresh browser** (Ctrl+F5 to clear cache)
2. **Open DevTools** (F12)
3. **Go to Console tab**
4. **Navigate to Leaderboard page**
5. **Look for debug output**:
   ```
   ===== LEADERBOARD STATS DEBUG =====
   Extracted user points: [should show your points]
   ===== END DEBUG =====
   ```

---

## 📊 If Stats Still Show 0

### Debug Step 1: Check Browser Console
```
Open F12 → Console
Look for the full response:
"User stats full response: {...}"

If total_poin is missing → Backend issue
If total_poin is 0 → Database issue
```

### Debug Step 2: Check API Response
```bash
TOKEN="your_token"
curl -X GET http://127.0.0.1:8000/api/dashboard/stats/1 \
  -H "Authorization: Bearer $TOKEN" | jq .

# If response shows total_poin: 0, update database
```

### Debug Step 3: Update Database Directly
```bash
php artisan tinker

$user = User::find(1);
$user->total_poin = 1000;
$user->save();

# Verify
$user->total_poin;  # Should show: 1000
```

---

## ✅ Verification Steps

After actions above, verify:

- [ ] Database has user with total_poin > 0
- [ ] Database has products (check: `Produk::count()`)
- [ ] API returns products (test: `/api/produk`)
- [ ] API returns user stats (test: `/api/dashboard/stats/1`)
- [ ] Browser console shows correct points
- [ ] Leaderboard displays "Poinmu" correctly
- [ ] Tabung Sampah shows products

---

## 🚀 Expected Timeline

```
Action 1 (Check migrations): 2 min
Action 2 (Add user points): 2 min
Action 3 (Seed products): 3 min
Action 4 (Test APIs): 2 min
Action 5 (Test browser): 2 min
Total: ~11 minutes
```

---

## 📝 Checklist

- [ ] Migrations ran successfully
- [ ] User has total_poin > 0
- [ ] Products table has data
- [ ] API endpoints work
- [ ] Browser shows correct stats
- [ ] No console errors
- [ ] Tabung Sampah loads products
- [ ] Leaderboard displays correctly

---

## 📞 Need Help?

See **DATABASE_SYNC_GUIDE.md** for:
- Detailed table schemas
- Full sync procedures
- Troubleshooting guide
- All SQL commands

