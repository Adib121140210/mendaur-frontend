# 📋 FRONTEND PRIMARY KEY MIGRATION - IMPLEMENTATION PLAN

**Status:** Ready for Implementation  
**Date:** December 10, 2025  
**Priority:** High - Frontend must match backend changes  

---

## 📊 Migration Scope

### Files to Update

| Category | Count | Status |
|----------|-------|--------|
| Context files | 1 | ⏳ Pending |
| Components | 15+ | ⏳ Pending |
| Hooks | 5+ | ⏳ Pending |
| API services | 3+ | ⏳ Pending |
| State management | 2+ | ⏳ Pending |
| Test files | Various | ⏳ Pending |

---

## 🎯 Phase 1: Core Context & Authentication

### 1.1 AuthContext.jsx (CRITICAL)
**File:** `src/context/AuthContext.jsx`

**Changes Required:**
```javascript
// ❌ BEFORE
localStorage.setItem('user', JSON.stringify(userData));
const userId = user?.id;

// ✅ AFTER
localStorage.setItem('user', JSON.stringify(userData));
const userId = user?.user_id;
```

**Locations:**
- [ ] Line ~64: localStorage.setItem('id_user', userData.user_id)
- [ ] Line ~84: Login response handling
- [ ] Line ~150: useEffect dependency arrays
- [ ] All references: user.id → user.user_id

**Impact:** Affects all downstream components - must be done first

---

## 🎯 Phase 2: Component Updates

### 2.1 Profile/User Components
**Files to Update:**
- [ ] `src/Components/Pages/profil/profilHeader.jsx` - user.id references
- [ ] `src/Components/Pages/profil/userData.jsx` - user.id references
- [ ] `src/Components/Pages/profil/achievementList.jsx` - badge.id references
- [ ] `src/Components/Pages/profil/leaderboardTable.jsx` - user.id references

**Pattern:**
```javascript
// ❌ BEFORE
user.id
badge.id

// ✅ AFTER
user.user_id
badge.badge_id
```

### 2.2 Dashboard Components
**Files to Update:**
- [ ] `src/Components/Pages/home/homeContent.jsx` - Multiple references
- [ ] `src/Components/Pages/home/Layout.jsx` - If applicable
- [ ] `src/Components/ui/dashboardHeader.jsx` - User ID references

### 2.3 Product/Marketplace Components
**Files to Update:**
- [ ] `src/Components/Pages/produk/` - product.id → product.produk_id
- [ ] `src/Components/Pages/penukaran/` - product.produk_id references
- [ ] All product-related renders

### 2.4 Setor Sampah Components
**Files to Update:**
- [ ] `src/Components/Pages/tabungSampah/` - tabung_sampah.id references
- [ ] `src/Components/Form/FormSetorSampah.jsx` - Form handling
- [ ] Activity logging components

### 2.5 Article Components
**Files to Update:**
- [ ] `src/Components/lib/artikel.jsx` - artikel.id references (already partially done)
- [ ] `src/Components/Pages/artikel/` - Article listing/details

---

## 🎯 Phase 3: React Keys & Lists

### 3.1 All List Rendering
**Pattern to Find & Fix:**
```javascript
// ❌ BEFORE
{items.map((item) => (
  <div key={item.id}>
    ...
  </div>
))}

// ✅ AFTER
{items.map((item) => (
  <div key={item.[entity]_id}>
    ...
  </div>
))}
```

**Entity-Specific Fixes:**
- [ ] Users: `key={user.user_id}`
- [ ] Badges: `key={badge.badge_id}`
- [ ] Products: `key={product.produk_id}`
- [ ] Articles: `key={artikel.artikel_id}`
- [ ] Transactions: `key={transaction.poin_transaksi_id}`
- [ ] Deposits: `key={deposit.tabung_sampah_id}`

---

## 🎯 Phase 4: API Service & Response Handling

### 4.1 API Service Layer
**Files to Update:**
- [ ] `src/services/api.js` - If response mapping exists
- [ ] Any response transformer functions
- [ ] API error handling that references IDs

**Pattern:**
```javascript
// ❌ BEFORE
const userId = response.data.id;

// ✅ AFTER
const userId = response.data.user_id;
```

### 4.2 Hook Response Handling
**Files to Update:**
- [ ] `src/hooks/useSyncedUser.js` - User data handling
- [ ] `src/hooks/useUserLeaderboardStats.js` - Stats handling
- [ ] Custom hooks with ID references

---

## 🎯 Phase 5: State Management

### 5.1 Context State
**Files:**
- [ ] Redux slices (if using Redux)
- [ ] Zustand stores (if using Zustand)
- [ ] Context providers with ID state

**Pattern:**
```javascript
// ❌ BEFORE
state.auth.user.id
state.profile.badge.id

// ✅ AFTER
state.auth.user.user_id
state.profile.badge.badge_id
```

---

## 🎯 Phase 6: Utility Functions & Helpers

### 6.1 Utility Files to Check
- [ ] `src/utils/badgeUtils.js` - Badge handling
- [ ] `src/utils/syncBadgePointsToUser.jsx` - User-badge relationships
- [ ] `src/utils/syncUserData.js` - User data sync
- [ ] Any ID-based utility functions

---

## 📋 Field Mapping Reference

**COMPLETE MAPPING:**

```
Core:
  user.id                    → user.user_id
  role.id                    → role.role_id

Badges & Achievements:
  badge.id                   → badge.badge_id
  badge_progress.id          → badge_progress.badge_progress_id

Products & Redemption:
  produk.id                  → produk.produk_id
  penukaran_produk.id        → penukaran_produk.penukaran_produk_id
  penarikan_tunai.id         → penarikan_tunai.penarikan_tunai_id

Articles & Content:
  artikel.id                 → artikel.artikel_id

Waste Management:
  tabung_sampah.id           → tabung_sampah.tabung_sampah_id
  jenis_sampah.id            → jenis_sampah.jenis_sampah_id
  kategori_sampah.id         → kategori_sampah.kategori_sampah_id

Scheduling:
  jadwal_penyetoran.id       → jadwal_penyetoran.jadwal_penyetoran_id

Points & Transactions:
  poin_transaksi.id          → poin_transaksi.poin_transaksi_id

Activity & Logs:
  log_aktivitas.id           → log_aktivitas.log_user_activity_id
  audit_logs.id              → audit_logs.audit_log_id

Notifications:
  notifikasi.id              → notifikasi.notifikasi_id
```

---

## ✅ Testing Checklist

### Critical Path Testing
- [ ] Login flow works (user.user_id created in localStorage)
- [ ] Dashboard loads (no undefined errors)
- [ ] User profile displays correctly
- [ ] Badges display without errors
- [ ] Products page loads
- [ ] Setor sampah form works
- [ ] Leaderboard displays correct user IDs
- [ ] No console errors
- [ ] No undefined reference warnings
- [ ] All API responses parsed correctly

### Component-Level Tests
- [ ] AuthContext provides correct user data
- [ ] All child components receive correct user_id
- [ ] List keys are unique and correct
- [ ] API response mapping works
- [ ] localStorage contains correct fields
- [ ] No NULL or undefined values

---

## 🚀 Execution Order

**Priority 1 (MUST DO FIRST):**
1. AuthContext.jsx - Affects all components
2. Main Dashboard components
3. Profile components

**Priority 2 (HIGH):**
4. React keys in all list renders
5. API service response handling
6. State management updates

**Priority 3 (MEDIUM):**
7. Utility functions
8. Product components
9. Waste management components

**Priority 4 (POLISH):**
10. Tests
11. Documentation
12. Final verification

---

## 📊 Progress Tracking

```
Phase 1: Context & Auth ............ [ ] 0%
Phase 2: Components ................ [ ] 0%
Phase 3: React Keys ................ [ ] 0%
Phase 4: API Services .............. [ ] 0%
Phase 5: State Management .......... [ ] 0%
Phase 6: Utilities ................. [ ] 0%
Testing ............................... [ ] 0%

Overall Completion: 0%
```

---

## 📝 Notes

- **Start with AuthContext** - Everything depends on it
- **Use grep to find patterns** - `grep -r "\.id" src/` to find all references
- **Test after each major section** - Don't wait until the end
- **Console.log the objects** - Verify what fields they actually have
- **Keep git commits atomic** - One logical change per commit

---

## 🔗 Related Documents

- `BACKEND_FIXES_COMPLETE_VERIFIED.md` - What backend fixed
- `PROJECT_COMPLETE_PRODUCTION_READY.md` - System overview
- Field mapping reference (above)

---

**Ready to begin Phase 1: AuthContext.jsx update**
