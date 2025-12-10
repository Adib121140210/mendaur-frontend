# 📋 FRONTEND MIGRATION - EXECUTION READY

**Status:** Planning Complete, Ready for Implementation  
**Date:** December 10, 2025  

---

## ✅ Work Completed (Documentation & Planning)

1. ✅ Analyzed AuthContext.jsx - Already correct (using `userData.user_id`)
2. ✅ Scanned all components for `.id` references
3. ✅ Identified 12 specific React key issues
4. ✅ Mapped affected files (10 total)
5. ✅ Created prioritized task list
6. ✅ Documented field mappings

---

## 📊 Issues Found & Ready to Fix

### By Priority

**CRITICAL (2 issues in 1 file):**
```
UserManagementTable.jsx
  ❌ Line 116: key={user.id} → key={user.user_id}
  ❌ Line 146: key={user.id} → key={user.user_id}
```

**HIGH (1 issue in 1 file):**
```
riwayatTransaksi.jsx
  ❌ Line 331: key={item.id} → key={item.poin_transaksi_id}
```

**MEDIUM (6 issues in 5 files):**
```
kategoriSampah.jsx
  ❌ Line 25: key={kategori.id} → key={kategori.kategori_sampah_id}

FormSetorSampah.jsx
  ❌ Line 403: key={j.id} → key={j.jenis_sampah_id}

LocationManager.jsx
  ❌ Line 203: key={location.id} → key={location.location_id}

jadwalPengambilan.jsx
  ❌ Line 232: key={schedule.id} → key={schedule.jadwal_penyetoran_id}

BookingModal.jsx
  ❌ Line 245: key={loc.id} + value={loc.id} → key={loc.location_id}
```

**LOW (3 issues - needs verification):**
```
pointDashboard.jsx (2 refs - likely internal UI state)
AdminDashboard.jsx (1 ref - likely internal UI state)
OverviewCards.jsx (1 ref - likely internal UI state)
```

---

## 🎯 Next Steps (Simple Checklist)

### For Each File (Follow This Pattern):

1. **Open the file**
2. **Go to the line indicated**
3. **Check what the object is:**
   - If from backend API → must change the `.id` reference
   - If internal UI state → may be OK to leave as is
4. **Replace:** `key={item.id}` with `key={item.[correct_field_name]_id}`
5. **Save & test** - check browser console for React warnings
6. **Commit** with message like: `fix: update item keys from id to [field]_id`

---

## 📝 Exact Changes Needed

### File 1: UserManagementTable.jsx (CRITICAL - DO FIRST)
```javascript
// Line 116 - Change from:
<tr key={user.id}>

// To:
<tr key={user.user_id}>

// Line 146 - Change from:
<div key={user.id} className="user-card">

// To:
<div key={user.user_id} className="user-card">
```

**Why:** Backend returns `user_id`, not `id`

---

### File 2: riwayatTransaksi.jsx
```javascript
// Line 331 - Change from:
<li key={item.id} className={`riwayatCard ${item.status}`}>

// To:
<li key={item.poin_transaksi_id} className={`riwayatCard ${item.status}`}>
```

**Why:** Check backend response to confirm field name

---

### File 3: kategoriSampah.jsx
```javascript
// Line 25 - Change from:
key={kategori.id}

// To:
key={kategori.kategori_sampah_id}
```

**Why:** Kategori data from backend uses `kategori_sampah_id`

---

### File 4: FormSetorSampah.jsx
```javascript
// Line 403 - Change from:
<option key={j.id} value={j.id}>

// To:
<option key={j.jenis_sampah_id} value={j.jenis_sampah_id}>
```

**Why:** Jenis sampah data uses `jenis_sampah_id`

---

### File 5: jadwalPengambilan.jsx
```javascript
// Line 232 - Change from:
<div key={schedule.id} className="schedule-card">

// To:
<div key={schedule.jadwal_penyetoran_id} className="schedule-card">
```

**Why:** Schedule data from backend uses `jadwal_penyetoran_id`

---

### File 6: LocationManager.jsx
```javascript
// Line 203 - Change from:
key={location.id}

// To:
key={location.location_id}
// (or check what field name is actually used in the data)
```

---

### File 7: BookingModal.jsx
```javascript
// Line 245 - Change from:
<option key={loc.id} value={loc.id}>

// To:
<option key={loc.location_id} value={loc.location_id}>
// (verify field name is correct)
```

---

## ⚠️ Files Needing Verification Before Fixing

These likely have internal UI state, not backend data. Check before changing:

### pointDashboard.jsx (Lines 80, 96)
```javascript
// Check if 'tab' is internal UI state or backend data
// If it's something like:
const tabs = [{ id: 'stats', label: 'Statistics' }, ...]
// Then keep key={tab.id} - it's internal

// But if it's:
const [tabs] = useState(backendResponse.tabs)  // from API
// Then change to the correct field name
```

### AdminDashboard.jsx (Line 85)
Same logic as above - check if it's internal UI state

### OverviewCards.jsx (Line 110)
Same logic as above - likely internal cards, not backend data

---

## 🔍 How to Verify Before Fixing

Add this to your component temporarily to see the actual data structure:

```javascript
// In your map function:
{items.map((item) => {
  console.log('Item structure:', item);  // Add this line
  return (
    <div key={item.id}>  // Change after you see the console output
      ...
    </div>
  );
})}
```

1. Open browser console (F12)
2. Trigger the list to render
3. Look at the console output
4. You'll see exactly what fields are available
5. Use the correct field name in the key

---

## ✅ Testing After Each Fix

For each file you fix:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Look for warnings** like:
   ```
   Warning: Each child in a list should have a unique "key" prop
   ```
4. **If you see this**, you fixed it correctly
5. **If you see new errors**, check the field name is correct

---

## 📊 Completion Tracking

```
UserManagementTable.jsx ........... [ ] Pending
riwayatTransaksi.jsx .............. [ ] Pending
kategoriSampah.jsx ................ [ ] Pending
FormSetorSampah.jsx ............... [ ] Pending
jadwalPengambilan.jsx ............. [ ] Pending
LocationManager.jsx ............... [ ] Pending
BookingModal.jsx .................. [ ] Pending
pointDashboard.jsx ................ [ ] Verify
AdminDashboard.jsx ................ [ ] Verify
OverviewCards.jsx ................. [ ] Verify

Total: 10 files
CRITICAL fixes: 1 file
HIGH fixes: 1 file
MEDIUM fixes: 5 files
VERIFICATION needed: 3 files
```

---

## 🎯 Recommended Execution Order

**DO IN THIS ORDER:**

1. **UserManagementTable.jsx** - CRITICAL, only 2 simple changes
2. **riwayatTransaksi.jsx** - HIGH, 1 change
3. **kategoriSampah.jsx** - MEDIUM, 1 change
4. **FormSetorSampah.jsx** - MEDIUM, 1 change
5. **jadwalPengambilan.jsx** - MEDIUM, 1 change
6. **LocationManager.jsx** - MEDIUM, 1 change
7. **BookingModal.jsx** - MEDIUM, 2 changes
8. **pointDashboard.jsx** - LOW, verify first
9. **AdminDashboard.jsx** - LOW, verify first
10. **OverviewCards.jsx** - LOW, verify first

---

## 🚀 Ready to Begin?

Everything is planned and documented. When you're ready:

1. Pick the first file: `UserManagementTable.jsx`
2. Make the 2 changes
3. Test in browser
4. Commit
5. Move to next file

**All tools and references are ready!**

---

*Last Updated: December 10, 2025*  
*Status: Ready for Implementation ✅*
