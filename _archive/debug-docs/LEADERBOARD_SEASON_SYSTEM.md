# 🏆 Leaderboard Season System

## 📊 Ringkasan Perubahan

### ✅ Yang Sudah Diimplementasikan (Frontend)

1. **Season Banner** - Menampilkan info season aktif
2. **Filter Periode** - Season, Bulan Ini, Minggu Ini, Semua
3. **Mobile Card View** - Tabel berubah jadi kartu di mobile
4. **Responsive Design** - Support semua ukuran layar
5. **Countdown Timer** - Waktu sisa season

---

## 🔄 Cara Kerja Season System

### Frontend Logic

```javascript
// Season dibagi per kuartal (3 bulan)
// Q1: Jan-Mar | Q2: Apr-Jun | Q3: Jul-Sep | Q4: Oct-Dec

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth(); // 0-11
const seasonNumber = Math.floor(month / 3) + 1;

// Contoh: Desember 2025 = Season 4 2025
// Start: 1 Oktober 2025
// End: 31 Desember 2025
```

### API Request dengan Season Filter

```javascript
// Frontend mengirim:
GET /api/dashboard/leaderboard?period=season&start_date=2025-10-01&end_date=2025-12-31
```

---

## 🔧 Backend Yang Perlu Disiapkan

### 1. Update Leaderboard Endpoint

**File:** `DashboardController.php`

```php
public function getLeaderboard(Request $request)
{
    $limit = min($request->query('limit', 50), 100);
    $period = $request->query('period', 'all'); // all, season, monthly, weekly
    $startDate = $request->query('start_date');
    $endDate = $request->query('end_date');

    $query = User::query()
        ->select('users.user_id', 'users.nama', 'users.total_poin', 'users.total_setor_sampah');

    // Filter berdasarkan periode
    if ($period !== 'all') {
        // Hitung poin dari tabung_sampah dalam periode tertentu
        $query = User::query()
            ->select(
                'users.user_id',
                'users.nama',
                DB::raw('COALESCE(SUM(tabung_sampah.poin_didapat), 0) as season_poin'),
                DB::raw('COALESCE(SUM(tabung_sampah.berat_sampah), 0) as season_sampah')
            )
            ->leftJoin('tabung_sampah', function ($join) use ($startDate, $endDate) {
                $join->on('users.user_id', '=', 'tabung_sampah.user_id')
                     ->where('tabung_sampah.status', '=', 'approved');
                
                if ($startDate && $endDate) {
                    $join->whereBetween('tabung_sampah.created_at', [$startDate, $endDate]);
                }
            })
            ->groupBy('users.user_id', 'users.nama')
            ->orderByDesc('season_poin');
    } else {
        // All-time leaderboard (dari total_poin di users table)
        $query = User::query()
            ->select(
                'user_id',
                'nama',
                'total_poin',
                'total_setor_sampah as total_sampah'
            )
            ->where('role_id', 1) // Only nasabah
            ->orderByDesc('total_poin');
    }

    $users = $query->limit($limit)->get();

    // Add rank
    $users = $users->map(function ($user, $index) use ($period) {
        return [
            'rank' => $index + 1,
            'user_id' => $user->user_id,
            'nama' => $user->nama,
            'total_poin' => $period !== 'all' ? ($user->season_poin ?? 0) : $user->total_poin,
            'total_sampah' => $period !== 'all' ? ($user->season_sampah ?? 0) : $user->total_sampah,
        ];
    });

    return response()->json([
        'status' => 'success',
        'data' => $users,
        'meta' => [
            'period' => $period,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total' => $users->count(),
        ]
    ]);
}
```

### 2. Tabel seasons (Optional - Untuk Manajemen Season)

```sql
CREATE TABLE seasons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,          -- "Season 4 2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    rewards JSON NULL,                   -- Hadiah untuk top 3
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contoh data
INSERT INTO seasons (name, start_date, end_date, is_active, rewards) VALUES
('Season 4 2025', '2025-10-01', '2025-12-31', TRUE, '{"1": "Voucher 500rb", "2": "Voucher 250rb", "3": "Voucher 100rb"}');
```

### 3. API Endpoint untuk Season Info (Optional)

```php
// GET /api/seasons/current
public function getCurrentSeason()
{
    $season = Season::where('is_active', true)
        ->orWhere(function ($query) {
            $now = now()->toDateString();
            $query->where('start_date', '<=', $now)
                  ->where('end_date', '>=', $now);
        })
        ->first();

    if (!$season) {
        // Auto-generate season info
        $now = now();
        $quarter = ceil($now->month / 3);
        $startMonth = ($quarter - 1) * 3 + 1;
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'name' => "Season {$quarter} {$now->year}",
                'start_date' => $now->copy()->setMonth($startMonth)->startOfMonth()->toDateString(),
                'end_date' => $now->copy()->setMonth($startMonth + 2)->endOfMonth()->toDateString(),
                'is_auto_generated' => true,
            ]
        ]);
    }

    return response()->json([
        'status' => 'success',
        'data' => $season
    ]);
}
```

---

## 📱 Mobile View

### Desktop (≥641px)
- Tabel dengan kolom: Peringkat | Nama | Sampah | Poin

### Mobile (≤640px)
- Card layout dengan:
  - Rank emoji/number di kiri
  - Nama + badge "Anda" (jika current user)
  - Stats: 🗑️ Sampah | ⭐ Poin

---

## 🎯 Season Reset Behavior

### Ketika Season Berakhir:

1. **Leaderboard Season** → Reset ke 0 (poin dihitung ulang dari awal)
2. **Total Poin User** → Tetap (tidak hilang)
3. **Rewards** → Diberikan ke top 3 (jika ada sistem rewards)

### Data Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│                    tabung_sampah table                          │
│  (setiap setoran sampah dicatat dengan timestamp)              │
├─────────────────────────────────────────────────────────────────┤
│ user_id │ poin_didapat │ berat_sampah │ created_at              │
│    14   │     50       │     2.5      │ 2025-10-15 10:00:00    │
│    14   │     30       │     1.5      │ 2025-11-20 14:30:00    │
│    15   │     80       │     4.0      │ 2025-12-01 09:00:00    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SEASON 4 LEADERBOARD (Oct-Dec 2025)               │
│         SUM(poin_didapat) WHERE created_at BETWEEN dates       │
├─────────────────────────────────────────────────────────────────┤
│ Rank │ User   │ Season Poin │ Season Sampah                    │
│  1   │ User15 │     80      │    4.0 Kg                        │
│  2   │ User14 │     80      │    4.0 Kg                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test 1: Season Filter
1. Buka halaman Leaderboard
2. Pastikan default filter adalah "Season"
3. Lihat Season Banner dengan countdown

### Test 2: Period Filter
1. Klik filter "Bulan Ini" → Data hanya bulan ini
2. Klik filter "Minggu Ini" → Data hanya minggu ini
3. Klik filter "Semua" → All-time data

### Test 3: Mobile View
1. Buka di browser mobile atau resize window ≤640px
2. Tabel harus berubah jadi card layout
3. Cards harus responsive dan tidak terpotong

### Test 4: Season Countdown
1. Lihat Season Banner
2. Countdown menunjukkan waktu tersisa
3. Jika ≤7 hari → Warning message muncul

---

## 📋 Checklist Implementation

### Frontend ✅
- [x] Season calculation (quarterly)
- [x] Season banner with countdown
- [x] Period filter buttons (Season, Monthly, Weekly, All)
- [x] API call with period & date parameters
- [x] Mobile card view
- [x] Responsive CSS
- [x] Refresh button
- [x] Updated header stats

### Backend (TODO)
- [ ] Update getLeaderboard() untuk support period filter
- [ ] Filter data berdasarkan start_date & end_date
- [ ] Hitung poin dari tabung_sampah (bukan total_poin)
- [ ] (Optional) Tabel seasons untuk manajemen
- [ ] (Optional) API endpoint /api/seasons/current

---

## 🚀 Quick Start

1. **Frontend sudah siap** - Langsung test di browser
2. **Backend perlu update** - Tambahkan filter logic ke DashboardController
3. **Test filter** - Coba ganti periode dan lihat console log

Jika backend belum support filter, frontend akan tetap menampilkan data (hanya filter tidak berfungsi sampai backend diupdate).
