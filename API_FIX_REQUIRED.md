# ⚠️ CRITICAL BACKEND API FIX REQUIRED

## Issue
The `/api/jadwal-penyetoran` endpoint is not returning the primary key `id` field, causing the form submission to fail with a 500 error.

## Root Cause Analysis

**Database Schema:**
```
jadwal_penyetorans table:
  - id (PRIMARY KEY) ← This field is missing in API response
  - jadwal_penyetoran_id (nullable, deprecated?)
  - tanggal
  - waktu_mulai
  - waktu_selesai
  - lokasi
  - keterangan
  - created_at
  - updated_at

tabung_sampah table:
  - jadwal_id (FOREIGN KEY) ← References jadwal_penyetorans.id
```

**Current API Response (WRONG):**
```json
{
  "status": "success",
  "data": [
    {
      "jadwal_penyetoran_id": null,  // ❌ null value
      "tanggal": "2025-11-14T17:00:00.000000Z",
      "waktu_mulai": "08:00:00",
      "waktu_selesai": "10:00:00",
      "lokasi": "TPS 3R Metro Barat",
      "keterangan": null,
      "created_at": "2025-12-09T17:47:25.000000Z",
      "updated_at": "2025-12-09T17:47:25.000000Z"
      // ❌ Missing: "id" field (primary key!)
    },
    // ...
  ]
}
```

**Form Submission Error:**
```
POST http://127.0.0.1:8000/api/tabung-sampah 500
Schedule ID to send: 0 (synthetic ID, not from database!)
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'jadwal_id'
```

## Required Backend Fixes

### Option 1: Fix the API Response (RECOMMENDED)
Update the `/api/jadwal-penyetoran` endpoint to include the `id` field:

**Controller Code to Fix:**
```php
// In JadwalPenyetoranController
public function index()
{
    // ✅ CORRECT: Include 'id' field
    return response()->json([
        'status' => 'success',
        'data' => JadwalPenyetoran::select('id', 'tanggal', 'waktu_mulai', 'waktu_selesai', 'lokasi', 'keterangan', 'created_at', 'updated_at')->get()
    ]);
}
```

**Expected Response Format:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,                              // ✅ PRIMARY KEY - MUST HAVE THIS
      "tanggal": "2025-11-14T17:00:00.000000Z",
      "waktu_mulai": "08:00:00",
      "waktu_selesai": "10:00:00",
      "lokasi": "TPS 3R Metro Barat",
      "keterangan": null,
      "created_at": "2025-12-09T17:47:25.000000Z",
      "updated_at": "2025-12-09T17:47:25.000000Z"
    },
    {
      "id": 2,
      "tanggal": "2025-11-14T17:00:00.000000Z",
      "waktu_mulai": "14:00:00",
      "waktu_selesai": "16:00:00",
      "lokasi": "Bank Sampah Induk Nusa",
      // ...
    },
    {
      "id": 3,
      "tanggal": "2025-11-15T17:00:00.000000Z",
      "waktu_mulai": "09:00:00",
      "waktu_selesai": "11:00:00",
      "lokasi": "TPS 3R Metro Selatan",
      // ...
    }
  ]
}
```

### Option 2: Fix jadwal_penyetoran_id Column (If different primary key)
If you renamed the primary key to `jadwal_penyetoran_id`:
```php
// Ensure it's populated:
$schedule = JadwalPenyetoran::select('jadwal_penyetoran_id', 'tanggal', ...)->first();
// Then in tabung_sampah table, foreign key should reference this
```

## Action Items for Backend Team

**PRIORITY: CRITICAL**

1. **Check JadwalPenyetoran Model**
   - Verify primary key is `id`
   - Check if it's being hidden/excluded

2. **Fix the Controller**
   ```php
   // Find:
   JadwalPenyetoran::all() // ❌ May not include 'id'
   
   // Change to:
   JadwalPenyetoran::select('id', 'tanggal', 'waktu_mulai', 'waktu_selesai', 'lokasi', 'keterangan', 'created_at', 'updated_at')->get()
   ```

3. **Test the API**
   ```bash
   curl http://127.0.0.1:8000/api/jadwal-penyetoran
   # Should see "id": 1, "id": 2, "id": 3, etc.
   ```

4. **Verify Foreign Key**
   - `tabung_sampah.jadwal_id` must reference `jadwal_penyetorans.id`

5. **Commit & Test**
   ```bash
   git add -A
   git commit -m "fix: Include primary key 'id' in jadwal-penyetoran API response"
   ```

## Frontend Status

- ✅ Form UI displays all 3 schedules correctly
- ✅ Schedule selection works perfectly
- ✅ Form validation works
- ✅ File upload works
- ✅ Geolocation works
- ❌ Form submission fails: Missing `id` in API response
- 🔧 Temporary workaround: Using synthetic IDs 1,2,3 based on position (will fail if schedules are reordered)

## How to Verify After Backend Fix

1. After backend fix is deployed:
   ```bash
   curl http://127.0.0.1:8000/api/jadwal-penyetoran
   # Check: "id" field present for all schedules
   ```

2. Then test form submission:
   - Navigate to Tabung Sampah page
   - Click "Setor Sampah Sekarang" button
   - Fill form with all fields
   - Select a schedule
   - Submit form
   - Should see success message and data appear in history

## Blocking Issue

✅ **Frontend:** Ready  
❌ **Backend:** API missing `id` field in jadwal response  
⏳ **Status:** Form submission blocked until backend fix applied

---

**Last Updated:** 2025-12-10  
**Priority:** 🔴 CRITICAL  
**Assigned To:** Backend Team  
**Target Completion:** ASAP
