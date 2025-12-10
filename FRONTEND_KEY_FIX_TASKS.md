# 🔧 FRONTEND PRIMARY KEY FIXES - DETAILED TASK LIST

**Status:** Active Work  
**Date:** December 10, 2025  

---

## 🎯 Found Issues - React Keys to Fix

### CRITICAL - User-Related (2 files)
- [ ] `src/Components/Pages/adminDashboard/components/UserManagementTable.jsx`
  - Line 116: `key={user.id}` → `key={user.user_id}`
  - Line 146: `key={user.id}` → `key={user.user_id}`

### HIGH - Transaction History (1 file)
- [ ] `src/Components/Pages/riwayatTransaksi/riwayatTransaksi.jsx`
  - Line 331: `key={item.id}` → `key={item.poin_transaksi_id}` (or appropriate id)

### MEDIUM - Waste Management (2 files)
- [ ] `src/Components/Pages/tabungSampah/kategoriSampah.jsx`
  - Line 25: `key={kategori.id}` → `key={kategori.kategori_sampah_id}`

- [ ] `src/Components/Form/FormSetorSampah.jsx`
  - Line 403: `key={j.id}` → `key={j.jenis_sampah_id}`

### MEDIUM - Scheduling (3 files)
- [ ] `src/Components/Pages/jadwalPengambilan/LocationManager.jsx`
  - Line 203: `key={location.id}` → `key={location.location_id}` (or jadwal_penyetoran_id)

- [ ] `src/Components/Pages/jadwalPengambilan/jadwalPengambilan.jsx`
  - Line 232: `key={schedule.id}` → `key={schedule.jadwal_penyetoran_id}`

- [ ] `src/Components/Pages/jadwalPengambilan/BookingModal.jsx`
  - Line 245: `key={loc.id}` → `key={loc.location_id}` (check field name)
  - Line 245: `value={loc.id}` → `value={loc.location_id}` (check field name)

### MEDIUM - Tab Navigation (3 files - may be internal IDs)
- [ ] `src/Components/Pages/pointDashboard/pointDashboard.jsx`
  - Line 80: `key={tab.id}` → Check if tab is a data entity or UI element
  - Line 96: `key={tab.id}` → Check if tab is a data entity or UI element

- [ ] `src/Components/Pages/adminDashboard/AdminDashboard.jsx`
  - Line 85: `key={tab.id}` → Check if tab is a data entity or UI element

### LOW - Dashboard Cards (1 file - may be internal)
- [ ] `src/Components/Pages/adminDashboard/components/OverviewCards.jsx`
  - Line 110: `key={card.id}` → Check if card is a data entity or UI element

---

## 🔍 Verification Questions

For each file, determine:
1. Is `.id` a data entity from backend or internal UI state?
2. What is the actual field name from the backend response?
3. What should the key be changed to?

**Examples:**
```
// Tabs (likely internal UI state) - keep as is
tabs = [{ id: 'tab1', label: 'Tab 1' }, ...]
key={tab.id}  // OK - internal state

// User data (from backend) - must change
users = [{ user_id: 1, nama: 'John' }, ...]
key={user.user_id}  // Required - from backend

// Categories (from backend) - must change
categories = [{ kategori_sampah_id: 1, nama: 'Plastik' }, ...]
key={kategori.kategori_sampah_id}  // Required - from backend
```

---

## 🚀 Implementation Steps

### Step 1: Verify Each File
Before changing, verify what fields are actually in the objects

### Step 2: Apply Fixes in Priority Order
1. **CRITICAL** - UserManagementTable.jsx
2. **HIGH** - riwayatTransaksi.jsx
3. **MEDIUM** - All waste and scheduling files
4. **LOW** - Dashboard files

### Step 3: Test After Each Fix
- Browser console for React key warnings
- Component rendering (no breakage)
- Data display (correct items showing)

### Step 4: Commit Each File
Keep commits atomic - one file per commit

---

## 📝 Files Ready for Immediate Fix

These need immediate attention based on grep findings:

1. **UserManagementTable.jsx** - 2 fixes needed
2. **riwayatTransaksi.jsx** - 1 fix needed  
3. **kategoriSampah.jsx** - 1 fix needed
4. **FormSetorSampah.jsx** - 1 fix needed
5. **jadwalPengambilan.jsx** - 1 fix needed
6. **LocationManager.jsx** - 1 fix needed
7. **BookingModal.jsx** - 2 fixes needed

**Plus verification needed for:**
- pointDashboard.jsx (2 refs)
- AdminDashboard.jsx (1 ref)
- OverviewCards.jsx (1 ref)

---

## ✅ Tracking

Total Issues Found: 12  
Total Files: 10  
Ready to Fix: YES ✅

Start with: UserManagementTable.jsx
