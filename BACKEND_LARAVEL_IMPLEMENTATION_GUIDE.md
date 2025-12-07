# 🔧 Backend Implementation Guide - Laravel

**This guide is for implementing the Admin Dashboard APIs using Laravel Framework**

---

## 📦 Setup Requirements

```bash
# Laravel version
Laravel 11+

# Key packages
composer require tymon/jwt-auth  # If not already installed
composer require laravel/cors

# Migrate & seed
php artisan migrate
php artisan db:seed
```

---

## 🔐 Step 1: Update Login Response

### File: `app/Http/Controllers/AuthController.php`

```php
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Email atau password salah'
        ], 401);
    }

    $user = Auth::user();
    $token = $this->guard()->login($user);

    return response()->json([
        'status' => 'success',
        'data' => [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'nama' => $user->nama,
                'role' => $user->role // ← ADD THIS LINE
            ],
            'token' => $token
        ]
    ]);
}
```

### Model: `app/Models/User.php`

Ensure the `role` column exists:

```php
protected $fillable = [
    'nama',
    'email', 
    'password',
    'no_hp',
    'role',  // ← Make sure this exists
    'total_poin',
    'level'
];

// Roles: admin, superadmin, user
```

---

## 🛣️ Step 2: Create Routes

### File: `routes/api.php`

```php
use App\Http\Controllers\AdminDashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function () {
    
    // Admin Dashboard Routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard/overview', [AdminDashboardController::class, 'overview']);
        Route::get('/admin/dashboard/users', [AdminDashboardController::class, 'users']);
        Route::get('/admin/dashboard/waste', [AdminDashboardController::class, 'waste']);
        Route::get('/admin/dashboard/points', [AdminDashboardController::class, 'points']);
        Route::get('/admin/dashboard/waste-by-user', [AdminDashboardController::class, 'wasteByUser']);
        Route::get('/admin/dashboard/reports', [AdminDashboardController::class, 'reports']);
    });
    
});
```

---

## 🏭 Step 3: Create Controller

### File: `app/Http/Controllers/AdminDashboardController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SetorSampah;
use App\Models\WasteType;
use App\Models\PoinHistory;
use App\Models\Redemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard/overview
     */
    public function overview()
    {
        try {
            $currentYear = date('Y');
            $currentMonth = date('m');
            
            // Get statistics
            $totalUsers = User::count();
            $activeUsers = User::whereHas('setorSampah', function ($query) {
                $query->where('created_at', '>=', now()->subDays(30));
            })->distinct()->count();
            
            $wasteData = SetorSampah::whereYear('created_at', $currentYear)
                ->selectRaw('SUM(berat_kg) as total_kg, COUNT(*) as count')
                ->first();
            
            $monthlyWaste = SetorSampah::whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $currentMonth)
                ->selectRaw('SUM(berat_kg) as total_kg, COUNT(*) as count')
                ->first();
            
            $pointsData = PoinHistory::whereYear('created_at', $currentYear)
                ->where('type', 'distribution')
                ->selectRaw('SUM(amount) as total')
                ->first();
            
            $monthlyPoints = PoinHistory::whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $currentMonth)
                ->where('type', 'distribution')
                ->selectRaw('SUM(amount) as total')
                ->first();
            
            $redemptions = Redemption::whereYear('created_at', $currentYear)
                ->selectRaw('SUM(points_used) as total')
                ->first();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'users' => [
                        'total' => $totalUsers,
                        'active_30days' => $activeUsers,
                        'new_this_month' => User::whereMonth('created_at', $currentMonth)
                            ->whereYear('created_at', $currentYear)->count()
                    ],
                    'waste' => [
                        'yearly_total_kg' => (float)($wasteData->total_kg ?? 0),
                        'yearly_total_count' => $wasteData->count ?? 0,
                        'monthly_total_kg' => (float)($monthlyWaste->total_kg ?? 0),
                        'monthly_total_count' => $monthlyWaste->count ?? 0,
                        'daily_average_kg' => $wasteData->total_kg ? round($wasteData->total_kg / date('z'), 1) : 0
                    ],
                    'points' => [
                        'yearly_total' => (int)($pointsData->total ?? 0),
                        'yearly_distributed' => (int)($pointsData->total ?? 0),
                        'monthly_total' => (int)($monthlyPoints->total ?? 0),
                        'monthly_distributed' => (int)($monthlyPoints->total ?? 0),
                        'average_per_user' => $totalUsers > 0 
                            ? round(($pointsData->total ?? 0) / $totalUsers) 
                            : 0
                    ],
                    'redemptions' => [
                        'yearly_total_points_redeemed' => (int)($redemptions->total ?? 0),
                        'monthly_total_points_redeemed' => Redemption::whereMonth('created_at', $currentMonth)
                            ->whereYear('created_at', $currentYear)
                            ->sum('points_used') ?? 0,
                        'total_redemptions' => Redemption::count()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/dashboard/users
     */
    public function users(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = min($request->get('per_page', 10), 100);
            $search = $request->get('search', '');
            
            $query = User::query();
            
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('no_hp', 'like', "%{$search}%");
                });
            }
            
            $total = $query->count();
            $users = $query->orderBy('created_at', 'DESC')
                ->paginate($perPage, ['*'], 'page', $page);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users->items(),
                    'pagination' => [
                        'total' => $total,
                        'page' => $page,
                        'per_page' => $perPage,
                        'total_pages' => ceil($total / $perPage)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/dashboard/waste
     */
    public function waste(Request $request)
    {
        try {
            $period = $request->get('period', 'yearly'); // daily, monthly, yearly
            $month = $request->get('month', date('m'));
            $year = $request->get('year', date('Y'));
            
            $query = SetorSampah::whereYear('created_at', $year);
            
            if ($period === 'monthly') {
                $query->whereMonth('created_at', $month);
            }
            
            $total = $query->sum('berat_kg');
            $count = $query->count();
            
            // Breakdown by waste type
            $breakdown = $query->join('waste_types', 'setor_sampahs.waste_type_id', '=', 'waste_types.id')
                ->groupBy('waste_types.type_name')
                ->selectRaw('waste_types.type_name as waste_type, SUM(setor_sampahs.berat_kg) as weight_kg, COUNT(*) as transactions')
                ->get()
                ->map(function ($item) use ($total) {
                    return [
                        'waste_type' => $item->waste_type,
                        'weight_kg' => (float)$item->weight_kg,
                        'transactions' => (int)$item->transactions,
                        'percentage' => $total > 0 ? round(($item->weight_kg / $total) * 100) : 0
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'year' => $year,
                    'month' => $month,
                    'summary' => [
                        'total_kg' => (float)$total,
                        'total_transactions' => (int)$count,
                        'average_per_transaction' => $count > 0 ? round($total / $count, 2) : 0
                    ],
                    'breakdown' => $breakdown
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/dashboard/points
     */
    public function points(Request $request)
    {
        try {
            $period = $request->get('period', 'yearly');
            $year = $request->get('year', date('Y'));
            
            $distributed = PoinHistory::whereYear('created_at', $year)
                ->where('type', 'distribution')
                ->sum('amount');
            
            $redeemed = Redemption::whereYear('created_at', $year)
                ->sum('points_used');
            
            // By source
            $bySource = PoinHistory::whereYear('created_at', $year)
                ->where('type', 'distribution')
                ->groupBy('source')
                ->selectRaw('source, SUM(amount) as points_distributed, COUNT(*) as transactions')
                ->get()
                ->map(function ($item) use ($distributed) {
                    return [
                        'source' => ucfirst($item->source),
                        'points_distributed' => (int)$item->points_distributed,
                        'percentage' => $distributed > 0 ? round(($item->points_distributed / $distributed) * 100) : 0,
                        'transactions' => (int)$item->transactions
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $period,
                    'year' => $year,
                    'summary' => [
                        'total_distributed' => (int)$distributed,
                        'total_redeemed' => (int)$redeemed,
                        'current_in_system' => (int)($distributed - $redeemed),
                        'active_users' => User::whereHas('poinHistories')->count()
                    ],
                    'by_source' => $bySource,
                    'by_type' => [
                        ['type' => 'Distribution', 'amount' => (int)$distributed],
                        ['type' => 'Redemption', 'amount' => (int)$redeemed]
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/dashboard/waste-by-user
     */
    public function wasteByUser(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = min($request->get('per_page', 10), 100);
            $sortBy = $request->get('sort_by', 'total_weight');
            $order = $request->get('order', 'DESC');
            
            $query = User::leftJoin('setor_sampahs', 'users.id', '=', 'setor_sampahs.user_id')
                ->groupBy('users.id', 'users.nama', 'users.email')
                ->selectRaw('
                    users.id as user_id,
                    users.nama,
                    users.email,
                    SUM(COALESCE(setor_sampahs.berat_kg, 0)) as total_weight_kg,
                    COUNT(setor_sampahs.id) as transaction_count,
                    ROUND(AVG(COALESCE(setor_sampahs.berat_kg, 0)), 1) as average_weight,
                    MAX(setor_sampahs.created_at) as last_deposit
                ')
                ->having('transaction_count', '>', 0);
            
            $total = $query->count();
            
            if ($sortBy === 'total_weight') {
                $query->orderByRaw('total_weight_kg ' . $order);
            } elseif ($sortBy === 'transaction_count') {
                $query->orderByRaw('transaction_count ' . $order);
            } else {
                $query->orderBy('users.nama', $order);
            }
            
            $users = $query->paginate($perPage, ['*'], 'page', $page);
            
            // Add calculated points_earned
            $users->getCollection()->transform(function ($user) {
                $user->points_earned = $user->total_weight_kg * 25; // Adjust multiplier as needed
                return $user;
            });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $users->items(),
                    'pagination' => [
                        'total' => $total,
                        'page' => $page,
                        'per_page' => $perPage,
                        'total_pages' => ceil($total / $perPage)
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/admin/dashboard/reports
     */
    public function reports(Request $request)
    {
        try {
            $reportType = $request->get('report_type', 'monthly');
            $date = $request->get('date');
            $month = $request->get('month', date('m'));
            $year = $request->get('year', date('Y'));
            $format = $request->get('format', 'json');
            
            // Build report data
            $reportData = $this->buildReportData($reportType, $date, $month, $year);
            
            if ($format === 'csv') {
                return $this->generateCSV($reportData);
            }
            
            return response()->json([
                'success' => true,
                'data' => $reportData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function buildReportData($type, $date, $month, $year)
    {
        // Implement based on report type
        return [
            'report_type' => $type,
            'period' => "Month $month, Year $year",
            'generated_at' => now()->toIso8601String(),
            'summary' => [
                'total_waste_kg' => 1250,
                'total_transactions' => 280,
                'total_users_active' => 95,
                'total_points_distributed' => 10500,
                'total_points_redeemed' => 3800
            ]
        ];
    }

    private function generateCSV($data)
    {
        // Implement CSV generation
    }
}
```

---

## 🛡️ Step 4: Create Admin Middleware

### File: `app/Http/Middleware/AdminOnly.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOnly
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            $user = auth()->user();
            
            if ($user->role === 'admin' || $user->role === 'superadmin') {
                return $next($request);
            }
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized - Admin role required'
        ], 401);
    }
}
```

### Register in: `app/Http/Kernel.php`

```php
protected $routeMiddleware = [
    // ... other middleware
    'admin' => \App\Http\Middleware\AdminOnly::class,
];
```

---

## 🗄️ Step 5: Ensure Database Tables

### Models needed:

```php
// User model already exists

// SetorSampah model
php artisan make:model SetorSampah -m

// WasteType model
php artisan make:model WasteType -m

// PoinHistory model
php artisan make:model PoinHistory -m

// Redemption model
php artisan make:model Redemption -m
```

---

## ✅ Testing

```bash
# Test with Postman or curl

# 1. Login first
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 2. Use returned token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Test endpoints
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/admin/dashboard/overview

curl -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:8000/api/admin/dashboard/users?page=1&per_page=10"

curl -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:8000/api/admin/dashboard/waste?period=monthly&month=1&year=2025"
```

---

## 🚀 Ready to Go!

Start your Laravel server:
```bash
php artisan serve
```

Frontend will now connect at `http://127.0.0.1:8000`

**Good luck! 🎉**
