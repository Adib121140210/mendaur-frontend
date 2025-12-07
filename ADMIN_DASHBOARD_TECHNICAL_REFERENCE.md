# 🔧 ADMIN DASHBOARD - TECHNICAL REFERENCE

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Updated:** December 1, 2025

---

## 📖 COMPONENT API REFERENCE

### AdminDashboard.jsx
**Main container component**

```javascript
// Props
None - Standalone component

// State
- userRole: string (admin/superadmin)
- loading: boolean
- error: string | null
- activeTab: string

// Methods
- useEffect() - Verify role on mount
- handleTabClick() - Switch tabs

// Renders
- Admin-only interface with 6 tabs
- Access denied message for non-admins
```

### OverviewCards.jsx
**Statistics display component**

```javascript
// Props
None - Standalone component

// State
- stats: object | null
- loading: boolean
- error: string | null

// Methods
- fetchOverviewStats() - GET /api/admin/dashboard/overview
- useEffect() - Auto-refresh every 30 seconds

// Data Displayed
- users.total
- users.active_30days
- waste.yearly_total_kg
- waste.yearly_total_count
- points.yearly_total
- points.monthly_total
- redemptions.yearly_total_points_redeemed
```

### UserManagementTable.jsx
**User list with search and pagination**

```javascript
// Props
None - Standalone component

// State
- users: array
- loading: boolean
- error: string | null
- searchTerm: string
- currentPage: number
- totalPages: number

// Methods
- fetchUsers() - GET /api/admin/dashboard/users
- handleSearch(e) - Update search and reset page
- handleRetry() - Reset filters

// Query Parameters
- page: currentPage
- per_page: 10
- search: searchTerm

// Columns Displayed
[No, Name, Email, Phone, Points, Level, Deposits, Joined]
```

### WasteAnalytics.jsx
**Waste data visualization**

```javascript
// Props
None - Standalone component

// State
- wasteData: object | null
- loading: boolean
- error: string | null
- period: 'daily' | 'monthly' | 'yearly'
- year: number
- month: number (1-12)

// Methods
- fetchWasteData() - GET /api/admin/dashboard/waste-summary

// Query Parameters
- period: period
- year: year
- month: month (if period === 'daily')

// Data Returned
- summary: array of waste by type
- chart_data: array formatted for charts
- total_berat: total waste in kg
- total_setor: total deposits count
```

### PointsDistribution.jsx
**Points tracking component**

```javascript
// Props
None - Standalone component

// State
- pointsData: object | null
- loading: boolean
- error: string | null
- period: 'daily' | 'monthly' | 'yearly'
- year: number
- month: number

// Methods
- fetchPointsData() - GET /api/admin/dashboard/point-summary

// Query Parameters
- period: period
- year: year
- month: month (if period === 'daily')

// Data Returned
- summary: array of points by source
- chart_data: array formatted for charts
- total_poin: total points
- total_transaksi: transaction count
```

### WasteByUserTable.jsx
**User waste breakdown**

```javascript
// Props
None - Standalone component

// State
- wasteByUser: array
- loading: boolean
- error: string | null
- period: 'daily' | 'monthly'
- year: number
- month: number

// Methods
- fetchWasteByUser() - GET /api/admin/dashboard/waste-by-user
- handleExportCSV() - Generate CSV file

// Query Parameters
- period: period
- year: year
- month: month (if period === 'daily')

// CSV Export
- Headers: User Name, Waste Type, Total kg, Points Earned, Deposits
- Filename: waste-by-user-{timestamp}.csv
```

### ReportsSection.jsx
**Report generation**

```javascript
// Props
None - Standalone component

// State
- reportType: 'daily' | 'monthly'
- year: number
- month: number
- day: number
- report: object | null
- loading: boolean
- error: string | null

// Methods
- handleGenerateReport() - GET /api/admin/dashboard/report
- handleExportPDF() - Placeholder
- handleExportExcel() - Placeholder
- handlePrint() - window.print()

// Query Parameters
- type: reportType
- year: year
- month: month
- day: day (if type === 'daily')

// Report Sections
- waste: total_kg, total_count, by_type
- points: total, by_source
- users_active: count
- daily_breakdown: (monthly only)
```

---

## 🔐 AUTHENTICATION FLOW

```javascript
// 1. On Component Mount
const role = localStorage.getItem('role')
const token = localStorage.getItem('token')

// 2. Role Verification
if (role !== 'admin' && role !== 'superadmin') {
  return <AccessDenied />
}

// 3. API Calls
headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// 4. Error Handling
if (response.status === 401 || response.status === 403) {
  redirect to login
}
```

---

## 📊 API RESPONSE FORMATS

### Overview Response
```json
{
  "status": "success",
  "data": {
    "waste": {
      "yearly_total_kg": 250.5,
      "yearly_total_count": 45,
      "monthly_total_kg": 85.25
    },
    "points": {
      "yearly_total": 2500,
      "monthly_total": 450
    },
    "users": {
      "total": 6,
      "active_30days": 4
    },
    "redemptions": {
      "yearly_total_points_redeemed": 800
    }
  }
}
```

### Users Response
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "nama": "John Doe",
        "email": "john@example.com",
        "no_hp": "08123456789",
        "total_poin": 250,
        "level": "Menengah",
        "created_at": "2025-11-01T10:00:00Z",
        "updated_at": "2025-11-28T15:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 6,
      "total_pages": 1
    }
  }
}
```

### Waste Summary Response
```json
{
  "status": "success",
  "data": {
    "summary": [
      {
        "jenis_sampah": "Kertas",
        "total_berat": 45.5,
        "jumlah_setor": 8,
        "periode_bulan": "2025-12"
      }
    ],
    "chart_data": [
      {
        "label": "2025-12",
        "total_berat": 77.8,
        "types": { "Kertas": 45.5 }
      }
    ],
    "total_berat": 77.8,
    "total_setor": 14
  }
}
```

### Points Summary Response
```json
{
  "status": "success",
  "data": {
    "summary": [
      {
        "source": "setor_sampah",
        "total_poin": 450,
        "jumlah_transaksi": 12,
        "periode_bulan": "2025-12"
      }
    ],
    "chart_data": [
      {
        "label": "2025-12",
        "total_poin": 550,
        "sources": { "setor_sampah": 450 }
      }
    ],
    "total_poin": 550,
    "total_transaksi": 14
  }
}
```

### Report Response
```json
{
  "status": "success",
  "data": {
    "report_type": "monthly",
    "month": "2025-12",
    "waste": {
      "total_kg": 250.5,
      "total_count": 45,
      "by_type": {
        "Kertas": { "count": 20, "total_kg": 110.0 }
      }
    },
    "points": {
      "total": 2500,
      "by_source": {
        "setor_sampah": { "count": 40, "total_poin": 2200 }
      }
    },
    "users_active": 6,
    "daily_breakdown": {
      "2025-12-01": { "waste_kg": 77.8, "waste_count": 14 }
    }
  }
}
```

---

## 🎨 CSS CLASS REFERENCE

### Main Container
```css
.admin-dashboard-container       /* Main wrapper */
.admin-dashboard-header          /* Header section */
.tab-navigation                  /* Tab nav bar */
.tab-btn                         /* Tab button */
.tab-btn.active                  /* Active tab */
.tab-content                     /* Content area */
.tab-pane                        /* Individual tab */
```

### Overview Cards
```css
.overview-cards-grid             /* Cards container */
.overview-card                   /* Individual card */
.card-header                     /* Card header */
.card-icon                       /* Icon wrapper */
.card-title                      /* Card title */
.card-value                      /* Card value */
.card-subtitle                   /* Card subtitle */
```

### Users Table
```css
.users-management                /* Container */
.users-header                    /* Header */
.search-box                      /* Search */
.users-table-wrapper             /* Table wrapper */
.users-table                     /* Table */
.users-mobile-cards              /* Mobile layout */
.pagination                      /* Pagination */
```

### Utility Classes
```css
.btn-retry                       /* Retry button */
.btn-generate                    /* Generate button */
.btn-export                      /* Export button */
.error-icon                      /* Error icon */
.spinner                         /* Loading spinner */
.empty-message                   /* No data message */
.level-badge                     /* Status badge */
```

---

## 🔧 CUSTOMIZATION GUIDE

### Change Primary Color
Edit in `adminDashboard.css`:
```css
/* Change from #10b981 to your color */
.admin-dashboard-header {
  border-left-color: #your-color;
}

.btn-retry,
.btn-generate {
  background: #your-color;
}
```

### Change Auto-Refresh Rate
Edit in `OverviewCards.jsx`:
```javascript
// Change from 30000ms (30 seconds) to desired value
const interval = setInterval(fetchOverviewStats, 60000) // 60 seconds
```

### Change Pagination Size
Edit in `UserManagementTable.jsx`:
```javascript
// Change from 10 to desired value
per_page: 10
```

### Change API Base URL
Edit in each component:
```javascript
// Change from localhost:8000 to production URL
const response = await fetch(
  'http://your-production-api.com/api/admin/dashboard/overview',
  // ...
)
```

---

## ⚡ PERFORMANCE TIPS

1. **Add Response Caching**
   ```javascript
   const cache = {}
   if (cache['overview']) return cache['overview']
   cache['overview'] = data
   ```

2. **Implement Request Debouncing**
   ```javascript
   const debounce = (fn, delay) => {
     let timer
     return (...args) => {
       clearTimeout(timer)
       timer = setTimeout(() => fn(...args), delay)
     }
   }
   ```

3. **Use React.memo for Sub-components**
   ```javascript
   export default React.memo(OverviewCards)
   ```

4. **Add Virtual Scrolling for Large Lists**
   - Use react-window or react-virtualized

5. **Implement Lazy Loading**
   ```javascript
   const component = React.lazy(() => import('./Component'))
   ```

---

## 🐛 DEBUGGING TIPS

### Check API Response
```javascript
console.log('API Response:', response)
```

### Check Component State
```javascript
console.log('Component State:', { users, loading, error })
```

### Monitor API Calls
```javascript
// In DevTools Network tab
GET /api/admin/dashboard/overview
Authorization: Bearer {token}
```

### Check Authentication
```javascript
console.log('Token:', localStorage.getItem('token'))
console.log('Role:', localStorage.getItem('role'))
```

---

## 📦 DEPENDENCIES

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.8.2",
  "lucide-react": "^0.543.0"
}
```

**No additional dependencies required!**

---

## 🔗 ROUTE STRUCTURE

```
/admin/dashboard                    [Main Dashboard]
  ├── Overview Tab                  [OverviewCards]
  ├── Users Tab                     [UserManagementTable]
  ├── Waste Analytics Tab           [WasteAnalytics]
  ├── Points Distribution Tab       [PointsDistribution]
  ├── Waste by User Tab             [WasteByUserTable]
  └── Reports Tab                   [ReportsSection]
```

---

## 📱 MOBILE BREAKPOINTS

```css
/* Desktop */
@media (min-width: 769px) {
  /* Full layout */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 768px) {
  /* 2-column grid */
}

/* Mobile */
@media (min-width: 481px) and (max-width: 640px) {
  /* Card layout */
}

/* Small Mobile */
@media (max-width: 480px) {
  /* Full width */
}
```

---

## ✅ CHECKLIST FOR MODIFICATIONS

Before making changes:
- [ ] Backup current code
- [ ] Test in development
- [ ] Test on mobile
- [ ] Run `pnpm lint`
- [ ] Check console for errors
- [ ] Verify API calls work
- [ ] Test error handling

---

**Technical Reference Complete!**

For more information, refer to:
- Complete Implementation Guide
- API Endpoints Reference
- Data Tables Guide
- Quick Start Guide
