# 🎯 Quick Reference - Database Sync & Debug

## 🚀 Fastest Path to Fix (11 minutes)

### Command 1: Setup Database (2 min)
```bash
php artisan migrate --fresh
```

### Command 2: Add User Points (2 min)
```bash
php artisan tinker

$user = User::find(1);
$user->update(['total_poin' => 1000, 'total_sampah' => 50]);
exit
```

### Command 3: Add Sample Products (2 min)
```bash
php artisan tinker

Produk::create(['nama' => 'Lampu LED', 'deskripsi' => 'Hemat energi', 'harga_poin' => 500, 'stok' => 10, 'kategori' => 'Elektronik', 'status' => 'tersedia']);
Produk::create(['nama' => 'Botol Reusable', 'deskripsi' => 'Ramah lingkungan', 'harga_poin' => 150, 'stok' => 20, 'kategori' => 'Aksesoris', 'status' => 'tersedia']);

exit
```

### Command 4: Test APIs (1 min)
```bash
# Test products
curl http://127.0.0.1:8000/api/produk

# Test stats
curl http://127.0.0.1:8000/api/dashboard/stats/1
```
 
### Step 5: Test in Browser (2 min)
1. Refresh page (Ctrl+F5)
2. Go to Leaderboard
3. Open DevTools (F12)
4. Check Console for debug output
5. Verify "Poinmu" shows 1000

---

## 📊 Debug Output Checklist

**Open DevTools → Console and look for:**

```
✅ If you see:
===== LEADERBOARD STATS DEBUG =====
Extracted user points: 1000
===== END DEBUG =====

❌ If you see:
Extracted user points: 0

❌ If you see:
Error fetching leaderboard stats: 401
```

---

## 🔍 Quick Diagnostics

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Stats show 0 | DB not synced | Run migrate + tinker |
| 401 error | No token | Re-login |
| 500 error | Server error | Check Laravel logs |
| No console log | Code issue | Check file saved |

---

## 📋 Checklist

- [ ] Ran: `php artisan migrate --fresh`
- [ ] Ran: `User::find(1)->update(['total_poin' => 1000])`
- [ ] Created: At least 2 sample products
- [ ] Tested: `/api/produk` returns products
- [ ] Tested: `/api/dashboard/stats/1` returns points
- [ ] Refreshed: Browser (Ctrl+F5)
- [ ] Checked: Console shows debug output
- [ ] Verified: "Poinmu" card shows 1000

---

## 📖 Full References

- **Quick Sync**: DATABASE_QUICK_SYNC.md (11 min)
- **Complete Guide**: DATABASE_SYNC_GUIDE.md (detailed)
- **Component Debug**: LEADERBOARD_IMPLEMENTATION_COMPLETE.md (full details)

---

## ✨ Done?

When all checklist items ✅, you're done!

Features working:
- ✅ Tukar Poin (redemption)
- ✅ Riwayat Transaksi (history)
- ✅ Leaderboard (stats)

🎉 Everything ready for production!

