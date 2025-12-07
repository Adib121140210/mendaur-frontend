# 🎨 Redemption History - User Interface Guide

## 📱 What Users Will See

### 1. **Riwayat Transaksi Page** (History Page)
Navigate to: **Riwayat Transaksi** from sidebar

---

## 🎯 Redemption Card States

### ⏳ **PENDING Status** (Waiting for Approval)
```
┌─────────────────────────────────────────────┐
│ Penukaran Tas Ramah Lingkungan      -500 poin ↓│
│ Penukaran Produk                            │
│                                             │
│ 📦 Tas Ramah Lingkungan                     │
│                                             │
│ 📅 18 Nov 2025    🕒 10:30                 │
│ 🔄 Menunggu Persetujuan                    │
└─────────────────────────────────────────────┘
```
**Visual Details:**
- Orange RefreshCcw icon
- Yellow/orange badge
- No special instructions yet

---

### ✅ **APPROVED Status** (Ready to Claim)
```
┌─────────────────────────────────────────────────────┐
│ Penukaran Tas Ramah Lingkungan        -500 poin ↓  │
│ Penukaran Produk                                    │
│                                                     │
│ 📦 Tas Ramah Lingkungan                             │
│                                                     │
│ ╔═════════════════════════════════════════════╗    │
│ ║ ✓ Silakan datang ke kantor Bank Sampah     ║    │
│ ║   untuk mengambil produk                    ║    │
│ ╚═════════════════════════════════════════════╝    │
│                                                     │
│ 📅 18 Nov 2025    🕒 10:30                         │
│ ✓ Disetujui - Siap Diambil                        │
└─────────────────────────────────────────────────────┘
```
**Visual Details:**
- **Gradient green box** with claim instructions
- Left border in dark green (#047857)
- Green CheckCircle icon
- Green "Disetujui - Siap Diambil" badge
- Prominent and easy to spot

---

### 🎉 **CLAIMED Status** (Already Picked Up)
```
┌─────────────────────────────────────────────┐
│ Penukaran Tas Ramah Lingkungan  -500 poin ↓│
│ Penukaran Produk                            │
│                                             │
│ 📦 Tas Ramah Lingkungan                     │
│                                             │
│ ✓ Diambil pada 20 Nov 2025                 │
│   (Light green background)                  │
│                                             │
│ 📅 18 Nov 2025    🕒 10:30                 │
│ ✓ Sudah Diambil                            │
└─────────────────────────────────────────────┘
```
**Visual Details:**
- Light green success badge showing pickup date
- Green CheckCircle icon in status
- Completed appearance

---

### ❌ **REJECTED Status** (Request Denied)
```
┌─────────────────────────────────────────────┐
│ Penukaran Tas Ramah Lingkungan  -500 poin ↓│
│ Penukaran Produk                            │
│                                             │
│ 📦 Tas Ramah Lingkungan                     │
│                                             │
│ ⚠ Alasan: Stok produk tidak tersedia       │
│   (Light red background)                    │
│                                             │
│ 📅 18 Nov 2025    🕒 10:30                 │
│ ✗ Ditolak                                   │
└─────────────────────────────────────────────┘
```
**Visual Details:**
- Red warning badge with admin note
- Red XCircle icon
- Clear rejection reason from admin

---

## 🔍 Filter & Search Features

### Status Filter Dropdown
Users can filter by:
- **Semua** - All transactions
- **Pending** - Waiting for approval
- **Approved** - Ready to claim
- **Claimed** - Already picked up
- **Rejected** - Denied requests
- (Plus other status types like shipped, delivered, etc.)

### Category Filter Buttons
- **Semua** - All activities
- **Setoran** - Waste deposits (green checkmark)
- **Penukaran** - All redemptions including products (red X icon)

### Search Box
- Type product name to find specific redemptions
- Real-time filtering as you type
- Search icon on the left

---

## 🎨 Color Coding

### Status Colors
- **Pending/Diproses**: 🟡 Orange/Yellow
- **Approved/Selesai/Claimed**: 🟢 Green
- **Rejected/Cancelled**: 🔴 Red
- **Shipped/Dikirim**: 🔵 Blue
- **Default**: ⚫ Gray

### Claim Instructions Box
- **Background**: Linear gradient from #d1fae5 (light green) to #a7f3d0 (mint green)
- **Border**: 3px solid #047857 (dark green) on the left
- **Text**: #065f46 (very dark green)
- **Icon**: #047857 (dark green)

---

## 📊 Sample Scenarios

### Scenario 1: User Makes First Redemption
1. User redeems "Tas Ramah Lingkungan" for 500 points
2. Sees **pending** card in Riwayat with orange status
3. Waits for admin approval

### Scenario 2: Admin Approves Request
1. Admin approves the redemption in backend
2. User refreshes Riwayat page
3. Sees beautiful **green claim instructions box**
4. Goes to Bank Sampah office to pick up

### Scenario 3: User Claims Product
1. User brings ID to office
2. Admin verifies and hands over product
3. Admin marks as "claimed" in system
4. User sees **success badge** with pickup date

### Scenario 4: Request Gets Rejected
1. Admin finds issue (out of stock, duplicate request, etc.)
2. Admin rejects with reason
3. User sees **red admin note** explaining why
4. User can make new request if issue resolved

---

## 🛠️ Technical Notes

### API Endpoint
```
GET http://127.0.0.1:8000/api/penukaran-produk
Authorization: Bearer {token}
```

### Required Backend Response
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "produk_id": 5,
      "nama_produk": "Tas Ramah Lingkungan",
      "jumlah_poin": 500,
      "jumlah": 1,
      "status": "approved",
      "catatan_admin": null,
      "created_at": "2025-11-18T10:30:00.000Z",
      "approved_at": "2025-11-18T14:00:00.000Z",
      "claimed_at": null,
      "rejected_at": null
    }
  ]
}
```

### Status Workflow
```
pending → approved → claimed
           ↓
        rejected
```

---

## ✨ Key Features

### ✅ Real-Time Updates
- Refresh page to see status changes
- No page reload needed for filters

### ✅ Clear Visual Hierarchy
- Most important info (claim instructions) stands out
- Color coding helps quick identification
- Icons provide visual cues

### ✅ Mobile Responsive
- Cards stack nicely on small screens
- Touch-friendly buttons
- Readable text sizes

### ✅ Accessibility
- High contrast colors
- Clear status labels
- Icon + text combinations

---

## 📱 User Actions

### What Users Can Do:
1. ✅ View all redemption requests
2. ✅ Filter by status (pending, approved, claimed, rejected)
3. ✅ Search by product name
4. ✅ See claim instructions when approved
5. ✅ Check rejection reasons
6. ✅ View pickup dates for claimed items
7. ✅ See transaction date/time
8. ✅ Track points spent

### What Users Cannot Do (Yet):
- ❌ Cancel pending requests
- ❌ Download history as PDF
- ❌ Upload proof of pickup
- ❌ Rate products after claiming
- ❌ Re-request rejected items directly

---

## 🎯 Business Logic

### For Users:
- **Pending**: "Your request is being reviewed"
- **Approved**: "Come pick up your product!"
- **Claimed**: "You already got this item"
- **Rejected**: "Request denied - see reason"

### For Admins (Backend):
- Approve requests → Set status to "approved"
- Reject requests → Set status to "rejected" + add catatan_admin
- Mark as claimed → Set status to "claimed" + update claimed_at timestamp

---

## 🚀 Ready to Use!

**Frontend Status**: ✅ **100% Complete**
- All UI components implemented
- Responsive design working
- Filter & search functional
- Status badges styled
- Claim instructions designed

**Backend Status**: ⏳ **Needs Implementation**
- Create GET endpoint: `/api/penukaran-produk`
- Return user's redemptions with product details
- Support authentication via Bearer token
- Include all status fields

**Testing**: Ready once backend endpoint is live!

