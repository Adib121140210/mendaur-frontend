# Backend Register Endpoint - Implementation Reference

## 📋 Backend Requirements

Your Laravel backend needs to implement a `/api/register` endpoint that accepts:

```php
POST /api/register
Content-Type: application/json

{
  "nama": "John Doe",
  "email": "john@example.com", 
  "no_hp": "081234567890",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

## 🔧 Implementation Guide

### Step 1: Create User Model Migration (if not exists)

```php
// database/migrations/YYYY_MM_DD_xxxxxx_create_users_table.php

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('nama');
    $table->string('email')->unique();
    $table->string('no_hp')->unique();
    $table->string('password');
    $table->integer('total_poin')->default(0);
    $table->timestamps();
});
```

### Step 2: Create User Model

```php
// app/Models/User.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nama',
        'email',
        'no_hp',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = bcrypt($value);
    }
}
```

### Step 3: Create AuthController

```php
// app/Http/Controllers/AuthController.php

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'nama' => 'required|string|min:3|max:255',
                'email' => 'required|email|unique:users,email',
                'no_hp' => 'required|string|unique:users,no_hp|regex:/^(\+62|0)[0-9]{9,12}$/',
                'password' => 'required|string|min:8',
                'password_confirm' => 'required|string|min:8|same:password',
            ], [
                'nama.required' => 'Nama wajib diisi',
                'nama.min' => 'Nama minimal 3 karakter',
                'email.required' => 'Email wajib diisi',
                'email.email' => 'Format email tidak valid',
                'email.unique' => 'Email sudah terdaftar',
                'no_hp.required' => 'Nomor HP wajib diisi',
                'no_hp.unique' => 'Nomor HP sudah terdaftar',
                'no_hp.regex' => 'Format nomor HP tidak valid (08xx atau +62xx)',
                'password.required' => 'Password wajib diisi',
                'password.min' => 'Password minimal 8 karakter',
                'password_confirm.required' => 'Konfirmasi password wajib diisi',
                'password_confirm.same' => 'Password tidak cocok',
            ]);

            // Create user
            $user = User::create([
                'nama' => $validated['nama'],
                'email' => $validated['email'],
                'no_hp' => $validated['no_hp'],
                'password' => $validated['password'], // Auto-hashed by model mutator
            ]);

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Akun berhasil dibuat',
                'data' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'no_hp' => $user->no_hp,
                    'total_poin' => $user->total_poin,
                    'token' => $token,
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mendaftar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'message' => 'Email atau password salah'
                ], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil',
                'data' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'email' => $user->email,
                    'no_hp' => $user->no_hp,
                    'total_poin' => $user->total_poin,
                    'token' => $token,
                ]
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ], 200);
    }

    /**
     * Get current user
     */
    public function currentUser(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $request->user()->id,
                'nama' => $request->user()->nama,
                'email' => $request->user()->email,
                'no_hp' => $request->user()->no_hp,
                'total_poin' => $request->user()->total_poin,
            ]
        ]);
    }
}
```

### Step 4: Add Routes

```php
// routes/api.php

use App\Http\Controllers\AuthController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'currentUser']);
});
```

### Step 5: Configure CORS (api.php)

```php
// config/cors.php

'paths' => ['api/*', 'sanctum/csrf-token'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173'],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

### Step 6: Environment Configuration

```bash
# .env

APP_NAME=BankSampahAPI
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:...
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bank_sampah
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173
SESSION_DOMAIN=localhost
```

## 🧪 Testing the Endpoint

### Using cURL

```bash
# Register new user
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "John Doe",
    "email": "john@example.com",
    "no_hp": "081234567890",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!"
  }'
```

### Using Postman

1. Create new POST request
2. URL: `http://127.0.0.1:8000/api/register`
3. Headers:
   ```
   Content-Type: application/json
   Accept: application/json
   ```
4. Body (raw JSON):
   ```json
   {
     "nama": "John Doe",
     "email": "john@example.com",
     "no_hp": "081234567890",
     "password": "SecurePass123!",
     "password_confirm": "SecurePass123!"
   }
   ```

### Using Laravel Tinker

```bash
php artisan tinker

# Create user directly
$user = User::create([
    'nama' => 'John Doe',
    'email' => 'john@example.com',
    'no_hp' => '081234567890',
    'password' => bcrypt('SecurePass123!')
]);

# Get token
$token = $user->createToken('auth_token')->plainTextToken;
```

## ✅ Success Response Examples

### Valid Registration

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "status": "success",
  "message": "Akun berhasil dibuat",
  "data": {
    "id": 1,
    "nama": "John Doe",
    "email": "john@example.com",
    "no_hp": "081234567890",
    "total_poin": 0,
    "token": "1|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## ❌ Error Response Examples

### Validation Error

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "message": "Validation failed",
  "errors": {
    "email": ["Email sudah terdaftar"],
    "no_hp": ["Nomor HP sudah terdaftar"]
  }
}
```

### Invalid Phone Format

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "message": "Validation failed",
  "errors": {
    "no_hp": ["Format nomor HP tidak valid (08xx atau +62xx)"]
  }
}
```

### Server Error

```json
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "message": "Terjadi kesalahan saat mendaftar",
  "error": "Database connection error"
}
```

## 🔐 Security Checklist

### Password Security ✅
- [ ] Password hashed with bcrypt (cost factor 10+)
- [ ] Password never returned in response
- [ ] Password minimum 8 characters enforced
- [ ] Special characters supported

### Input Validation ✅
- [ ] Email format validated
- [ ] Email uniqueness checked
- [ ] Phone format validated with regex
- [ ] Phone uniqueness checked
- [ ] Name length validated (3-255 chars)
- [ ] SQL injection prevention (Eloquent ORM)

### API Security ✅
- [ ] HTTPS enabled (production)
- [ ] CORS configured for your domain
- [ ] Rate limiting implemented
- [ ] API tokens expire (Sanctum default: 1 year)
- [ ] No sensitive data in logs
- [ ] Errors don't expose system info

### Database Security ✅
- [ ] Passwords hashed
- [ ] Sensitive data encrypted if needed
- [ ] Backups configured
- [ ] Database access restricted
- [ ] SQL prepared statements (Eloquent)

## 📊 Database Schema

```
users
├── id (PK)
├── nama (VARCHAR 255)
├── email (VARCHAR 255, UNIQUE)
├── no_hp (VARCHAR 20, UNIQUE)
├── password (VARCHAR 255, HASHED)
├── total_poin (INT, DEFAULT 0)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🚀 Deployment Checklist

- [ ] Database migrations ran (`php artisan migrate`)
- [ ] Sanctum installed and configured
- [ ] Environment variables set
- [ ] API URL updated to production
- [ ] HTTPS enabled
- [ ] CORS configured for frontend domain
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Tested with actual frontend form
- [ ] Load tested (concurrent registrations)
- [ ] Monitoring/alerting set up

## 📞 Common Backend Issues

### Issue: CORS Error
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`
**Solution**: Configure CORS in `config/cors.php`
```php
'allowed_origins' => ['http://localhost:3000'],
```

### Issue: Token Not Generated
**Error**: User created but token is null
**Solution**: Ensure Sanctum is installed and user can call `createToken()`
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Issue: Password Hash Fails
**Error**: Password stored as plaintext
**Solution**: Add mutator to User model
```php
public function setPasswordAttribute($value)
{
    $this->attributes['password'] = bcrypt($value);
}
```

### Issue: Email Already Registered
**Error**: Duplicate email error but email doesn't exist
**Solution**: Check database for soft deleted users, ensure unique constraint
```bash
php artisan tinker
User::withTrashed()->where('email', 'test@test.com')->get();
```

## 📚 Related Documentation

- Laravel Sanctum: https://laravel.com/docs/10.x/sanctum
- Laravel Validation: https://laravel.com/docs/10.x/validation
- Laravel Eloquent: https://laravel.com/docs/10.x/eloquent
- CORS Configuration: https://laravel.com/docs/10.x/cors

---

## ✨ Summary

**Backend Endpoint**: `/api/register`
**Method**: POST
**Status Code**: 201 (success), 422 (validation), 500 (error)

**Required Fields**:
- nama (string, 3-255 chars)
- email (string, unique, valid format)
- no_hp (string, unique, 08xx/+62xx format)
- password (string, min 8 chars)
- password_confirm (string, must match password)

**Returns**:
- User ID, name, email, phone, points
- JWT token for authentication

**Security**:
- Password hashed with bcrypt
- Input validated and sanitized
- CORS configured
- Rate limiting recommended
- HTTPS required for production

---

**Implementation Time**: ~30 minutes
**Testing Time**: ~15 minutes
**Total**: ~45 minutes

**Status**: Ready to implement ✅
