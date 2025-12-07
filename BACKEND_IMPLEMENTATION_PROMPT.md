# Backend Implementation Prompt - Admin Point Dashboard APIs

## 🎯 Mission

Implement 4 new backend API endpoints to complete the Admin Point Dashboard system that has already been built on the frontend.

---

## 📋 Context

The frontend team has successfully converted the Point Dashboard system from user-facing to **admin-only management tool**. All 5 React components are complete, tested, and ready to deploy. 

**Your task:** Implement the 4 new API endpoints that the frontend components need to function.

**Status:** Frontend ✅ READY | Backend ⏳ NEEDED | Documentation ✅ COMPLETE

---

## 🔐 Step 1: Update Authentication Response

### Current Login Response (Missing role field)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@mendaur.com"
  }
}
```

### Required Login Response (Add role field)
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
1. Update login endpoint to include `role` field in response
2. The `role` value should be stored in user database (e.g., 'admin' or 'user')
3. Include role in JWT token if using token-based auth
4. Frontend will read this as: `localStorage.getItem('role')`

---

## 🛣️ Step 2: Implement 4 New API Endpoints

### Endpoint 1: GET /api/poin/admin/stats

**Purpose:** Return system-wide point statistics

**Request:**
```http
GET /api/poin/admin/stats
Authorization: Bearer {admin_token}
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

**Implementation Details:**
- `total_points_in_system`: Sum of all user points balances
- `active_users`: Count of users with activity in last 30 days
- `total_distributions`: Total count of point transactions (deposits + redemptions + bonuses)
- `recent_activity`: Last 5-10 transactions with user information
- All timestamps must be ISO 8601 format (e.g., "2025-01-15T10:30:00Z")
- **MUST include `user_name` field** (required for frontend display)

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized - Admin role required"
}
```

---

### Endpoint 2: GET /api/poin/admin/history

**Purpose:** Get all users' transaction history with filtering

**Request:**
```http
GET /api/poin/admin/history?page=1&per_page=10&user_id=5&type=setor_sampah&start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| page | integer | 1 | No | Page number for pagination |
| per_page | integer | 10 | No | Items per page (max 100) |
| user_id | string/int | - | No | Filter by user ID or name |
| type | string | - | No | Filter by transaction type (e.g., 'setor_sampah', 'tukar_poin', 'bonus') |
| start_date | string | - | No | Start date (YYYY-MM-DD format) |
| end_date | string | - | No | End date (YYYY-MM-DD format) |

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

**Implementation Details:**
- **MUST include `user_name` field** in every transaction
- Sort results by `created_at DESC` (newest first)
- Support all query parameters with proper filtering
- Calculate `total_pages` as: `ceil(total / per_page)`
- User search should work with both user ID and username
- Date filtering should use BETWEEN logic
- Handle pagination with LIMIT and OFFSET

**Example Queries:**
```
GET /api/poin/admin/history?page=1
  → All transactions, page 1

GET /api/poin/admin/history?user_id=5
  → All transactions for user ID 5

GET /api/poin/admin/history?user_id=john.doe
  → All transactions for user named "john.doe"

GET /api/poin/admin/history?type=setor_sampah&start_date=2025-01-01
  → All waste deposits since Jan 1, 2025

GET /api/poin/admin/history?user_id=5&type=bonus&per_page=20
  → All bonus transactions for user 5, 20 per page
```

---

### Endpoint 3: GET /api/poin/admin/redemptions

**Purpose:** Get all users' redemption history with filtering

**Request:**
```http
GET /api/poin/admin/redemptions?page=1&per_page=8&user_id=5&status=completed
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| page | integer | 1 | No | Page number for pagination |
| per_page | integer | 8 | No | Items per page (max 100) |
| user_id | string/int | - | No | Filter by user ID or name |
| status | string | - | No | Filter by status ('pending', 'completed', 'cancelled') |

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

**Implementation Details:**
- **MUST include `user_name` field** in every redemption
- `product_image` must be full URL (not just path)
- `redeemed_at` can be null if status is 'pending'
- Sort results by `created_at DESC` (newest first)
- Support pagination with same logic as history
- Status values: 'pending', 'completed', 'cancelled'

**Example Queries:**
```
GET /api/poin/admin/redemptions?status=completed
  → All completed redemptions

GET /api/poin/admin/redemptions?user_id=5&status=pending
  → All pending redemptions for user 5

GET /api/poin/admin/redemptions?per_page=20
  → All redemptions, 20 per page
```

---

### Endpoint 4: GET /api/poin/breakdown/all

**Purpose:** Get system-wide point source breakdown

**Request:**
```http
GET /api/poin/breakdown/all
Authorization: Bearer {admin_token}
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

**Implementation Details:**
- Group all point transactions by source/type
- Calculate percentage for each source: `(amount / total_points) * 100`
- Percentages should sum to approximately 100%
- Include transaction count for each source
- Sort by amount DESC (largest first)
- `total_points` = sum of all source amounts

---

## 🔐 Step 3: Add Admin Middleware

Create middleware to protect admin endpoints:

```
1. Check Authorization header for Bearer token
2. Verify token is valid
3. Decode token and check user role
4. If role !== 'admin', return 401 Unauthorized
5. Allow request to proceed if admin
```

Apply this middleware to all 4 new endpoints:
- `/api/poin/admin/stats`
- `/api/poin/admin/history`
- `/api/poin/admin/redemptions`
- `/api/poin/breakdown/all` (or ensure admin check)

---

## 🧪 Testing Checklist

### Authentication Testing
- [ ] Login endpoint returns `role` field
- [ ] Admin role is "admin"
- [ ] Non-admin role prevents access to admin endpoints
- [ ] Non-admin users get 401 Unauthorized response

### Endpoint Testing

**GET /api/poin/admin/stats**
- [ ] Returns success response with data
- [ ] Includes `total_points_in_system`
- [ ] Includes `active_users` count
- [ ] Includes `total_distributions` count
- [ ] Includes `recent_activity` array
- [ ] All transactions have `user_name` field
- [ ] Non-admin gets 401 error

**GET /api/poin/admin/history**
- [ ] Returns paginated transaction list
- [ ] All items include `user_name`
- [ ] `user_id` filter works
- [ ] `type` filter works
- [ ] `start_date` and `end_date` filters work
- [ ] `page` and `per_page` parameters work
- [ ] Results sorted by `created_at DESC`
- [ ] Pagination metadata correct

**GET /api/poin/admin/redemptions**
- [ ] Returns paginated redemption list
- [ ] All items include `user_name`
- [ ] All items include `product_image` (full URL)
- [ ] `user_id` filter works
- [ ] `status` filter works
- [ ] `redeemed_at` can be null
- [ ] Pagination works
- [ ] Results sorted by `created_at DESC`

**GET /api/poin/breakdown/all**
- [ ] Returns breakdown data
- [ ] Percentages sum to ~100%
- [ ] Sorted by amount DESC
- [ ] Includes transaction count per source
- [ ] Non-admin gets 401 error

---

## 📦 Required Database Queries

### For /api/poin/admin/stats
```sql
-- Total points in system
SELECT SUM(balance) as total_points FROM users;

-- Active users (last 30 days)
SELECT COUNT(DISTINCT user_id) as active_users 
FROM poin_transactions 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Total distributions
SELECT COUNT(*) as total_distributions FROM poin_transactions;

-- Recent activity
SELECT id, user_id, users.name as user_name, type, description, amount, created_at
FROM poin_transactions
JOIN users ON poin_transactions.user_id = users.id
ORDER BY created_at DESC
LIMIT 10;
```

### For /api/poin/admin/history
```sql
SELECT pt.id, pt.user_id, u.name as user_name, pt.type, pt.description, pt.amount, pt.created_at
FROM poin_transactions pt
JOIN users u ON pt.user_id = u.id
WHERE 1=1
  -- Add filters based on query params
  AND (? = 'all' OR pt.user_id = ? OR u.name LIKE ?)  -- user_id filter
  AND (? IS NULL OR pt.type = ?)  -- type filter
  AND (? IS NULL OR DATE(pt.created_at) >= ?)  -- start_date
  AND (? IS NULL OR DATE(pt.created_at) <= ?)  -- end_date
ORDER BY pt.created_at DESC
LIMIT ? OFFSET ?;
```

### For /api/poin/admin/redemptions
```sql
SELECT r.id, r.user_id, u.name as user_name, r.product_id, 
       p.name as product_name, p.category as product_category, 
       p.image_url as product_image, r.points_used, r.status, 
       r.created_at, r.redeemed_at
FROM redemptions r
JOIN users u ON r.user_id = u.id
JOIN products p ON r.product_id = p.id
WHERE 1=1
  AND (? = 'all' OR r.user_id = ? OR u.name LIKE ?)  -- user_id filter
  AND (? IS NULL OR r.status = ?)  -- status filter
ORDER BY r.created_at DESC
LIMIT ? OFFSET ?;
```

### For /api/poin/breakdown/all
```sql
SELECT pt.type as source, SUM(pt.amount) as amount, COUNT(*) as transaction_count
FROM poin_transactions pt
GROUP BY pt.type
ORDER BY amount DESC;
```

---

## 🚀 Implementation Timeline

### Phase 1: Setup (1-2 hours)
- [ ] Update login endpoint to return role field
- [ ] Create admin middleware
- [ ] Add route protection

### Phase 2: API Development (3-4 hours)
- [ ] Implement /api/poin/admin/stats endpoint
- [ ] Implement /api/poin/admin/history endpoint
- [ ] Implement /api/poin/admin/redemptions endpoint
- [ ] Implement /api/poin/breakdown/all endpoint

### Phase 3: Testing (2-3 hours)
- [ ] Unit test each endpoint
- [ ] Test with Postman/Insomnia
- [ ] Verify admin middleware works
- [ ] Test all query parameters
- [ ] Test error responses

### Phase 4: Integration (1 hour)
- [ ] Deploy APIs
- [ ] Test with frontend in development
- [ ] Verify end-to-end flow

---

## 📞 Frontend Integration

The frontend will call these endpoints with this pattern:

```javascript
// Example from frontend component
const response = await fetch(
  'http://127.0.0.1:8000/api/poin/admin/history?page=1&user_id=5',
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  }
);
```

**Frontend expects:**
- Proper role field in login response
- Admin endpoints to return data in exact format specified
- All responses to include `user_name` field where applicable
- Proper error status codes (401 for unauthorized)

---

## 💡 Notes

1. **User Name Field:** CRITICAL - Frontend displays user names in all tables. Every response must include `user_name`.

2. **Pagination:** Frontend defaults to 10 items per page for history, 8 for redemptions. Ensure your backend supports these.

3. **Timestamps:** Must be ISO 8601 format (e.g., "2025-01-15T10:30:00Z"). Frontend formats them client-side.

4. **Security:** Non-admin users should NEVER have access to admin endpoints. Return 401 Unauthorized.

5. **Performance:** With potentially large datasets, ensure:
   - Proper database indexes on user_id, created_at, type, status
   - Efficient pagination queries (LIMIT/OFFSET)
   - Consider query optimization

---

## 📋 Deliverables

When complete:
1. ✅ Login endpoint returns role field
2. ✅ 4 API endpoints implemented and tested
3. ✅ Admin middleware working
4. ✅ All tests passing
5. ✅ Ready for frontend integration

---

## ❓ Questions?

Refer to the frontend documentation:
- **BACKEND_ADMIN_API_REQUIREMENTS.md** - Detailed backend requirements
- **POINT_SYSTEM_ADMIN_DASHBOARD_COMPLETE.md** - Full system specification
- **ADMIN_DASHBOARD_QUICK_START.md** - Quick reference

---

**Backend Implementation Guide**  
**Admin Point Dashboard System**  
**January 2025**

Next: Implement these endpoints and deploy alongside frontend components.
