# Form Setor Sampah - Quick Reference ⚡

## Implementation Summary

### ✅ What Now Works Automatically

| Feature | Before | After |
|---------|--------|-------|
| **Name Entry** | User types manually | ✅ Auto-filled from account |
| **Phone Entry** | User types manually | ✅ Auto-filled from account |
| **Location** | Must click button | ✅ Auto-detected on form open |
| **Waste Category** | No selection system | ✅ Full interactive selection |
| **Database Tracking** | No category/location data | ✅ Stores category & GPS coords |

---

## User Flow

```
1. User clicks "Ajukan Penjemputan"
   ↓
2. Form opens (3 things happen instantly):
   ├─→ Name auto-filled from account (read-only)
   ├─→ Phone auto-filled from account (read-only)
   └─→ GPS location auto-detected (waiting for permission)
   ↓
3. User selects:
   ├─→ Schedule date/time
   ├─→ Waste category (with color icons)
   └─→ Upload waste photo
   ↓
4. Click Submit
   ↓
5. All data sent to backend:
   {
     user_id, jadwal_id, nama_lengkap, no_hp, 
     titik_lokasi, jenis_sampah, foto_sampah
   }
   ↓
6. Backend receives & validates
   ↓
7. Success! "Setor sampah berhasil!"
```

---

## Code Changes At-a-Glance

### FormSetorSampah.jsx
```javascript
// NEW: Import auth
import { useAuth } from "../Pages/context/AuthContext";

// NEW: Get user data
const { user } = useAuth();

// NEW: Add kategori state
const [selectedKategori, setSelectedKategori] = useState(null);

// NEW: Auto-populate & auto-track on mount
useEffect(() => {
  if (user) {
    setFormData(prev => ({
      ...prev,
      nama: user.nama || "",
      noHp: user.no_hp || "",
    }));
  }
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const mapsLink = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
      setFormData(prev => ({ ...prev, lokasi: mapsLink }));
    });
  }
}, [user]);

// NEW: Handle kategori selection
const handleKategoriChange = (kategoriId, kategoriLabel) => {
  setSelectedKategori(kategoriId);
  setFormData(prev => ({ ...prev, jenis: kategoriLabel }));
};
```

### kategoriSampah.jsx
```javascript
// NEW: Add onSelectionChange prop
export default function KategoriSampahWrapper({ 
  selectedKategori, 
  setSelectedKategori, 
  onSelectionChange  // NEW
}) {
  
  // NEW: Handle category click with callback
  const handleCategoryClick = (kategoriId, kategoriLabel) => {
    const newSelection = selectedKategori === kategoriId ? null : kategoriId;
    setSelectedKategori(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection, kategoriLabel);
    }
  };
  
  // ... rest of component
}
```

---

## Data Sent to Backend

```javascript
FormData {
  user_id: 1,
  jadwal_id: 3,
  nama_lengkap: "Adib Surya",          // AUTO-FILLED
  no_hp: "081234567890",               // AUTO-FILLED
  titik_lokasi: "https://maps.com?...", // AUTO-TRACKED
  jenis_sampah: "Plastik",             // USER-SELECTED
  foto_sampah: File<image>,            // USER-UPLOADED
}
```

### Database Impact
Now the backend/database can track:
- **WHAT**: Jenis sampah (Plastik, Kertas, Logam, etc.)
- **WHERE**: Koordinat GPS (titik_lokasi)
- **WHO**: User ID
- **WHEN**: Timestamp
- **WHEN**: Schedule (jadwal_id)

This enables:
- 🗺️ Map visualization of waste collection
- 📊 Category breakdown reports
- 👤 User history and patterns
- 🎯 Zone-based pickup optimization

---

## Waste Categories Available

| Category | Color | Icon | Examples |
|----------|-------|------|----------|
| **Kertas** | 🔵 Blue | 📄 | Kardus, kertas bekas, majalah |
| **Plastik** | 🟢 Green | 🛍️ | Botol, tas, bungkus plastik |
| **Logam** | ⚫ Gray | 🔨 | Kaleng, besi, alumunium |
| **Tekstil** | 🟣 Purple | 👕 | Baju, kain, sepatu bekas |
| **Elektronik** | 🟡 Yellow | 💻 | HP, TV, laptop lama |
| **Lainnya** | 🟠 Orange | 📦 | Campuran / lainnya |

---

## Browser Permissions Required

1. **Geolocation**: Needed for automatic location detection
   - Triggered when form opens
   - User will see browser permission prompt
   - If approved: Location auto-fills
   - If denied: User can enter manually

2. **Camera** (optional): For photo upload
   - Android/iOS may offer camera as option
   - User can choose camera or gallery

---

## Error Handling

| Scenario | What Happens |
|----------|-------------|
| Geolocation blocked | Silent fail - user enters location manually |
| User not logged in | Fields remain empty, form shows validation error |
| No internet | Form opens but location won't detect |
| User denies permission | OK - they can manually enter location |
| File too large | Backend returns 422 validation error |

---

## Testing the Implementation

### Test 1: Auto-Fill
✅ Log in with user account
✅ Open form
✅ Check name & phone are filled
✅ Verify they're read-only (can't edit)

### Test 2: Auto-Location
✅ Open form
✅ Allow location permission
✅ Wait 2-3 seconds
✅ Check lokasi field has Google Maps link
✅ Try clicking "Perbarui Lokasi Saya" - should update

### Test 3: Category Selection
✅ Click a color category card
✅ Card highlights with border
✅ Console shows "✅ Kategori dipilih: X"
✅ Click same category again - deselects
✅ "✅ Kategori terseleksi: X" message appears

### Test 4: Form Submit
✅ Fill all required fields
✅ Click "Ajukan Penjemputan"
✅ Check network tab in DevTools
✅ Verify FormData sent includes:
   - jenis_sampah: "Plastik" (category selected)
   - titik_lokasi: "https://maps.com?q=..." (GPS link)
✅ Backend receives all data correctly

---

## Deployment Checklist

- [ ] FormSetorSampah.jsx updated ✅
- [ ] kategoriSampah.jsx updated ✅
- [ ] useAuth import added ✅
- [ ] Auto-fill logic implemented ✅
- [ ] Auto-location logic implemented ✅
- [ ] Category selection handler added ✅
- [ ] Backend expects new `jenis_sampah` field ✅
- [ ] Database stores GPS coordinates ✅
- [ ] No console errors on form open ✅
- [ ] Form submits successfully ✅
- [ ] Backend receives all fields ✅
- [ ] Database records category & location ✅

---

## Next Steps (Future)

1. **Photo Preview**: Show thumbnail before submit
2. **Map Integration**: Show GPS location on interactive map
3. **Confirmation Email**: Send receipt with category & location
4. **Analytics Dashboard**: Show where most waste comes from
5. **Rewards Calculator**: Show estimated points user will earn
6. **Bulk Pickup**: Remember favorite categories/locations

---

## Support

### Common Issues

**Q: Location not detecting?**
A: Check in browser address bar - is there a lock 🔒 or location icon? If not, allow permissions.

**Q: Category not saving?**
A: Check console for errors. Make sure jenis_sampah field has value before submit.

**Q: Can I edit name/phone?**
A: No, they're auto-filled from your account. Update them in your profile settings.

**Q: Can I change location after?**
A: Yes, click "Perbarui Lokasi Saya" button anytime.

---

**Status**: ✅ **PRODUCTION READY**
