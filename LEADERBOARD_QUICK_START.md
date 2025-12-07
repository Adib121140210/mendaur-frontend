# 🏆 Leaderboard - Quick Start Guide

## What Was Built

The **Leaderboard** feature has been upgraded from 50% → **100% completion** with these enhancements:

### ✅ Features Added
1. **Real API Integration** - Connects to `/api/dashboard/leaderboard`
2. **Time Filters** - All Time, This Month, This Week
3. **Search Bar** - Find users by name with instant filtering
4. **User Highlight** - Yellow background + rank badge for your position
5. **Top 3 Medals** - 🥇🥈🥉 with glow effects
6. **Loading States** - Spinner, error messages, empty states
7. **Mobile Responsive** - Works on all screen sizes

---

## 🎯 How to Test

### 1. Navigate to Leaderboard
```
Go to: http://localhost:5173/leaderboard
```

### 2. Expected Behavior

#### ✅ On Page Load:
- Shows loading spinner
- Fetches data from backend API
- Displays table with rankings
- Your row is highlighted in yellow
- Top 3 users have medal emoji

#### ✅ Time Period Filters:
- Click "Sepanjang Waktu" (All Time) - Active by default
- Click "Bulan Ini" (This Month) - Re-fetches data
- Click "Minggu Ini" (This Week) - Re-fetches data
- Active filter has blue gradient background

#### ✅ Search Functionality:
- Type in search box
- Results filter instantly
- "No results" message if not found
- Click X button to clear search

#### ✅ Current User:
- Banner shows: "🏆 Peringkat Anda: #X dari Y peserta"
- Your row has yellow background
- "Anda" badge next to your name
- Left border is 4px orange

#### ✅ Pagination:
- Shows 10 users per page
- Next/Prev buttons work
- Current page indicator updates

---

## 🐛 Troubleshooting

### "Anda harus login" Error
**Solution:** User not authenticated. Login first.
```javascript
// Check localStorage:
localStorage.getItem('token')  // Should have value
localStorage.getItem('id_user')  // Should have user ID
```

### "Gagal mengambil data leaderboard"
**Solution:** Backend API not responding.
```bash
# Check backend is running:
php artisan serve
# Should be at: http://127.0.0.1:8000
```

### No Data Displayed
**Solution:** API returned empty array.
- Check database has users with points
- Verify API endpoint returns data:
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" \
       http://127.0.0.1:8000/api/dashboard/leaderboard
  ```

### Search Not Working
**Solution:** Check field names in API response.
- Component looks for: `nama`, `nama_user`, or `name`
- If your API uses different field, update line ~70 in leaderboardTable.jsx

---

## 🔧 Backend Integration

### Required API Endpoint
```
GET /api/dashboard/leaderboard
```

### Expected Response
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nama": "User Name",
      "total_poin": 5000,
      "total_sampah": 50
    }
  ]
}
```

### Optional: Time Period Support
To enable filter functionality, backend should accept:
```
GET /api/dashboard/leaderboard?period=all|monthly|weekly
```

---

## 📱 Mobile View

On mobile (≤768px):
- Filter buttons show icons only
- Search bar full width
- Table columns compressed
- Pagination stacks vertically
- Current user badge smaller

---

## 🎨 Customization

### Change Items Per Page
```javascript
// File: leaderboardTable.jsx, line ~20
const itemsPerPage = 10; // Change to 20, 50, etc.
```

### Add New Filter Period
```javascript
// File: leaderboardTable.jsx, line ~98
const timePeriods = [
  { value: 'all', label: 'Sepanjang Waktu', icon: <TrendingUp /> },
  { value: 'monthly', label: 'Bulan Ini', icon: <Calendar /> },
  { value: 'weekly', label: 'Minggu Ini', icon: <Clock /> },
  // Add here:
  { value: 'daily', label: 'Hari Ini', icon: <Clock /> },
];
```

### Modify Medal Colors
```css
/* File: leaderboardTable.css */
.rankingGold {
  color: #FFD700; /* Change gold color */
}
.rankingSilver {
  color: #C0C0C0; /* Change silver color */
}
.rankingBronze {
  color: #CD7F32; /* Change bronze color */
}
```

---

## 📊 Files Modified

### JavaScript
- `leaderboardTable.jsx` - Main component (310 lines)
  - API integration
  - Search & filter logic
  - User highlight logic

### CSS
- `leaderboardTable.css` - Styling (280 lines)
  - Filter buttons
  - Search bar
  - User highlight
  - Loading/error states

### Documentation
- `LEADERBOARD_COMPLETE.md` - Full documentation
- `LEADERBOARD_QUICK_START.md` - This file
- `FRONTEND_PROGRESS_CHECKLIST.md` - Updated progress

---

## ✅ Success Criteria

Your leaderboard is working if:
- [x] Page loads without errors
- [x] API fetches data successfully
- [x] Users are sorted by points (highest first)
- [x] Top 3 have medal emoji
- [x] Your row is highlighted yellow
- [x] Search filters results
- [x] Filter buttons change active state
- [x] Pagination works
- [x] Mobile view is responsive

---

## 🚀 Next Steps

Now that Leaderboard is complete (75% overall progress), choose next:

### Option 1: Jadwal Pengambilan ⭐ RECOMMENDED
Schedule waste pickup system with calendar view.

### Option 2: Notifikasi
Notification center with bell icon and alerts.

### Option 3: Settings
User profile editing and account management.

---

## 📞 Need Help?

Common commands:
```bash
# Start dev server
npm run dev

# Check for errors
npm run build

# View in browser
http://localhost:5173/leaderboard
```

Check console (F12) for error messages if something doesn't work!

---

**Status:** ✅ Production Ready  
**Version:** 2.0.0  
**Last Updated:** November 17, 2025
