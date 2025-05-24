# 🧪 TEST SENARYOSU - Advanced Keywords

## ⚡ 2 DAKİKADA HIZLI TEST

### 1️⃣ SAYFA ERİŞİMİ (30s)
```
✅ http://localhost:8080 → Login
✅ Sidebar → "Advanced Keywords" (TrendingUp icon)
✅ Sayfa açılsın: "Advanced Keyword Analysis" başlığı görünsün
```

### 2️⃣ BASİT ANALİZ (60s)  
```
✅ Keyword: "coffee" gir
✅ Region: "United States" seç
✅ "Analyze Keyword" tıkla
✅ 10-15s içinde sonuç gelsin
```

### 3️⃣ SONUÇ KONTROLÜ (30s)
```
✅ 4 overview kartı dolu olsun:
   - Trend: rising/stable/declining  
   - Avg Interest: sayı (0-100)
   - Competition: Low/Medium/High
   - Search Volume: "X searches/month"

✅ Trend chart çizilsin (mavi çizgi)
✅ Related Queries listesi dolsun
```

### 4️⃣ ERROR TEST (30s)
```
✅ Boş keyword → "Keyword is required" 
✅ 120 karakter keyword → "must not exceed 100 characters"
```

---

## 🎯 BAŞARI KRİTERLERİ:

- [ ] Sayfa açılıyor
- [ ] Form çalışıyor  
- [ ] API yanıtlıyor
- [ ] Sonuçlar görünüyor
- [ ] Error handling aktif

**EĞER 4/5 ✅ İSE BAŞARILI!** 🚀

---

## 🐛 MUHTEMEL HATALAR:

1. **"Failed to analyze keyword"** → Backend problemi
2. **Loading sonsuz** → API timeout  
3. **"Authentication failed"** → JWT token sorunu
4. **Boş chart** → Trend data processing hatası
5. **Quota çalışmıyor** → Database/middleware sorunu

## 🔧 DEBUG KOMUTLARI:

```bash
# Backend logs kontrol
tail -f backend/logs.txt

# Network requests kontrol  
Browser DevTools → Network tab

# Database kontrol
sqlite3 backend/db/zippify.db "SELECT * FROM google_trends_cache;"
``` 