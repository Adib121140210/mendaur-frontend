# 🚀 BACKEND IMPLEMENTATION PROMPT FOR AGENT

## Project Overview

**Project Name:** Mendaur-TA (Waste Management & Point System)  
**Frontend Stack:** React 19.1.1, React Router v7.8.2, Vite  
**Backend Framework:** (Your choice - Laravel, Node.js, Python, etc.)  
**Database:** (Your choice - MySQL, PostgreSQL, etc.)  
**API Protocol:** RESTful JSON  
**Base URL:** `http://127.0.0.1:8000`

---

## 🎯 IMMEDIATE PRIORITY

Your task is to implement the following **NEW ADMIN DASHBOARD API ENDPOINTS** that the frontend is currently waiting for.

### Critical: 6 Required API Endpoints

1. ✅ **GET** `/api/admin/dashboard/overview` - KPI Statistics
2. ✅ **GET** `/api/admin/dashboard/users` - User Management (with search/pagination)
3. ✅ **GET** `/api/admin/dashboard/waste` - Waste Analytics by Period
4. ✅ **GET** `/api/admin/dashboard/points` - Points Distribution Breakdown
5. ✅ **GET** `/api/admin/dashboard/waste-by-user` - User Waste Contributions
6. ✅ **GET** `/api/admin/dashboard/reports` - Report Generation

---

## 📋 ENDPOINT SPECIFICATIONS

### 1. GET `/api/admin/dashboard/overview`
**Purpose:** Return system-wide KPI statistics  
**Auth:** Required (Bearer token)  
**Role:** admin, superadmin only

**Request:**
```http
GET /api/admin/dashboard/overview HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 250,
      "active_30days": 180,
      "new_this_month": 15
    },
    "waste": {
      "yearly_total_kg": 5420,
      "yearly_total_count": 1230,
      "monthly_total_kg": 450,
      "monthly_total_count": 98,
      "daily_average_kg": 14.8
    },
    "points": {
      "yearly_total": 125000,
      "yearly_distributed": 95000,
      "monthly_total": 12500,
      "monthly_distributed": 9500,
      "average_per_user": 500
    },
    "redemptions": {
      "yearly_total_points_redeemed": 45000,
      "monthly_total_points_redeemed": 5000,
      "total_redemptions": 320
    }
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

**Implementation Notes:**
- All calculations must be accurate
- Use database aggregation functions (SUM, COUNT, AVG)
- Cache results for 5 minutes to reduce database load
- Return 0 if no data available

---

### 2. GET `/api/admin/dashboard/users`
**Purpose:** List all users with search and pagination  
**Auth:** Required (Bearer token)  
**Role:** admin, superadmin only

**Query Parameters:**
```
page: integer (default: 1)
per_page: integer (default: 10, max: 100)
search: string (optional - search by nama, email, no_hp)
```

**Request:**
```http
GET /api/admin/dashboard/users?page=1&per_page=10&search=john HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "nama": "John Doe",
        "email": "john@example.com",
        "no_hp": "081234567890",
        "total_poin": 1500,
        "level": "Gold",
        "total_setor_sampah": 45,
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "nama": "Jane Smith",
        "email": "jane@example.com",
        "no_hp": "081298765432",
        "total_poin": 2300,
        "level": "Platinum",
        "total_setor_sampah": 78,
        "created_at": "2024-02-20T14:45:00Z"
      }
    ],
    "pagination": {
      "total": 245,
      "page": 1,
      "per_page": 10,
      "total_pages": 25
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Implementation Notes:**
- Search across: `nama`, `email`, `no_hp` fields (case-insensitive)
- Order by `created_at DESC` (newest first)
- Validate page >= 1 and per_page <= 100
- Include pagination metadata
- Database fields: id, nama, email, no_hp, total_poin, level, total_setor_sampah, created_at

---

### 3. GET `/api/admin/dashboard/waste`
**Purpose:** Get waste analytics by period  
**Auth:** Required (Bearer token)  
**Role:** admin, superadmin only

**Query Parameters:**
```
period: string (required - 'daily' | 'monthly' | 'yearly')
month: integer (required if period=monthly - 1-12)
year: integer (required - current year or past years)
waste_type: string (optional - filter by waste_type_id)
```

**Request:**
```http
GET /api/admin/dashboard/waste?period=monthly&month=1&year=2025 HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "year": 2025,
    "month": 1,
    "summary": {
      "total_kg": 1250,
      "total_transactions": 280,
      "average_per_transaction": 4.46
    },
    "breakdown": [
      {
        "waste_type": "Plastic",
        "weight_kg": 450,
        "transactions": 95,
        "percentage": 36
      },
      {
        "waste_type": "Paper",
        "weight_kg": 380,
        "transactions": 78,
        "percentage": 30
      },
      {
        "waste_type": "Organic",
        "weight_kg": 280,
        "transactions": 68,
        "percentage": 22
      },
      {
        "waste_type": "Metal",
        "weight_kg": 140,
        "transactions": 39,
        "percentage": 12
      }
    ],
    "daily_data": [
      {
        "date": "2025-01-01",
        "total_kg": 45,
        "transactions": 9
      },
      {
        "date": "2025-01-02",
        "total_kg": 52,
        "transactions": 11
      }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid period parameter"
}
```

**Implementation Notes:**
- Support: daily (returns 30 days), monthly (returns 12 months if year only), yearly (returns last 10 years)
- Calculate percentages accurately
- Return empty arrays if no data
- Group by waste_type for breakdown
- Database tables needed: setor_sampah, waste_type

---

### 4. GET `/api/admin/dashboard/points`
**Purpose:** Get points distribution breakdown  
**Auth:** Required (Bearer token)  
**Role:** admin, superadmin only

**Query Parameters:**
```
period: string (optional - 'monthly' | 'yearly', default: 'yearly')
year: integer (optional - default: current year)
```

**Request:**
```http
GET /api/admin/dashboard/points?period=yearly&year=2025 HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "yearly",
    "year": 2025,
    "summary": {
      "total_distributed": 125000,
      "total_redeemed": 45000,
      "current_in_system": 80000,
      "active_users": 180
    },
    "by_source": [
      {
        "source": "Setor Sampah",
        "points_distributed": 85000,
        "percentage": 68,
        "transactions": 1200
      },
      {
        "source": "Referral Bonus",
        "points_distributed": 25000,
        "percentage": 20,
        "transactions": 250
      },
      {
        "source": "Promotion",
        "points_distributed": 15000,
        "percentage": 12,
        "transactions": 50
      }
    ],
    "by_type": [
      {
        "type": "Distribution",
        "amount": 125000
      },
      {
        "type": "Redemption",
        "amount": 45000
      },
      {
        "type": "Expiry",
        "amount": 5000
      }
    ],
    "monthly_trend": [
      {
        "month": "January",
        "distributed": 10500,
        "redeemed": 3800,
        "net": 6700
      },
      {
        "month": "February",
        "distributed": 11200,
        "redeemed": 4200,
        "net": 7000
      }
    ]
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Implementation Notes:**
- Calculate net = distributed - redeemed
- Ensure percentages sum to 100%
- Include all 12 months in monthly_trend
- Database tables: poin_history, redemptions, poin_master

---

### 5. GET `/api/admin/dashboard/waste-by-user`
**Purpose:** User-level waste contribution tracking  
**Auth:** Required (Bearer token)  
**Role:** admin, superadmin only

**Query Parameters:**
```
page: integer (default: 1)
per_page: integer (default: 10, max: 100)
sort_by: string (default: 'total_weight' - 'total_weight' | 'transaction_count' | 'name')
order: string (default: 'DESC' - 'ASC' | 'DESC')
```

**Request:**
```http
GET /api/admin/dashboard/waste-by-user?page=1&per_page=10&sort_by=total_weight&order=DESC HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": 5,
        "nama": "John Doe",
        "email": "john@example.com",
        "total_weight_kg": 580,
        "transaction_count": 145,
        "average_weight": 4,
        "last_deposit": "2025-01-15T10:30:00Z",
        "points_earned": 8700
      },
      {
        "user_id": 8,
        "nama": "Jane Smith",
        "email": "jane@example.com",
        "total_weight_kg": 520,
        "transaction_count": 128,
        "average_weight": 4.1,
        "last_deposit": "2025-01-14T14:20:00Z",
        "points_earned": 7800
      }
    ],
    "pagination": {
      "total": 240,
      "page": 1,
      "per_page": 10,
      "total_pages": 24
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Implementation Notes:**
- Join users with setor_sampah transactions
- Calculate totals via SUM and COUNT aggregation
- Average = total_weight / transaction_count
- Sort options: total_weight, transaction_count, name
- Include points_earned calculation
- Database tables: users, setor_sampah, poin_history

---

### 6. GET `/api/admin/dashboard/reports`
**Purpose:** Generate and retrieve reports  
**Auth:** Required (Bearer token)  
**Role:** admin, superadmin only

**Query Parameters:**
```
report_type: string (required - 'daily' | 'monthly' | 'yearly')
date: string (required if daily - YYYY-MM-DD)
month: integer (required if monthly - 1-12)
year: integer (required if monthly/yearly)
format: string (optional - 'json' | 'csv', default: 'json')
```

**Request (JSON):**
```http
GET /api/admin/dashboard/reports?report_type=monthly&month=1&year=2025&format=json HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "report_type": "monthly",
    "period": "January 2025",
    "generated_at": "2025-01-31T23:59:59Z",
    "summary": {
      "total_waste_kg": 1250,
      "total_transactions": 280,
      "total_users_active": 95,
      "total_points_distributed": 10500,
      "total_points_redeemed": 3800
    },
    "details": {
      "top_users": [
        {
          "rank": 1,
          "user_id": 5,
          "nama": "John Doe",
          "waste_kg": 95,
          "transactions": 22,
          "points_earned": 1425
        }
      ],
      "waste_breakdown": [
        {
          "waste_type": "Plastic",
          "kg": 450,
          "percentage": 36
        }
      ],
      "daily_average": {
        "waste_kg": 40.3,
        "transactions": 9,
        "active_users": 3
      }
    },
    "file_url": "/downloads/report_january_2025.pdf"
  }
}
```

**Response (200 OK - CSV Format):**
```csv
Report Type,Period,Generated At,Total Waste (kg),Total Transactions
monthly,January 2025,2025-01-31T23:59:59Z,1250,280
...
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid report_type parameter"
}
```

**Implementation Notes:**
- Generate PDF/CSV files for download
- Cache reports for 1 hour
- Include top 10 users in details
- Support historical reports
- Store generated reports in `/storage/reports/`
- Database: setor_sampah, users, poin_history, redemptions

---

## 🔐 Authentication Requirements

### Login Endpoint Enhancement
**Requirement:** The existing `/api/login` endpoint MUST include `role` field

**Current Response (INCOMPLETE):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "nama": "Admin User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Required Response (UPDATED):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "nama": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Role Values:**
- `admin` - Full admin access
- `superadmin` - All access
- `user` - Regular user

---

## 📊 Database Schema Requirements

### Tables You Need

1. **users** (existing - add role if missing)
   - id, nama, email, no_hp, role, total_poin, level, created_at, updated_at

2. **setor_sampah** (existing)
   - id, user_id, waste_type_id, berat_kg, created_at

3. **waste_type** (existing)
   - id, type_name (Plastic, Paper, Organic, Metal)

4. **poin_history** (existing - track all point changes)
   - id, user_id, source (setor_sampah, referral, promotion), amount, created_at

5. **redemptions** (existing - track point redemptions)
   - id, user_id, type, points_used, created_at

---

## ✅ Implementation Checklist

### Phase 1: Authentication (Day 1)
- [ ] Update `/api/login` to include `role` field
- [ ] Ensure `role` is returned for all users
- [ ] Test with admin, superadmin, user accounts

### Phase 2: Overview & Users Endpoints (Day 2)
- [ ] Implement `GET /api/admin/dashboard/overview`
- [ ] Implement `GET /api/admin/dashboard/users`
- [ ] Add search functionality
- [ ] Add pagination
- [ ] Test with admin role

### Phase 3: Analytics Endpoints (Day 3)
- [ ] Implement `GET /api/admin/dashboard/waste`
- [ ] Implement `GET /api/admin/dashboard/points`
- [ ] Implement `GET /api/admin/dashboard/waste-by-user`
- [ ] Test period filters

### Phase 4: Reports & Final Testing (Day 4)
- [ ] Implement `GET /api/admin/dashboard/reports`
- [ ] Add CSV/PDF export
- [ ] Full integration testing
- [ ] Performance optimization

---

## 🧪 Testing Instructions

### Manual Testing
1. Start backend: `php artisan serve` (or your framework's command)
2. Frontend should be at: `http://localhost:5173`
3. Login with admin credentials
4. Navigate to: `http://localhost:5173/admin/dashboard`
5. Verify each tab loads data correctly

### API Testing
```bash
# Test overview
curl -H "Authorization: Bearer {token}" \
  http://127.0.0.1:8000/api/admin/dashboard/overview

# Test users with search
curl -H "Authorization: Bearer {token}" \
  "http://127.0.0.1:8000/api/admin/dashboard/users?page=1&per_page=10&search=john"

# Test waste analytics
curl -H "Authorization: Bearer {token}" \
  "http://127.0.0.1:8000/api/admin/dashboard/waste?period=monthly&month=1&year=2025"
```

---

## 🚨 Common Issues & Solutions

### 401 Unauthorized
- Verify token is valid and not expired
- Check middleware allows admin/superadmin role
- Verify role field is included in login response

### Empty Data
- Check database has records for the period
- Verify joins are working correctly
- Check date filtering logic

### Slow Queries
- Add indexes on frequently queried fields
- Cache results for 5 minutes
- Use database aggregation functions

### CORS Errors
- Verify CORS headers are set
- Frontend URL is whitelisted
- Content-Type is application/json

---

## 📞 Frontend Contact Points

**Frontend Developer:** Will test endpoints at:
- `http://localhost:5173/admin/dashboard`

**Expected Response Time:** All endpoints should respond in < 2 seconds

**Data Format:** All responses must be valid JSON with `success` and `data` fields

---

## 🎬 Ready to Start?

1. Copy this prompt to your Backend Agent
2. Make sure your backend is configured for these endpoints
3. Start implementing from Phase 1
4. Test each endpoint as you go
5. Frontend will automatically consume the APIs

**Good luck! 🚀**
