# Leaderboard Header API Synchronization

## ✅ Changes Made

The **LeaderboardHeader** component has been updated to fetch real data from backend APIs instead of using mock data.

---

## 🔄 What Changed

### Before
- Used `useUserLeaderboardStats()` hook with mock data
- Data from `LeaderboardUsers` array (static)
- No real-time updates

### After
- Direct API calls with `useEffect`
- Real data from backend database
- Loading states during fetch
- Error handling

---

## 🔌 API Integrations

### 1. User Stats API
```
GET /api/dashboard/stats/{userId}
```
**Returns:**
- `total_poin` - User's total points
- `total_sampah` - User's total waste collected
- `sampah_minggu_ini` - Weekly waste increase

### 2. Leaderboard API
```
GET /api/dashboard/leaderboard
```
**Returns:**
- Array of all users sorted by points
- Used to calculate:
  - User's rank/position
  - Total participants
  - Average points ratio

---

## 📊 Stats Cards Data

### 1. Poinmu (Your Points)
- **Value:** User's total points
- **Description:** Ratio compared to average (e.g., "1.5x dari rata-rata")
- **Calculation:** `userPoints / averagePoints`

### 2. Kapasitas Sampahmu (Your Waste Capacity)
- **Value:** Total waste collected in Kg
- **Description:** Weekly increase (e.g., "+3.1 Kg minggu ini")
- **Source:** `sampah_minggu_ini` field from user stats API

### 3. Peringkatmu (Your Rank)
- **Value:** User's position (e.g., "#5")
- **Description:** Total participants (e.g., "dari 127 peserta")
- **Calculation:** Find user's index in sorted leaderboard

---

## 🎯 Features

### ✅ Loading States
Shows "..." while fetching data:
```javascript
value: loading ? "..." : `${stats.poin.toLocaleString('id-ID')}`
description: loading ? "Memuat..." : `${stats.poinRatio}x dari rata-rata`
```

### ✅ Error Handling
- Console logs errors without breaking UI
- Falls back to default values (0, '—')
- Graceful degradation

### ✅ Parallel API Calls
Fetches both APIs simultaneously using `Promise.all()`:
```javascript
const [userStatsResponse, leaderboardResponse] = await Promise.all([...]);
```
**Benefit:** Faster page load (both requests at once)

### ✅ Flexible Field Names
Handles different API response structures:
```javascript
const userPoints = userStats.total_poin || userStats.poin_terkumpul || 0;
```

### ✅ Indonesian Number Formatting
Uses `toLocaleString('id-ID')` for proper formatting:
- `5000` → `5.000`
- `150000` → `150.000`

---

## 🧪 Testing

### Test Cases

#### ✅ User is logged in
- Stats cards show real data
- Rank displays correctly
- Points ratio calculated

#### ✅ User not in leaderboard
- Rank shows "—"
- Other stats still work
- No errors thrown

#### ✅ API is slow
- Shows "..." during load
- Updates when data arrives
- No blank cards

#### ✅ Backend offline
- Console logs error
- Shows fallback values
- UI doesn't crash

---

## 📁 Files Modified

### leaderboardHeader.jsx
**Changes:**
- ✅ Removed `useUserLeaderboardStats` import
- ✅ Added `useState` and `useEffect`
- ✅ Added `fetchStats` async function
- ✅ Parallel API calls with `Promise.all`
- ✅ Loading state management
- ✅ Error handling with try-catch
- ✅ Flexible field name handling
- ✅ Rank calculation from leaderboard
- ✅ Average points ratio calculation

**Lines:** ~140 lines (expanded from ~58)

---

## 🔍 Code Flow

```
Component Mount
    ↓
useEffect triggered
    ↓
Check auth (token + userId)
    ↓
[Parallel Fetch]
    ├─→ User Stats API
    └─→ Leaderboard API
    ↓
Both responses received
    ↓
Extract data (flexible field names)
    ↓
Calculate derived values:
    - User's rank (find index in leaderboard)
    - Average points (sum all / count)
    - Points ratio (user / average)
    ↓
Update state with setStats()
    ↓
Component re-renders with real data
    ↓
Stats cards display values
```

---

## 🐛 Troubleshooting

### Issue: Stats show "..." forever
**Cause:** API not responding  
**Solution:** 
1. Check backend is running: `php artisan serve`
2. Check token in localStorage: `localStorage.getItem('token')`
3. Open Network tab (F12) and look for 401/500 errors

### Issue: Rank shows "—"
**Cause:** User not found in leaderboard array  
**Solution:** 
1. Verify user ID matches: `localStorage.getItem('id_user')`
2. Check backend returns user in leaderboard response
3. Console log to debug: `console.log(leaderboard, userId)`

### Issue: Points ratio is 0
**Cause:** Average points calculation failed  
**Solution:**
1. Ensure leaderboard array has users with points
2. Check field names: `total_poin` or `poin_terkumpul`
3. Verify leaderboard.length > 0

---

## 🎨 UI States

### Loading State
```
┌─────────────────────────┐
│ Poinmu                  │
│ ...                     │
│ Memuat...               │
└─────────────────────────┘
```

### Loaded State
```
┌─────────────────────────┐
│ Poinmu             🏆   │
│ 66.000                  │
│ 1.2x dari rata-rata     │
└─────────────────────────┘
```

### Error State (Fallback)
```
┌─────────────────────────┐
│ Poinmu             🏆   │
│ 0                       │
│ 0x dari rata-rata       │
└─────────────────────────┘
```

---

## 🚀 Performance

### Optimization Techniques

1. **Parallel Fetching**
   - Both APIs called simultaneously
   - Saves ~200-300ms vs sequential

2. **Single useEffect**
   - Runs once on mount (`[]` dependency)
   - No unnecessary re-fetches

3. **Memoized Calculations**
   - Rank and ratio calculated once
   - Stored in state

4. **Conditional Rendering**
   - Loading text only shows during fetch
   - Prevents layout shift

---

## ✅ Validation

### API Response Validation
Component handles multiple response formats:

**Format 1: Nested data**
```json
{
  "data": {
    "total_poin": 5000,
    "total_sampah": 50
  }
}
```

**Format 2: Direct object**
```json
{
  "total_poin": 5000,
  "total_sampah": 50
}
```

**Format 3: Leaderboard variations**
```json
{
  "data": [...],
  "leaderboard": [...],
  [...] // Direct array
}
```

---

## 📖 Best Practices Applied

- ✅ Authentication checks before API calls
- ✅ Error boundaries (try-catch)
- ✅ Loading states for better UX
- ✅ Fallback values for undefined data
- ✅ Indonesian locale for numbers
- ✅ Parallel async operations
- ✅ Clean error logging
- ✅ Component doesn't crash on errors

---

## 🔗 Related Components

This header works together with:
- **leaderboardTable.jsx** - Also uses leaderboard API
- **homeContent.jsx** - Similar stats cards pattern
- **profilHeader.jsx** - Similar user data fetching

---

## 📊 Before vs After Comparison

| Feature | Before | After |
|---------|--------|-------|
| Data Source | Mock (static) | API (dynamic) |
| Loading State | None | "..." with "Memuat..." |
| Error Handling | None | Try-catch with fallback |
| Rank Calculation | Mock array | Real leaderboard |
| Points Ratio | Mock data | Calculated from API |
| Weekly Increase | Hardcoded "+3.1 Kg" | Real from API |
| Authentication | Not checked | Token validation |
| API Calls | 0 | 2 (parallel) |

---

## 🎯 Success Criteria

Your leaderboard header is working if:
- [x] Stats cards show real user data
- [x] Numbers are formatted with dots (5.000, not 5000)
- [x] Loading shows "..." briefly on page load
- [x] Rank shows "#" format (e.g., "#5")
- [x] Points ratio calculated correctly
- [x] Weekly increase shows real data
- [x] No console errors
- [x] Works when backend is offline (shows fallbacks)

---

## 📞 API Requirements

**Backend must provide:**

1. User stats endpoint with fields:
   - `total_poin` or `poin_terkumpul`
   - `total_sampah` or `sampah_terkumpul`
   - `sampah_minggu_ini` (optional)

2. Leaderboard endpoint with:
   - Array of users sorted by points
   - Each user has `id` or `id_user`
   - Each user has points field

---

**Status:** ✅ Complete  
**Version:** 2.0.0  
**Date:** November 17, 2025

Now both leaderboard components (header + table) use real API data! 🎉
