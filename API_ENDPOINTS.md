# 🔌 API Endpoints Documentation

**Base URL:** `http://127.0.0.1:8000/api`  
**Last Updated:** December 9, 2025  
**API Version:** 1.0

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Dashboard & Statistics](#dashboard--statistics)
4. [Points System](#points-system)
5. [Waste Bin (Tabung Sampah)](#waste-bin-tabung-sampah)
6. [Badges & Rewards](#badges--rewards)
7. [Activity Log](#activity-log)
8. [Articles](#articles)
9. [Security & Authentication](#security--authentication)
10. [Error Handling](#error-handling)
11. [Usage Examples](#usage-examples)

---

## 🔐 Authentication

### **POST** `/api/login`
User login and get authentication token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "nama": "Adib Surya",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "YOUR_AUTH_TOKEN_HERE"
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

---

### **POST** `/api/register`
User registration

**Request:**
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "no_hp": "081234567890",
  "alamat": "Jl. Example No. 123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 2,
      "nama": "John Doe",
      "email": "john@example.com"
    },
    "token": "AUTH_TOKEN"
  }
}
```

---

### **POST** `/api/logout`
User logout (requires authentication)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "message": "Logout berhasil"
}
```

---

## 👤 User Profile

### **GET** `/api/users/{id}`
Get user profile by ID

**Headers:**
```
Authorization: Bearer {token}
```

**Example:** `GET /api/users/1`

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "nama": "Adib Surya",
    "email": "adib@example.com",
    "no_hp": "081234567890",
    "alamat": "Jl. Gatot Subroto No. 123",
    "foto_profil": null,
    "total_poin": 250,
    "total_setor_sampah": 5,
    "level": "Silver",
    "created_at": "2025-11-15T08:55:45Z",
    "updated_at": "2025-12-09T10:30:00Z"
  }
}
```

**Security:** ⚠️ **IDOR Protected**
- Requires valid Bearer token
- User can only access their own profile (id must match authenticated user)
- Returns 403 Forbidden if accessing another user's profile

---

### **PUT** `/api/users/{id}`
Update user profile

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "nama": "Updated Name",
  "no_hp": "082345678901",
  "alamat": "Updated Address"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Profil berhasil diperbarui",
  "data": {
    "id": 1,
    "nama": "Updated Name",
    "no_hp": "082345678901",
    "alamat": "Updated Address"
  }
}
```

**Security:** ⚠️ **IDOR Protected**
- Requires valid Bearer token
- User can only update their own profile

---

### **POST** `/api/users/{id}/photo`
Upload user profile photo

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:** (multipart/form-data)
```
foto_profil: [file] (jpeg, jpg, png, gif, max 2MB)
```

**Response:**
```json
{
  "status": "success",
  "message": "Foto profil berhasil diperbarui",
  "data": {
    "foto_profil": "uploads/profiles/12345.jpg",
    "foto_url": "http://127.0.0.1:8000/storage/uploads/profiles/12345.jpg"
  }
}
```

**Security:** ⚠️ **IDOR Protected**
- Requires valid Bearer token
- File size limit: 2MB
- Allowed formats: jpeg, jpg, png, gif

---

## 📊 Dashboard & Statistics

### **GET** `/api/dashboard/user-stats/{userId}`
Get user dashboard statistics

**Headers:**
```
Authorization: Bearer {token}
```

**Example:** `GET /api/dashboard/user-stats/1`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "nama": "Adib Surya",
      "level": "Silver"
    },
    "statistics": {
      "total_poin": 250,
      "total_setor_sampah": 5,
      "total_weight_kg": 25.5,
      "badge_count": 3,
      "rank": 2,
      "monthly_poin": 100,
      "monthly_setor": 2
    },
    "progress": {
      "next_level": "Gold",
      "progress_percentage": 65.5,
      "poin_needed": 150
    }
  }
}
```

**Security:** ⚠️ **IDOR Protected**
- Requires valid Bearer token
- User can only access their own statistics

---

## 💰 Points System

### **GET** `/api/points/user/{id}`
Get user's current points

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user_id": 1,
    "total_poin": 250,
    "available_poin": 250,
    "redeemed_poin": 0,
    "pending_poin": 0
  }
}
```

**Security:** ⚠️ **IDOR Protected**

---

### **GET** `/api/points/redeem-history/{id}`
Get user's point redemption history

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` - Number of records (default: 20)
- `offset` - Pagination offset (default: 0)

**Example:** `GET /api/points/redeem-history/1?limit=10`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "tipe_transaksi": "tukar_poin",
      "deskripsi": "Tukar 100 poin dengan Voucher Grab",
      "poin_amount": 100,
      "status": "completed",
      "tanggal": "2025-12-08T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "count": 1,
    "per_page": 10,
    "current_page": 1,
    "total_pages": 1
  }
}
```

**Security:** ⚠️ **IDOR Protected**

---

### **GET** `/api/points/statistics/{id}`
Get detailed points statistics

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_earned": 350,
    "total_redeemed": 100,
    "current_balance": 250,
    "monthly_earned": 100,
    "average_per_deposit": 50,
    "highest_single_amount": 100
  }
}
```

**Security:** ⚠️ **IDOR Protected**

---

### **GET** `/api/points/breakdown/{userId}`
Get points breakdown by source

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "from_waste_deposit": 200,
    "from_badges": 50,
    "from_bonuses": 0,
    "redeemed": 0,
    "total": 250
  }
}
```

**Security:** ⚠️ **IDOR Protected**

---

## ♻️ Waste Bin (Tabung Sampah)

### **GET** `/api/tabung-sampah/user/{id}`
Get user's waste deposit history

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` - Filter by status (pending, approved, rejected)
- `limit` - Number of records (default: 20)

**Example:** `GET /api/tabung-sampah/user/1?status=approved&limit=10`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "jadwal_id": 1,
      "nama_lengkap": "Adib Surya",
      "no_hp": "081234567890",
      "titik_lokasi": "Rumah",
      "jenis_sampah": "Plastik",
      "foto_sampah": "uploads/sampah/12345.jpg",
      "berat_kg": 5.5,
      "poin_didapat": 15,
      "status": "approved",
      "catatan_admin": null,
      "created_at": "2025-12-01T10:30:00Z",
      "approved_at": "2025-12-01T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "count": 1,
    "per_page": 10,
    "current_page": 1
  }
}
```

**Security:** ⚠️ **IDOR Protected**
- User can only view their own waste deposits
- Returns 403 Forbidden if accessing another user's deposits

---

### **POST** `/api/tabung-sampah`
Create new waste deposit

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:** (multipart/form-data)
```
user_id: 1
jadwal_id: 1
nama_lengkap: "Adib Surya"
no_hp: "081234567890"
titik_lokasi: "Rumah"
jenis_sampah: "Plastik"
foto_sampah: [file]
```

**Response:**
```json
{
  "status": "success",
  "message": "Setor sampah berhasil! Menunggu persetujuan admin.",
  "data": {
    "id": 1,
    "user_id": 1,
    "status": "pending",
    "created_at": "2025-12-09T10:30:00Z"
  }
}
```

---

### **GET** `/api/tabung-sampah/{id}/history`
Get specific waste deposit details

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "nama_lengkap": "Adib Surya",
    "jenis_sampah": "Plastik",
    "berat_kg": 5.5,
    "poin_didapat": 15,
    "status": "approved",
    "foto_sampah": "uploads/sampah/12345.jpg",
    "foto_url": "http://127.0.0.1:8000/storage/uploads/sampah/12345.jpg",
    "catatan_admin": "Kondisi sampah baik, diterima",
    "created_at": "2025-12-01T10:30:00Z",
    "approved_at": "2025-12-01T14:00:00Z"
  }
}
```

**Security:** ⚠️ **IDOR Protected**

---

## 🏆 Badges & Rewards

### **GET** `/api/users/{id}/badges`
Get user's unlocked badges

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nama": "Pemula Peduli",
      "deskripsi": "Setor sampah pertama kali",
      "icon": "🌱",
      "reward_poin": 50,
      "tanggal_dapat": "2025-11-05T08:30:00Z"
    },
    {
      "id": 2,
      "nama": "Eco Warrior",
      "deskripsi": "Setor sampah 5 kali",
      "icon": "♻️",
      "reward_poin": 100,
      "tanggal_dapat": "2025-12-01T10:30:00Z"
    }
  ]
}
```

**Security:** ⚠️ **IDOR Protected**

---

### **GET** `/api/badges`
Get all available badges (public)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nama": "Pemula Peduli",
      "deskripsi": "Setor sampah pertama kali",
      "icon": "🌱",
      "syarat_setor": 1,
      "reward_poin": 50,
      "tipe": "setor"
    },
    {
      "id": 2,
      "nama": "Eco Warrior",
      "deskripsi": "Setor sampah 5 kali",
      "icon": "♻️",
      "syarat_setor": 5,
      "reward_poin": 100,
      "tipe": "setor"
    }
  ]
}
```

**Security:** 🔓 Public (no authentication required)

---

## 📝 Activity Log

### **GET** `/api/users/{id}/aktivitas`
Get user's activity log

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` - Number of activities (default: 20, max: 100)
- `offset` - Pagination offset

**Example:** `GET /api/users/1/aktivitas?limit=10`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "tipe_aktivitas": "setor_sampah",
      "deskripsi": "Menyetor 5kg sampah plastik",
      "poin_perubahan": 15,
      "tanggal": "2025-12-08T10:30:00Z"
    },
    {
      "id": 2,
      "tipe_aktivitas": "badge_unlock",
      "deskripsi": "Mendapatkan badge 'Pemula Peduli' dan bonus 50 poin",
      "poin_perubahan": 50,
      "tanggal": "2025-12-08T10:35:00Z"
    },
    {
      "id": 3,
      "tipe_aktivitas": "tukar_poin",
      "deskripsi": "Menukar 100 poin dengan Voucher Grab",
      "poin_perubahan": -100,
      "tanggal": "2025-12-07T15:20:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "count": 3,
    "per_page": 10,
    "current_page": 1
  }
}
```

**Activity Types:**
- `setor_sampah` - Waste deposit (positive points)
- `badge_unlock` - Badge earned (positive points)
- `tukar_poin` - Point redemption (negative points)
- `poin_bonus` - Bonus points
- `level_up` - Level progression

**Security:** ⚠️ **IDOR Protected**

---

## 📰 Articles

### **GET** `/api/articles`
Get all articles

**Query Parameters:**
- `limit` - Number of articles (default: 10)
- `page` - Page number (default: 1)
- `search` - Search by title or content

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "judul": "Tips Memilah Sampah dengan Benar",
      "slug": "tips-memilah-sampah",
      "konten": "Sampah perlu dipisahkan menjadi beberapa kategori...",
      "gambar": "uploads/articles/tips.jpg",
      "gambar_url": "http://127.0.0.1:8000/storage/uploads/articles/tips.jpg",
      "created_at": "2025-11-10T08:00:00Z",
      "updated_at": "2025-11-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "count": 1,
    "per_page": 10,
    "current_page": 1
  }
}
```

**Security:** 🔓 Public (no authentication required)

---

### **GET** `/api/articles/{id}`
Get specific article by ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "judul": "Tips Memilah Sampah dengan Benar",
    "slug": "tips-memilah-sampah",
    "konten": "Sampah perlu dipisahkan menjadi beberapa kategori...",
    "gambar": "uploads/articles/tips.jpg",
    "gambar_url": "http://127.0.0.1:8000/storage/uploads/articles/tips.jpg",
    "created_at": "2025-11-10T08:00:00Z"
  }
}
```

**Security:** 🔓 Public

---

## 🔒 Security & Authentication

### Required Headers for Protected Endpoints

All endpoints marked with ⚠️ **IDOR Protected** require:

```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Authentication Token

1. **Obtain Token:**
   - Login via `POST /api/login`
   - Token returned in response: `data.token`

2. **Store Token:**
   ```javascript
   localStorage.setItem('token', response.data.token);
   ```

3. **Use Token in Requests:**
   ```javascript
   fetch('http://127.0.0.1:8000/api/users/1', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`,
       'Content-Type': 'application/json'
     }
   });
   ```

### IDOR Protection

All endpoints with user IDs in the path are protected against Insecure Direct Object Reference (IDOR):

- **Valid Request:** User 1 accessing `/api/users/1` ✅
- **Invalid Request:** User 1 accessing `/api/users/2` ❌ Returns 403 Forbidden

---

## ❌ Error Handling

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Data returned successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | IDOR - user accessing other user's data |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Invalid input data |
| 500 | Server Error | Internal server error |

### Example Error Response (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Unauthenticated"
}
```

### Example Error Response (403 Forbidden - IDOR)

```json
{
  "status": "error",
  "message": "Forbidden: Cannot access other user's data"
}
```

### Example Error Response (422 Validation Error)

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## 💻 Usage Examples

### JavaScript/React Example

```javascript
// Get authentication token
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 1. Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.status === 'success') {
    localStorage.setItem('token', data.data.token);
  }
  return data;
};

// 2. Get user profile
const getUserProfile = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// 3. Get user points
const getUserPoints = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/points/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// 4. Get waste deposits
const getWasteDeposits = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_BASE_URL}/tabung-sampah/user/${userId}?status=approved`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.json();
};

// 5. Get user badges
const getUserBadges = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users/${userId}/badges`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// 6. Submit waste deposit (with file upload)
const submitWasteDeposit = async (formData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/tabung-sampah`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for multipart/form-data
    },
    body: formData // FormData object with file
  });
  return response.json();
};

// 7. Get activity log
const getActivityLog = async (userId, limit = 20) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/aktivitas?limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.json();
};

// 8. Get all articles (public)
const getAllArticles = async () => {
  const response = await fetch(`${API_BASE_URL}/articles`);
  return response.json();
};
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';

const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://127.0.0.1:8000/api/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 403) {
          throw new Error('Cannot access this profile');
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        setProfile(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
};
```

### cURL Examples

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get user profile
curl -X GET http://127.0.0.1:8000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user points
curl -X GET http://127.0.0.1:8000/api/points/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get waste deposits
curl -X GET "http://127.0.0.1:8000/api/tabung-sampah/user/1?status=approved" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get articles (public)
curl -X GET http://127.0.0.1:8000/api/articles
```

---

## 📞 Quick Reference

| Feature | Endpoint | Method | Auth | Public |
|---------|----------|--------|------|--------|
| Login | `/login` | POST | ❌ | ✅ |
| Register | `/register` | POST | ❌ | ✅ |
| Get Profile | `/users/{id}` | GET | ✅ | ❌ |
| Get Points | `/points/user/{id}` | GET | ✅ | ❌ |
| Get Deposits | `/tabung-sampah/user/{id}` | GET | ✅ | ❌ |
| Get Badges | `/users/{id}/badges` | GET | ✅ | ❌ |
| Get All Badges | `/badges` | GET | ❌ | ✅ |
| Get Activity | `/users/{id}/aktivitas` | GET | ✅ | ❌ |
| Get Articles | `/articles` | GET | ❌ | ✅ |

---

## ✅ API Status

**Backend:** ✅ Running on http://127.0.0.1:8000  
**Frontend:** ✅ Running on http://localhost:5173  
**Last Tested:** December 9, 2025

---

## 🔗 Related Documentation

- 📋 [FRONTEND_PROGRESS_CHECKLIST.md](FRONTEND_PROGRESS_CHECKLIST.md) - Implementation status
- 🏗️ [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) - System design
- 📖 [README.md](README.md) - Main documentation

---

**API Documentation Version:** 1.0  
**Updated:** December 9, 2025
