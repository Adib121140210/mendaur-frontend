# Form Setor Sampah - Visual Architecture 📊

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Browser                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                       │    │
│  │  Form Opens → 3 Automatic Actions:                                  │    │
│  │                                                                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐          │    │
│  │  │   UseEffect  │  │  UseEffect   │  │ Browser API      │          │    │
│  │  │              │  │              │  │                  │          │    │
│  │  │ Get AuthUser │  │ Trigger Geo  │  │ navigator.       │          │    │
│  │  │              │  │ location API │  │ geolocation      │          │    │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘          │    │
│  │         │                  │                    │                    │    │
│  │         │                  │                    │ [Request Permission] │  │
│  │         ├─→ nama           │                    │ [Get Coordinates]   │  │
│  │         ├─→ no_hp          │                    │ [Convert to Maps]   │  │
│  │         │                  │                    │                     │   │
│  │         └─→ Disabled/      │                    └──→ Enabled/         │   │
│  │            ReadOnly         └──→ Enabled/          Auto-Filled        │   │
│  │                                Auto-Filled                            │   │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          FORM RENDERING LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Form Layout                                      │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  📅 Schedule Selector                                              │    │
│  │  ├─ Dropdown Menu                                                 │    │
│  │  └─ Fetches from API: /api/jadwal-penyetoran                      │    │
│  │                                                                     │    │
│  │  👤 Name Field                                                     │    │
│  │  ├─ Input: Adib Surya  [🔒 READ-ONLY]                            │    │
│  │  └─ Source: AuthContext.user.nama                                │    │
│  │                                                                     │    │
│  │  📞 Phone Field                                                    │    │
│  │  ├─ Input: 081234567890  [🔒 READ-ONLY]                          │    │
│  │  └─ Source: AuthContext.user.no_hp                               │    │
│  │                                                                     │    │
│  │  📍 Location Field                                                 │    │
│  │  ├─ Input: https://www.google.com/maps?q=...  [✅ AUTO-FILLED]   │    │
│  │  ├─ Source: Browser Geolocation API                              │    │
│  │  └─ Button: 🔄 Perbarui Lokasi Saya                              │    │
│  │                                                                     │    │
│  │  🗑️ Category Selection  ⭐ NEW!                                    │    │
│  │  ├─ [📄] [🛍️] [🔨] [👕] [💻] [📦]                               │    │
│  │  ├─ Interactive Cards (Click to Select)                          │    │
│  │  └─ Callback: FormSetorSampah.handleKategoriChange()            │    │
│  │                                                                     │    │
│  │  📸 Photo Upload                                                   │    │
│  │  ├─ File Input: accept=\"image/*\"                                │    │
│  │  └─ Shows: Filename & File Size                                   │    │
│  │                                                                     │    │
│  │  [Submit] [Cancel]                                                 │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA COLLECTION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  FormData Object:                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ✅ AUTOMATICALLY CAPTURED:                                         │   │
│  │  ├─ user_id           [From Auth Token]                            │   │
│  │  ├─ nama_lengkap      [From user.nama]                             │   │
│  │  ├─ no_hp             [From user.no_hp]                            │   │
│  │  └─ titik_lokasi      [From GPS]                                   │   │
│  │                                                                      │   │
│  │  👤 USER SELECTED:                                                 │   │
│  │  ├─ jadwal_id         [Dropdown]                                   │   │
│  │  ├─ jenis_sampah      [Category cards]  ⭐ NEW!                   │   │
│  │  └─ foto_sampah       [File upload]                                │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         API TRANSMISSION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  POST /api/tabung-sampah                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  Headers:                                                            │   │
│  │  ├─ Content-Type: multipart/form-data                              │   │
│  │  ├─ Accept: application/json                                       │   │
│  │  └─ Authorization: Bearer <token>                                  │   │
│  │                                                                      │   │
│  │  Body (FormData):                                                   │   │
│  │  ├─ user_id: 1                                                     │   │
│  │  ├─ jadwal_id: 3                                                   │   │
│  │  ├─ nama_lengkap: \"Adib Surya\"                                   │   │
│  │  ├─ no_hp: \"081234567890\"                                        │   │
│  │  ├─ titik_lokasi: \"https://maps.google.com?q=-6.2,106.8\"        │   │
│  │  ├─ jenis_sampah: \"Plastik\"  ⭐ NEW!                           │   │
│  │  └─ foto_sampah: <binary-image-data>                              │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                    │
│                   ~1-2 seconds                                               │
│                          ↓                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND PROCESSING LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Laravel Controller (api/tabung-sampah):                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  1. Validate Input                                                   │   │
│  │     ├─ Check user_id exists                                         │   │
│  │     ├─ Check jadwal_id exists                                       │   │
│  │     ├─ Validate jenis_sampah in allowed list ⭐ NEW!              │   │
│  │     ├─ Validate titik_lokasi format ⭐ NEW!                       │   │
│  │     └─ Check image file type                                        │   │
│  │                                                                      │   │
│  │  2. Process Upload                                                   │   │
│  │     └─ Save foto_sampah to /storage/app/public/tabung_sampah/      │   │
│  │                                                                      │   │
│  │  3. Store in Database                                               │   │
│  │     └─ INSERT into tabung_sampah table                             │   │
│  │                                                                      │   │
│  │  4. Return Response                                                  │   │
│  │     ├─ status: \"success\"                                          │   │
│  │     ├─ message: \"Setor sampah berhasil!\"                          │   │
│  │     └─ data: { id, created_at, ... }                               │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                    │
│                   ~500ms-1s                                                  │
│                          ↓                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE STORAGE LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  table: tabung_sampah                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  id          │ int           │ 42                                   │   │
│  │  user_id     │ int FK        │ 1                                    │   │
│  │  jadwal_id   │ int FK        │ 3                                    │   │
│  │  nama_lengkap│ varchar(255)  │ Adib Surya                           │   │
│  │  no_hp       │ varchar(20)   │ 081234567890                         │   │
│  │  jenis_sampah│ varchar(100)  │ Plastik                   ⭐ NEW!   │   │
│  │  titik_lokasi│ longtext      │ https://maps.google...    ⭐ NEW!   │   │
│  │  foto_sampah │ varchar(255)  │ uploads/tabung_sampah_1.jpg          │   │
│  │  status      │ enum          │ pending                              │   │
│  │  created_at  │ timestamp     │ 2024-11-20 10:30:00                 │   │
│  │  ...         │ ...           │ ...                                  │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                               │
│  ✅ Now Trackable:                                                          │
│  • WHAT waste: jenis_sampah = \"Plastik\"                                 │   │
│  • WHERE from: titik_lokasi = \"-6.2, 106.8\" (coordinates)               │   │
│  • WHO: user_id = 1 (user's ID)                                           │   │
│  • WHEN: created_at = timestamp                                           │   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS & INSIGHTS LAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  With Category & Location Data, We Can Now:                                 │
│                                                                               │
│  📊 Category Distribution                                                    │
│  ├─ SELECT jenis_sampah, COUNT(*) FROM tabung_sampah GROUP BY jenis_sampah│
│  └─ Result: Plastik 45%, Kertas 25%, Logam 15%, ...                       │
│                                                                               │
│  🗺️ Geographic Heat Map                                                     │
│  ├─ SELECT titik_lokasi, COUNT(*) FROM tabung_sampah                       │
│  │  GROUP BY titik_lokasi ORDER BY COUNT(*) DESC                           │
│  └─ Result: Jalan Merdeka (125), Jalan Sudirman (98), ...                 │
│                                                                               │
│  👤 User Preferences                                                         │
│  ├─ SELECT user_id, jenis_sampah, COUNT(*) FROM tabung_sampah              │
│  │  GROUP BY user_id, jenis_sampah                                         │
│  └─ Result: Adib prefers Plastik, Desi prefers Logam                       │
│                                                                               │
│  ⏰ Time Patterns                                                            │
│  ├─ SELECT DAYOFWEEK(created_at), COUNT(*) FROM tabung_sampah              │
│  │  GROUP BY DAYOFWEEK(created_at)                                         │
│  └─ Result: Tuesday peak (120/day), Saturday peak (95/day)                 │
│                                                                               │
│  🎯 Optimization Recommendations                                            │
│  ├─ Deploy more pickups to Jalan Merdeka (high volume zone)               │
│  ├─ Focus Plastik collection on Tuesdays/Thursdays                         │
│  ├─ Target Elektronik incentives to low-participation users                │
│  └─ Schedule Logam pickups on Saturdays (peak day)                        │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
AuthContext
├─ user: { id, nama, no_hp, ... }
└─ isAuthenticated: true

         ↓ Provides User Data

FormSetorSampah (Main Container)
├─ Props: { onClose, userId, preSelectedSchedule }
├─ State:
│  ├─ formData: { nama, noHp, lokasi, jenis, jadwalId, foto }
│  ├─ selectedKategori: \"Plastik\" | null
│  ├─ jadwalList: [ {...}, {...} ]
│  ├─ errors: { jenis?: \"...\", foto?: \"...\" }
│  └─ loading: false
│
├─ Effects:
│  ├─ useEffect: Auto-fill name, phone, location [user dependency]
│  ├─ useEffect: Fetch jadwal list [on mount]
│  └─ useEffect: Update jadwalId [preSelectedSchedule dependency]
│
├─ Handlers:
│  ├─ handleChange(e): Update input fields
│  ├─ handleAmbilLokasi(): Refresh GPS location
│  ├─ handleKategoriChange(id, label): ⭐ NEW - Process category
│  ├─ validate(): Check all fields
│  └─ handleSubmit(e): Send to backend
│
└─ Renders:
   ├─ <select> jadwal-penyetoran
   ├─ <input> nama_lengkap [readOnly, auto-filled]
   ├─ <input> no_hp [readOnly, auto-filled]
   ├─ <input> titik_lokasi [auto-tracked]
   ├─ <button> Perbarui Lokasi Saya
   ├─ <KategoriSampahWrapper>  ⭐ NEW
   │  └─ Passes:
   │     ├─ selectedKategori
   │     ├─ setSelectedKategori
   │     └─ onSelectionChange={handleKategoriChange}
   │
   ├─ <input> foto_sampah [file upload]
   ├─ <button> Ajukan Penjemputan [submit]
   └─ <button> Batal [close]


KategoriSampahWrapper (Waste Category Selector)
├─ Props:
│  ├─ selectedKategori: \"Plastik\" | null
│  ├─ setSelectedKategori: function
│  └─ onSelectionChange: function ⭐ NEW
│
├─ Data Source:
│  └─ KategoriSampah array (from jenisSampah.jsx):
│     ├─ { id: \"Kertas\", label: \"Kertas\", color: \"#0284c7\", icon: FileText }
│     ├─ { id: \"Plastik\", label: \"Plastik\", color: \"#047857\", icon: Package }
│     ├─ { id: \"Logam\", label: \"Logam\", color: \"#6b7280\", icon: Hammer }
│     ├─ { id: \"Tekstil\", label: \"Tekstil\", color: \"#7c3aed\", icon: Shirt }
│     ├─ { id: \"Elektronik\", label: \"Elektronik\", color: \"#facc15\", icon: Monitor }
│     └─ { id: \"Campuran\", label: \"Lainnya\", color: \"#b45309\", icon: MoreHorizontal }
│
├─ Handler:
│  └─ handleCategoryClick(id, label):
│     ├─ Toggle: selectedKategori === id ? null : id
│     ├─ setSelectedKategori(newSelection)
│     └─ onSelectionChange(newSelection, label)
│        └─ Triggers: FormSetorSampah.handleKategoriChange()
│           └─ Updates: formData.jenis = label
│
└─ Renders:
   └─ 6 Interactive Cards:
      ├─ Each clickable
      ├─ Shows icon + label
      ├─ Border highlights on selection
      └─ Keyboard accessible (Enter/Space)
```

---

## Data Flow During Form Submission

```
User Clicks \"Ajukan Penjemputan\"
         ↓
  handleSubmit(e)
         ↓
  e.preventDefault()
         ↓
  validate()
    ├─ Check nama not empty ✓
    ├─ Check noHp not empty ✓
    ├─ Check lokasi not empty ✓
    ├─ Check jenis selected ✓
    ├─ Check foto uploaded ✓
    └─ Check jadwalId selected ✓
         ↓
  Get token from localStorage
         ↓
  Create FormData object
    ├─ user_id: 1
    ├─ jadwal_id: 3
    ├─ nama_lengkap: \"Adib Surya\"      [from user]
    ├─ no_hp: \"081234567890\"           [from user]
    ├─ titik_lokasi: \"https://...\"     [from GPS]
    ├─ jenis_sampah: \"Plastik\"         [from state]
    └─ foto_sampah: <File>              [from input]
         ↓
  POST to http://127.0.0.1:8000/api/tabung-sampah
    └─ Headers:
       ├─ Authorization: Bearer <token>
       └─ Content-Type: multipart/form-data
         ↓
  Backend Validates
    ├─ Token valid? → Yes
    ├─ User exists? → Yes
    ├─ Schedule exists? → Yes
    ├─ Category valid? → Yes (Plastik in list)
    ├─ Location format? → Yes (Google Maps link)
    └─ File valid? → Yes (JPEG image)
         ↓
  Backend Processes
    ├─ Save file to /storage/app/public/tabung_sampah/
    └─ Generate path: uploads/tabung_sampah_123456.jpg
         ↓
  Database INSERT
    └─ INSERT INTO tabung_sampah (
         user_id, jadwal_id, nama_lengkap, no_hp,
         titik_lokasi, jenis_sampah, foto_sampah,
         status, created_at
       ) VALUES (...)
         ↓
  Response 200 OK
    └─ {
         \"status\": \"success\",
         \"message\": \"Setor sampah berhasil!\",
         \"data\": { id: 42, created_at: \"...\", ... }
       }
         ↓
  Frontend Success
    ├─ Alert \"Setor sampah berhasil!\"
    ├─ Reset formData
    └─ onClose() → Close modal
         ↓
    User sees confirmation ✅
```

---

## State Management Timeline

```
Timeline: Form Lifecycle

T=0ms    │ Form Component Mounts
         ├─ useState initializes empty formData
         ├─ useState initializes jadwalList = []
         ├─ useState initializes selectedKategori = null
         └─ useState initializes errors = {}

T=10ms   │ useEffect #1 Triggers (user dependency)
         ├─ Check if user exists
         ├─ If yes: setFormData.nama = user.nama
         ├─ If yes: setFormData.noHp = user.no_hp
         └─ [Fields now pre-filled]

T=15ms   │ useEffect #2 Triggers (mount - fetch jadwal)
         ├─ fetch(\"/api/jadwal-penyetoran\")
         └─ [Waiting for response...]

T=20ms   │ useEffect #3 Triggers (geolocation)
         ├─ navigator.geolocation.getCurrentPosition()
         └─ [Asking browser for permission...]

T=100ms  │ Jadwal API Response
         ├─ setJadwalList with active schedules
         └─ [Dropdown now populated]

T=500ms  │ User Approves Location Permission
         ├─ Browser returns GPS coordinates
         ├─ Convert to Google Maps link
         ├─ setFormData.lokasi = \"https://maps...\"
         └─ [Location field now auto-filled]

T=600ms  │ Form Fully Rendered & Ready
         ├─ Name: Filled ✓
         ├─ Phone: Filled ✓
         ├─ Location: Filled ✓
         ├─ Schedule: Options available ✓
         ├─ Category: Selectable ✓
         └─ Photo: Uploadable ✓

T=700ms  │ User Selects Schedule
         └─ handleChange → setFormData.jadwalId = 3

T=1000ms │ User Selects Category \"Plastik\"
         ├─ KategoriSampahWrapper.handleCategoryClick(\"Plastik\", \"Plastik\")
         ├─ Calls: onSelectionChange(\"Plastik\", \"Plastik\")
         ├─ FormSetorSampah.handleKategoriChange triggered
         ├─ setSelectedKategori = \"Plastik\"
         ├─ setFormData.jenis = \"Plastik\"
         └─ [Category selected, state updated]

T=1500ms │ User Uploads Photo
         ├─ handleChange → setFormData.foto = File
         └─ [Photo ready]

T=2000ms │ User Clicks \"Ajukan Penjemputan\"
         ├─ handleSubmit() executes
         ├─ validate() checks all fields ✓
         ├─ POST request sent
         ├─ setLoading = true
         └─ [Button shows \"Mengirim...\"]

T=3500ms │ Backend Response Success
         ├─ setLoading = false
         ├─ Alert(\"Setor sampah berhasil!\")
         ├─ Reset formData
         ├─ onClose()
         └─ Form closes ✓

T=3600ms │ Unmount
         └─ Component destroyed
```

---

## Error Handling Flow

```
Error Scenarios & Handling:

1. Geolocation Denied
   ├─ navigator.geolocation.getCurrentPosition() fails
   ├─ error handler: (error) => console.warn()
   └─ Result: Silent fail, user can enter manually

2. Missing User Data
   ├─ user?.nama returns undefined
   ├─ Fallback: user.name
   ├─ If still undefined: \"\"
   └─ Result: Field empty but doesn't crash

3. API Jadwal Failed
   ├─ catch(err) triggered
   ├─ console.error() logged
   ├─ alert(\"Gagal memuat jadwal penyetoran\")
   └─ Result: Alert shown, user can try again

4. Form Validation Failed
   ├─ validate() returns { jenis: \"...\", foto: \"...\" }
   ├─ setErrors() updates state
   ├─ Early return (don't submit)
   └─ Result: Error messages appear on form

5. Network Error on Submit
   ├─ try/catch catches error
   ├─ setLoading(false)
   ├─ alert(error.message)
   └─ Result: Error message shown

6. Backend Validation Error (422)
   ├─ res.ok === false
   ├─ Parse result.errors
   ├─ setErrors(backendErrors)
   ├─ alert() detailed error
   └─ Result: User sees what went wrong

7. Unauthorized (401)
   ├─ No token in localStorage
   ├─ Backend returns 401
   └─ Result: User should re-login
```

---

This comprehensive visualization helps understand the complete data flow from user interaction through database storage! 🎯
