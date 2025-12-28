# 📋 QUICK REFERENCE - Prompt untuk Backend Team

## Copy-Paste Version (Simplest)

---

### **Untuk Dikirim Langsung:**

```
Hai Backend Team,

Production frontend mengalami timeout/404 errors pada endpoint berikut:

❌ GET /api/dashboard/stats/{userId} - Timeout >5s (target: <1s)
❌ GET /api/users/{userId}/badges - Timeout >5s (target: <2s)
❌ GET /api/penukaran-produk/user/{userId} - 404 Error
❌ GET /api/penarikan-tunai/user/{userId} - 404 Error
❌ GET /api/users/{userId}/aktivitas - 404 Error

Frontend sudah dioptimasi dengan:
✅ PWA + Service Worker caching
✅ 5-second timeout protection
✅ Lazy loading pages
✅ Code splitting
✅ Parallel API calls

Tapi masih timeout karena backend response lambat.

Kami butuh:
1. Database indexes pada user_id columns
2. Query optimization (cek N+1 queries)
3. Implementasi 3 missing endpoints
4. Response time <2s untuk semua endpoint

Detailed request + SQL samples: BACKEND_OPTIMIZATION_REQUEST.md

Berapa ETA untuk fix?

Thanks,
Frontend Team
```

---

## Untuk Berbagai Channel

### **Slack (10 detik untuk dibaca):**
```
🚨 Frontend production timeout issues on these endpoints:
- /api/dashboard/stats/{userId} - ⏱️ >5s (tgt: <1s)
- /api/users/{userId}/badges - ⏱️ >5s (tgt: <2s)
- 3 activity endpoints - ❌ 404

Root cause: Slow queries + missing endpoints

Frontend sudah done optimizing. Backend team needed to:
□ Add DB indexes (user_id)
□ Optimize queries (N+1?)
□ Implement missing endpoints
□ Target: <2s response

Details: BACKEND_OPTIMIZATION_REQUEST.md

ETA? 🙏
```

---

### **Email Formal (Professional):**

Subject: **[URGENT] Backend Performance Optimization Request - Production Blocking**

```
Dear Backend Team,

I hope this email finds you well. The frontend team has completed optimization work
on production, including PWA implementation, service worker caching, and lazy loading.

However, we've identified that certain backend endpoints are causing production 
performance issues:

CRITICAL (Blocking Dashboard):
- GET /api/dashboard/stats/{userId} - Response time >5 seconds (Target: <1s)
- GET /api/users/{userId}/badges - Response time >5 seconds (Target: <2s)

BLOCKING (Missing Functionality):
- GET /api/penukaran-produk/user/{userId} - Returns 404
- GET /api/penarikan-tunai/user/{userId} - Returns 404
- GET /api/users/{userId}/aktivitas - Returns 404

Frontend has already implemented:
✓ PWA with intelligent caching (NetworkFirst for API, CacheFirst for images)
✓ 5-second request timeout with fallback
✓ Parallel API calls with Promise.allSettled
✓ Lazy loading for pages
✓ Code splitting for vendors

The remaining bottleneck is backend response time. Could you please review and 
prioritize:

1. Database index optimization on user_id columns
2. Query optimization (check for N+1 queries)
3. Implementation of missing endpoints
4. Cache layer for frequently accessed data (leaderboard, badges)

I've prepared a detailed technical request document with SQL recommendations 
and optimization strategies: BACKEND_OPTIMIZATION_REQUEST.md

Would appreciate an ETA on when these optimizations can be completed.

Thank you for your attention to this matter.

Best regards,
[Your Name]
Frontend Team
```

---

### **Whatsapp/Chat Casual (Ke Teman Developer):**
```
Hey! Frontend done optimizing. Tapi dashboard performance masih jelek karena 
backend timeout.

Stats endpoint butuh >5s, harus dioptimasi jadi <1s. Plus ada 3 endpoints yang 
error 404 - perlu diimplement.

Mostly need:
- DB indexes
- Query optimization
- Fix missing endpoints

Check file: BACKEND_OPTIMIZATION_REQUEST.md for details + SQL samples.

Bisa bantu gak? 😅
```

---

## One-Liner Summary

**Jika diminta ringkas maksimal 1 baris:**

```
Backend endpoints timeout/404 - need query optimization + database indexes + 
implement missing endpoints. Details in BACKEND_OPTIMIZATION_REQUEST.md
```

---

## Questions to Expect & Counter-Arguments

**Backend mungkin bilang:**
| Claim | Response |
|-------|----------|
| "API calls should be cached on frontend" | ✅ Done - we have PWA caching. But still timeout. |
| "It's network latency" | ❌ No - Railway to Railway should be <100ms. Query must be slow. |
| "We'll optimize later" | ⏰ Blocking production - can't deploy with poor UX. |
| "Database is fine" | 🔍 Have you checked slow query log? Check for N+1 queries? |
| "Just increase timeout" | 👎 No - that's masking the problem, not fixing it. |
| "It works on localhost" | 💾 Localhost doesn't have production data volume. |

---

## Files to Attach/Share

1. **BACKEND_OPTIMIZATION_REQUEST.md** - Full technical details
   - Root cause analysis
   - Performance targets & metrics
   - SQL & PHP code samples
   - Database index suggestions
   - Caching strategies

2. **HARDCODED_URLS_FIXED.md** - Show frontend did their part
   - Fixed all localhost URLs
   - Added PWA
   - Performance optimizations complete

3. **Console error screenshot** - Proof of production issues
   - Timeout errors
   - 404 errors
   - Actual user impact

---

## Timeline Suggestion

**If backend says "too much work":**

```
Priority 1 (This week):
- Add indexes on user_id
- Implement missing 3 endpoints
- ETA for <2s response?

Priority 2 (Next week):
- Query optimization (eager loading, caching)
- Leaderboard cache

We need Priority 1 to deploy.
```

---

## Success Metrics

Setelah backend fix, metrics harus jadi:

```javascript
// From browser console after backend optimization
{
  "dashboard_stats": "950ms",      // ✅ Was: timeout
  "user_badges": "1200ms",         // ✅ Was: timeout
  "user_activities": "1400ms",     // ✅ Was: 404
  "page_load_first_visit": "2500ms", // ✅ Good
  "page_load_repeat": "300ms",     // ✅ With cache
  "install_pwa_available": true    // ✅ Bonus
}
```

---

## Pro Tips

✅ **DO:**
- Be specific with endpoints & timings
- Provide SQL/code samples
- Show you've optimized frontend
- Offer to help debugging
- Set deadline (production is broken)

❌ **DON'T:**
- Blame backend ("your code is bad")
- Demand without explaining
- Send huge walls of text (summarize first)
- Ignore their constraints
- Threaten escalation (unless really needed)

---

## Template Response to Expect

```
Status: [Not Started / In Progress / Completed]
ETA: [Date]

What we're doing:
- Adding indexes: [% complete]
- Fixing endpoints: [% complete]
- Query optimization: [% complete]

Blockers: [None / describe]

We'll have results by [date]
```

---

**Good luck! 🚀 Backend team should appreciate the detailed request.**
