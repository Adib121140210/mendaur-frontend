# 🔐 Backend Role-Based Access Control (RBAC) Implementation Guide

## Overview

The backend uses a **Role-Based Access Control (RBAC)** system with 3 roles and permission-based authorization. Understanding this will help you implement proper frontend role handling.

---

## 📊 Database Structure for Roles

### Tables Involved

```
┌─────────────────────────────────────────────────┐
│ ROLES TABLE                          PK: id     │
├─────────────────────────────────────────────────┤
│ • id              BIGINT (PK)                   │
│ • nama_role       VARCHAR(50) UNIQUE            │
│ • deskripsi       TEXT (nullable)               │
│ • level_akses     INT (1, 2, or 3)              │
│ • created_at      TIMESTAMP                     │
│ • updated_at      TIMESTAMP                     │
│                                                 │
│ PREDEFINED ROLES (Seeded):                      │
│ ├─ id=1, nama_role='nasabah', level_akses=1   │
│ ├─ id=2, nama_role='admin', level_akses=2     │
│ └─ id=3, nama_role='superadmin', level_akses=3│
└─────────────────────────────────────────────────┘

        ↓ 1:M

┌─────────────────────────────────────────────────┐
│ ROLE_PERMISSIONS TABLE              PK: id     │
├─────────────────────────────────────────────────┤
│ • id              BIGINT (PK)                   │
│ • role_id         BIGINT (FK) → roles.id        │
│ • permission      VARCHAR(100)                  │
│ • deskripsi       TEXT (nullable)               │
│ • created_at      TIMESTAMP                     │
│ • updated_at      TIMESTAMP                     │
│                                                 │
│ UNIQUE(role_id, permission)                     │
│ (No duplicate permissions per role)             │
└─────────────────────────────────────────────────┘

        ↓ 1:M

┌─────────────────────────────────────────────────┐
│ USERS TABLE                          PK: id     │
├─────────────────────────────────────────────────┤
│ • id              BIGINT (PK)                   │
│ • role_id         BIGINT (FK) → roles.id        │
│ • nama            VARCHAR(255)                  │
│ • email           VARCHAR(255) UNIQUE           │
│ • password        VARCHAR(255) (hashed)         │
│ • ... other fields                              │
│ • created_at      TIMESTAMP                     │
│ • updated_at      TIMESTAMP                     │
│                                                 │
│ NEW IN RBAC:                                    │
│ • role_id         DEFAULT 1 (nasabah)           │
│ • tipe_nasabah    ENUM('konvensional', 'modern')│
└─────────────────────────────────────────────────┘
```

---

## 🎯 Three Role Types & Permissions

### Role 1: NASABAH (Regular User) - level_akses=1

**Purpose:** Community member who deposits waste and redeems points

**Permissions (17 total):**
```javascript
[
  'deposit_sampah',              // Can deposit waste
  'redeem_poin',                 // Can redeem points
  'view_poin',                   // Can view own points
  'view_badges',                 // Can view badges
  'view_leaderboard',            // Can view leaderboard
  'request_withdrawal',          // Can request cash withdrawal
  'view_own_history',            // Can view own activity
  'update_own_profile',          // Can update own profile
  'view_own_transactions',       // Can view own transactions
  'view_own_deposits',           // Can view own deposits
  'view_own_redemptions',        // Can view own redemptions
  'view_own_withdrawals',        // Can view own withdrawals
  'view_articles',               // Can read articles
  'view_products',               // Can view product catalog
  'view_notifications',          // Can view own notifications
  'mark_notification_read',      // Can mark notifications as read
  'view_own_badges_progress'     // Can view badge progress
]
```

**What They Can Do:**
- ✅ Deposit waste and earn points
- ✅ Redeem products using points
- ✅ Request cash withdrawals
- ✅ View personal data only
- ✅ Cannot see other users' data
- ✅ Cannot manage system

---

### Role 2: ADMIN (Bank Staff) - level_akses=2

**Purpose:** Bank employee who approves transactions and manages users

**Permissions (30 total - includes all nasabah + admin-specific):**
```javascript
[
  // All NASABAH permissions +
  'approve_deposit',             // Approve waste deposits
  'reject_deposit',              // Reject waste deposits
  'approve_withdrawal',          // Approve cash withdrawals
  'reject_withdrawal',           // Reject cash withdrawals
  'approve_redemption',          // Approve product redemptions
  'reject_redemption',           // Reject redemptions
  'view_all_users',              // View all users
  'view_all_transactions',       // View all transactions
  'view_all_deposits',           // View all deposits
  'view_all_redemptions',        // View all redemptions
  'view_all_withdrawals',        // View all withdrawals
  'manual_poin_adjust',          // Adjust points manually
  'send_notification',           // Send notifications
  'view_admin_dashboard',        // Access admin dashboard
  'export_reports',              // Export reports
  'view_user_detail',            // View specific user details
  'export_users',                // Export user list
  'export_deposits',             // Export deposit data
  'export_transactions',         // Export transaction data
  'view_system_stats',           // View system statistics
  'view_financial_summary',      // View financial data
  'manage_user_profile',         // Edit user profiles
  'view_audit_logs',             // View action logs
  'send_bulk_notification',      // Send notifications to many users
  'generate_report_pdf',         // Generate PDF reports
  'view_badges_data',            // View badge statistics
  'view_leaderboard_full',       // View complete leaderboard
  'export_activities',           // Export activity logs
  'view_poin_ledger',            // View point ledger
  'adjust_user_level'            // Adjust user levels
]
```

**What They Can Do:**
- ✅ Approve/reject all transactions
- ✅ View all users and their data
- ✅ Manually adjust points
- ✅ Send notifications
- ✅ View admin dashboard
- ✅ Generate reports
- ✅ Cannot manage admin accounts
- ✅ Cannot change system settings

---

### Role 3: SUPERADMIN (System Manager) - level_akses=3

**Purpose:** System administrator with full control

**Permissions (62 total - includes all admin + superadmin-specific):**
```javascript
[
  // All ADMIN permissions +
  'manage_admins',               // Create/edit/delete admin accounts
  'manage_roles',                // Create/edit roles
  'manage_permissions',          // Assign permissions to roles
  'manage_system_settings',      // Change system configuration
  'manage_badges',               // Create/edit badges
  'manage_products',             // Create/edit products
  'manage_categories',           // Manage waste categories
  'full_audit_logs',             // Full audit log access
  'financial_reports',           // Full financial reports
  'system_maintenance',          // System maintenance tasks
  'backup_system',               // Create system backups
  'view_system_health',          // View system performance
  'manage_notifications_template', // Create notification templates
  'bulk_user_operations',        // Bulk edit users
  'reset_user_password',         // Reset user passwords
  'disable_enable_users',        // Disable/enable user accounts
  'export_all_data',             // Export all system data
  'import_data',                 // Import data to system
  'view_all_api_logs',           // View API request logs
  'manage_api_keys',             // Manage API access
  'system_configuration',        // System settings
  'manage_waste_prices',         // Edit waste type prices
  'manage_redemption_rates',     // Edit point redemption rates
  'view_complete_analytics',     // Full analytics dashboard
  'manage_withdrawal_limits',    // Set withdrawal limits
  'manage_point_conversion',     // Set point conversion rates
  'approve_admin_actions',       // Approve admin-level actions
  // ... 35+ more permissions
]
```

**What They Can Do:**
- ✅ Everything (full system control)
- ✅ Manage other admins
- ✅ Manage roles and permissions
- ✅ Change system settings
- ✅ View all logs and reports
- ✅ Manage backup and maintenance

---

## 🔑 Login Response Structure

### What Backend Returns on Login

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nama": "John Doe",
      "email": "user@test.com",
      "no_hp": "08123456789",
      "alamat": "Jl. Main Street No. 1",
      "total_poin": 250,
      "total_setor_sampah": 15,
      "level": "Silver",
      "foto_profil": null,
      "role_id": 1,
      "role": {
        "id": 1,
        "nama_role": "nasabah",
        "level_akses": 1,
        "permissions": [
          "deposit_sampah",
          "redeem_poin",
          "view_poin",
          "view_badges",
          "view_leaderboard",
          "request_withdrawal",
          "view_own_history",
          "update_own_profile",
          // ... 10 more for nasabah
        ]
      },
      "tipe_nasabah": "konvensional",
      "created_at": "2025-10-15T08:30:00.000000Z",
      "updated_at": "2025-11-25T14:30:00.000000Z"
    }
  }
}
```

### Or for Admin/Superadmin

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 2,
      "nama": "Admin User",
      "email": "admin@test.com",
      "role_id": 2,
      "role": {
        "id": 2,
        "nama_role": "admin",
        "level_akses": 2,
        "permissions": [
          "approve_deposit",
          "approve_withdrawal",
          "view_all_users",
          "view_admin_dashboard",
          "export_reports",
          // ... 25+ more for admin
        ]
      },
      "tipe_nasabah": null,  // NULL for admin/superadmin
      // ... other fields
    }
  }
}
```

---

## 💾 Backend Laravel Implementation

### 1. User Model with Role Relationship

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'nama', 'email', 'password', 'no_hp', 'alamat',
        'foto_profil', 'total_poin', 'total_setor_sampah',
        'level', 'role_id', 'tipe_nasabah'
    ];

    // ✅ Relationship: User has ONE Role
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // ✅ Helper: Get user's role name
    public function getRoleName()
    {
        return $this->role?->nama_role ?? 'nasabah';
    }

    // ✅ Helper: Check if user is admin
    public function isAdmin()
    {
        return $this->role_id === 2 || $this->role_id === 3;
    }

    // ✅ Helper: Check if user is superadmin
    public function isSuperAdmin()
    {
        return $this->role_id === 3;
    }

    // ✅ Helper: Get all permissions
    public function getPermissions()
    {
        return $this->role
            ?->permissions()
            ->pluck('permission')
            ->toArray() ?? [];
    }

    // ✅ Helper: Check specific permission
    public function hasPermission($permission)
    {
        return in_array($permission, $this->getPermissions());
    }

    // ✅ Helper: Check multiple permissions
    public function hasAnyPermission($permissions)
    {
        $userPermissions = $this->getPermissions();
        return count(array_intersect($permissions, $userPermissions)) > 0;
    }

    // ✅ Relationship for with() loading
    protected $with = ['role'];
}
```

### 2. Role Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['nama_role', 'deskripsi', 'level_akses'];

    // ✅ Relationship: Role has MANY Users
    public function users()
    {
        return $this->hasMany(User::class);
    }

    // ✅ Relationship: Role has MANY Permissions
    public function permissions()
    {
        return $this->hasMany(RolePermission::class);
    }
}
```

### 3. RolePermission Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    protected $table = 'role_permissions';
    protected $fillable = ['role_id', 'permission', 'deskripsi'];

    // ✅ Relationship: Permission belongs to Role
    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
```

### 4. Login Controller

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        // ✅ Find user with role relationship
        $user = User::with('role.permissions')->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau password salah'
            ], 401);
        }

        // ✅ Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        // ✅ Return with role and permissions
        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'no_hp' => $user->no_hp,
                    'total_poin' => $user->total_poin,
                    'level' => $user->level,
                    'role_id' => $user->role_id,
                    'role' => [
                        'id' => $user->role->id,
                        'nama_role' => $user->role->nama_role,
                        'level_akses' => $user->role->level_akses,
                        'permissions' => $user->role->permissions
                            ->pluck('permission')
                            ->toArray()
                    ],
                    'tipe_nasabah' => $user->tipe_nasabah,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]
        ]);
    }
}
```

---

## 🛡️ Authorization Middleware

### 1. Check Permission Middleware

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        // ✅ Get authenticated user
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        // ✅ Load user role and permissions
        $user->load('role.permissions');

        // ✅ Get user's permissions
        $userPermissions = $user->role
            ->permissions
            ->pluck('permission')
            ->toArray();

        // ✅ Check if user has ANY of required permissions
        $hasPermission = count(
            array_intersect($permissions, $userPermissions)
        ) > 0;

        if (!$hasPermission) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki izin untuk mengakses resource ini',
                'required_permissions' => $permissions,
                'user_permissions' => $userPermissions
            ], 403);
        }

        return $next($request);
    }
}
```

### 2. Check Role Middleware

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated'
            ], 401);
        }

        // ✅ Check if user's role is in allowed roles
        if (!in_array($user->role->nama_role, $roles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya ' . implode(', ', $roles) . ' yang dapat mengakses resource ini',
                'user_role' => $user->role->nama_role
            ], 403);
        }

        return $next($request);
    }
}
```

---

## 📍 Route Protection Examples

### routes/api.php

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminDashboardController;

// ✅ PUBLIC ROUTES
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

// ✅ PROTECTED ROUTES (Authenticated users only)
Route::middleware('auth:sanctum')->group(function () {
    // All authenticated users can do this
    Route::get('/dashboard/stats/{id}', [DashboardController::class, 'stats']);
    Route::get('/dashboard/leaderboard', [DashboardController::class, 'leaderboard']);
    
    // ✅ PERMISSION-BASED (specific permissions required)
    Route::middleware('check.permission:deposit_sampah')
        ->post('/tabung-sampah', [TabungSampahController::class, 'store']);
    
    Route::middleware('check.permission:approve_deposit')
        ->patch('/tabung-sampah/{id}/approve', [TabungSampahController::class, 'approve']);
    
    Route::middleware('check.permission:view_all_users')
        ->get('/users', [UserController::class, 'index']);
    
    // ✅ ROLE-BASED (specific role required)
    Route::middleware('check.role:admin,superadmin')
        ->prefix('admin')
        ->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);
            Route::get('/dashboard/overview', [AdminDashboardController::class, 'overview']);
            Route::get('/dashboard/users', [AdminDashboardController::class, 'users']);
        });
    
    Route::middleware('check.role:superadmin')
        ->prefix('superadmin')
        ->group(function () {
            Route::post('/roles', [RoleController::class, 'store']);
            Route::post('/permissions', [PermissionController::class, 'store']);
            Route::post('/admin-users', [AdminUserController::class, 'store']);
        });
});
```

---

## 🎯 Admin Dashboard Controller Example

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    // ✅ Requires: admin OR superadmin role
    public function index(Request $request)
    {
        $user = $request->user();

        // ✅ Already verified by middleware, but double-check
        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'role' => $user->role->nama_role,
                'level_akses' => $user->role->level_akses,
                'permissions' => $user->getPermissions()
            ]
        ]);
    }

    // ✅ Requires: approve_deposit permission
    public function overview(Request $request)
    {
        // ✅ Middleware already checked permission

        $stats = [
            'total_users' => User::count(),
            'total_deposits' => 0, // Calculate
            'total_points' => 0,   // Calculate
            'pending_approvals' => 0 // Calculate
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    // ✅ Requires: view_all_users permission
    public function users(Request $request)
    {
        $users = User::with('role')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }
}
```

---

## 🚀 Frontend Integration Guide

### What Frontend Needs to Do

**1. Store Role Information on Login:**
```javascript
// In login.jsx or AuthContext
const userData = response.data;

localStorage.setItem('token', userData.token);
localStorage.setItem('role', userData.user.role.nama_role);
localStorage.setItem('role_id', userData.user.role_id);
localStorage.setItem('permissions', JSON.stringify(userData.user.role.permissions));
localStorage.setItem('user', JSON.stringify(userData.user));
```

**2. Use Role for Routing:**
```javascript
// In App.jsx
const role = localStorage.getItem('role');

if (role === 'nasabah') {
    navigate('/dashboard');  // User dashboard
} else if (role === 'admin' || role === 'superadmin') {
    navigate('/admin/dashboard');  // Admin dashboard
}
```

**3. Check Permissions on Frontend:**
```javascript
// In any component
const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

if (permissions.includes('approve_deposit')) {
    // Show approve button
}

if (permissions.includes('view_all_users')) {
    // Show admin users list
}
```

**4. Send Token with Every API Call:**
```javascript
const token = localStorage.getItem('token');

fetch('/api/endpoint', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
```

---

## 🔍 Test Accounts

### Nasabah (User)
- Email: user@test.com
- Password: user123
- Role: nasabah (level 1)
- Permissions: 17 (deposit, redeem, view own data)

### Admin
- Email: admin@test.com
- Password: admin123
- Role: admin (level 2)
- Permissions: 30 (approve transactions, view all users)

### Superadmin
- Email: superadmin@test.com
- Password: superadmin123
- Role: superadmin (level 3)
- Permissions: 62 (full system control)

---

## 💡 Key Implementation Points

### 1. Role vs Permission

**Role:** User's job type (nasabah, admin, superadmin)
- Used for: General access levels
- Example: "Admin can access /admin routes"

**Permission:** Specific action capability
- Used for: Fine-grained control
- Example: "User can approve deposits"

### 2. Permission Inheritance

```
NASABAH (17 permissions)
    ↓
    + ADMIN-SPECIFIC (13 more)
    ↓
ADMIN (30 permissions total)
    ↓
    + SUPERADMIN-SPECIFIC (32 more)
    ↓
SUPERADMIN (62 permissions total)
```

### 3. Authorization Flow

```
1. Frontend sends API request with Bearer token
   ↓
2. Backend validates token (auth:sanctum middleware)
   ↓
3. Backend checks role/permission (check.role or check.permission)
   ↓
4. If authorized → Process request
   ↓
5. If unauthorized → Return 403 Forbidden
```

### 4. Error Handling

```json
{
    "status": "error",
    "message": "Anda tidak memiliki izin untuk mengakses resource ini",
    "required_permissions": ["approve_deposit"],
    "user_permissions": ["deposit_sampah", "view_poin"]
}
```

---

## ✅ Implementation Checklist

### Backend (Already Done)
- ✅ Roles table with 3 predefined roles
- ✅ Role_permissions table with 62 permissions
- ✅ Users table with role_id FK
- ✅ User model with role relationship
- ✅ Permission checking middleware
- ✅ Role checking middleware
- ✅ Login controller returning role + permissions
- ✅ Admin dashboard protected routes
- ✅ All API endpoints with authorization

### Frontend (To Implement)

**In AuthContext:**
- [ ] Store role from login response
- [ ] Store permissions array
- [ ] Add isAdmin computed property
- [ ] Add hasPermission method
- [ ] Load role on app startup from localStorage

**In Components:**
- [ ] Check role before showing UI
- [ ] Check permissions before enabling actions
- [ ] Send Bearer token with all API calls
- [ ] Handle 403 Forbidden errors
- [ ] Show error messages from backend

**In Routing:**
- [ ] Protect routes by role
- [ ] Redirect based on role after login
- [ ] Show admin dashboard only for admin/superadmin

---

## 🎓 Summary

The backend implements **role-based access control** with:

1. **3 Roles** with different permission levels (1, 2, 3)
2. **62 Permissions** that define what each role can do
3. **Middleware** that validates both roles and permissions
4. **Login response** that includes user role + all permissions
5. **Protected routes** that check authorization before processing

Your frontend needs to:

1. **Store role information** from login response
2. **Send Bearer token** with every API request
3. **Check permissions** before showing/enabling features
4. **Route based on role** (user vs admin)
5. **Handle authorization errors** gracefully

This gives you a **flexible, scalable system** where you can easily add/remove permissions without changing code!
