# Backend Implementation Guide - Admin Point Dashboard

## 📋 Overview

The frontend has been fully converted to an admin-only point management system. This document specifies exactly what backend APIs need to be implemented to make the system functional.

---

## 🔐 Authentication Requirement

**The login response must include a `role` field:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@mendaur.com",
    "role": "admin"  // ← ADD THIS FIELD
  }
}
```

**Implementation:**
- Update login endpoint to include `role` in response
- Store role value in `localStorage.getItem('role')`
- Use for admin verification: `if (role === 'admin')`

---

## 🛣️ Required API Endpoints

### 1. GET /api/poin/admin/stats

**Purpose:** Get system-wide point statistics

**Query Parameters:** None (always returns system-wide data)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_points_in_system": 50000,
    "active_users": 125,
    "total_distributions": 3450,
    "recent_activity": [
      {
        "id": 1,
        "user_id": 5,
        "user_name": "John Doe",
        "type": "setor_sampah",
        "description": "Waste deposit - Plastic (5 kg)",
        "amount": 150,
        "created_at": "2025-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "user_id": 8,
        "user_name": "Jane Smith",
        "type": "tukar_poin",
        "description": "Redeemed Coffee Voucher",
        "amount": -500,
        "created_at": "2025-01-15T09:15:00Z"
      }
    ]
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized - Admin role required"
}
```

**Notes:**
- `total_points_in_system`: Sum of all user points
- `active_users`: Count of users with recent activity (last 30 days)
- `total_distributions`: Total number of point transactions
- `recent_activity`: Last 5-10 transactions system-wide
- All timestamps in ISO 8601 format

---

### 2. GET /api/poin/admin/history

**Purpose:** Get all users' transaction history with filtering

**Query Parameters:**
```
page: integer (default: 1)
per_page: integer (default: 10, max: 100)
user_id: string|integer (optional - filter by specific user ID or name)
type: string (optional - filter: 'setor_sampah', 'tukar_poin', 'bonus')
start_date: string (optional - YYYY-MM-DD format)
end_date: string (optional - YYYY-MM-DD format)
```

**Example Request:**
```
GET /api/poin/admin/history?page=1&per_page=10&user_id=5&type=setor_sampah&start_date=2025-01-01&end_date=2025-01-31
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "user_name": "John Doe",
      "type": "setor_sampah",
      "description": "Waste deposit - Plastic (5 kg)",
      "amount": 150,
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "user_id": 5,
      "user_name": "John Doe",
      "type": "setor_sampah",
      "description": "Waste deposit - Paper (2 kg)",
      "amount": 80,
      "created_at": "2025-01-14T14:20:00Z"
    }
  ],
  "total": 245,
  "page": 1,
  "per_page": 10,
  "total_pages": 25
}
```

**Notes:**
- `user_name` must be included (required for frontend display)
- `user_id` filter can accept user ID or username
- Results must be sorted by `created_at DESC` (newest first)
- Support pagination with offset calculation

---

### 3. GET /api/poin/admin/redemptions

**Purpose:** Get all users' redemption history

**Query Parameters:**
```
page: integer (default: 1)
per_page: integer (default: 8, max: 100)
user_id: string|integer (optional - filter by user ID or name)
status: string (optional - filter: 'pending', 'completed', 'cancelled')
```

**Example Request:**
```
GET /api/poin/admin/redemptions?page=1&per_page=8&user_id=5&status=completed
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "user_name": "John Doe",
      "product_id": 10,
      "product_name": "Coffee Voucher",
      "product_category": "Food & Beverage",
      "product_image": "https://api.mendaur.com/images/coffee-voucher.jpg",
      "points_used": 500,
      "status": "completed",
      "created_at": "2025-01-15T10:00:00Z",
      "redeemed_at": "2025-01-15T14:30:00Z"
    },
    {
      "id": 2,
      "user_id": 8,
      "user_name": "Jane Smith",
      "product_id": 15,
      "product_name": "Eco Bag",
      "product_category": "Merchandise",
      "product_image": "https://api.mendaur.com/images/eco-bag.jpg",
      "points_used": 750,
      "status": "pending",
      "created_at": "2025-01-14T11:20:00Z",
      "redeemed_at": null
    }
  ],
  "total": 456,
  "page": 1,
  "per_page": 8,
  "total_pages": 57
}
```

**Notes:**
- `user_name` must be included (required)
- `product_image` should be full URL
- `redeemed_at` can be null if not yet completed
- Statuses: 'pending', 'completed', 'cancelled'
- Sort by `created_at DESC` (newest first)

---

### 4. GET /api/poin/breakdown/all

**Purpose:** Get system-wide point source breakdown

**Query Parameters:** None (always returns system-wide aggregation)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_points": 50000,
    "sources": [
      {
        "source": "Waste Deposits",
        "amount": 35000,
        "percentage": 70.0,
        "transaction_count": 2800
      },
      {
        "source": "Bonuses",
        "amount": 10000,
        "percentage": 20.0,
        "transaction_count": 200
      },
      {
        "source": "Referrals",
        "amount": 5000,
        "percentage": 10.0,
        "transaction_count": 500
      }
    ]
  }
}
```

**Notes:**
- Percentages should sum to 100%
- Should include all point sources in system
- Sort by amount DESC (largest first)
- Include transaction count for each source

---

## 🔄 Existing Endpoints That May Need Updates

### Existing: POST /api/poin/bonus (Already Exists)
**Purpose:** Award bonus points to users

No changes needed - this endpoint already exists and works.

### Existing: GET /api/poin/breakdown/{id}
**Status:** May need system-wide variant

- Current endpoint might be user-specific: `GET /api/poin/breakdown/{user_id}`
- Frontend will call `GET /api/poin/breakdown/all` for admin view
- Consider adding both or making `{id}` = "all" work for system-wide

---

## 🧪 Testing Checklist

### Backend Testing (Before Deployment)

```
✅ Login endpoint returns role field
   Test: POST /api/login with admin credentials
   Verify: Response includes "role": "admin"

✅ Admin stats endpoint works
   Test: GET /api/poin/admin/stats with admin token
   Verify: Returns system-wide statistics
   Verify: recent_activity includes user_name

✅ Admin history endpoint works
   Test: GET /api/poin/admin/history?user_id=5
   Verify: Returns only that user's transactions
   Verify: All transactions include user_name field
   Verify: Pagination works correctly

✅ Admin redemptions endpoint works
   Test: GET /api/poin/admin/redemptions?status=completed
   Verify: Returns only completed redemptions
   Verify: Includes product_image URL
   Verify: Pagination works

✅ Point breakdown system endpoint works
   Test: GET /api/poin/breakdown/all
   Verify: Returns system-wide breakdown
   Verify: Percentages sum to ~100%

✅ Authentication works
   Test: Call admin endpoint with non-admin token
   Verify: Returns 401 Unauthorized
   Test: Call admin endpoint without token
   Verify: Returns 401 Unauthorized

✅ Role verification works
   Test: Non-admin user cannot access /api/poin/admin/* endpoints
   Verify: Returns 401 or 403 error
```

### Frontend Integration Testing (After Backend Ready)

```
Test: Admin can access /admin/dashboard/points
Test: Non-admin cannot access admin routes
Test: System stats display correctly
Test: User search filters work
Test: Transaction filters work
Test: Pagination works on all pages
Test: Mobile responsiveness works
Test: All data refreshes correctly
```

---

## 📊 Expected Data Structure

### User Object (In all responses where user info is needed)
```json
{
  "user_id": 5,
  "user_name": "John Doe"
}
```

### Transaction Object
```json
{
  "id": 1,
  "user_id": 5,
  "user_name": "John Doe",
  "type": "setor_sampah",
  "description": "Waste deposit - Plastic (5 kg)",
  "amount": 150,
  "created_at": "2025-01-15T10:30:00Z"
}
```

### Redemption Object
```json
{
  "id": 1,
  "user_id": 5,
  "user_name": "John Doe",
  "product_id": 10,
  "product_name": "Coffee Voucher",
  "product_category": "Food & Beverage",
  "product_image": "https://...",
  "points_used": 500,
  "status": "completed",
  "created_at": "2025-01-15T10:00:00Z",
  "redeemed_at": "2025-01-15T14:30:00Z"
}
```

---

## 🚀 Implementation Timeline

### Phase 1: Setup (1-2 hours)
- [ ] Update login endpoint to return `role` field
- [ ] Add admin middleware for route protection

### Phase 2: API Development (3-4 hours)
- [ ] Implement `/api/poin/admin/stats` endpoint
- [ ] Implement `/api/poin/admin/history` endpoint
- [ ] Implement `/api/poin/admin/redemptions` endpoint
- [ ] Update point breakdown for system-wide access

### Phase 3: Testing (2-3 hours)
- [ ] Unit test each endpoint
- [ ] Integration test with frontend
- [ ] Security audit of admin endpoints
- [ ] Performance testing with large datasets

### Phase 4: Deployment (1 hour)
- [ ] Deploy backend APIs
- [ ] Deploy frontend components
- [ ] Verify end-to-end functionality

---

## 📞 Questions & Support

For frontend implementation details, refer to:
- `POINT_SYSTEM_ADMIN_DASHBOARD_COMPLETE.md` - Full component specifications
- `ADMIN_DASHBOARD_QUICK_START.md` - Quick reference guide
- Component source files in `src/Components/Pages/`

---

## ✨ Summary

**Backend needs to implement:**
1. ✅ Add `role` field to login response
2. ✅ Implement 4 new API endpoints
3. ✅ Add admin middleware verification
4. ✅ Ensure all responses include `user_name` where applicable

**Frontend is ready:**
- ✅ All 5 components converted
- ✅ All routes configured
- ✅ Admin role checks implemented
- ✅ User search and filtering ready
- ✅ Responsive design complete

**Next:** Backend implementation and testing

---

*Backend Implementation Guide*  
*For Admin Point Dashboard System*  
*January 2025*
