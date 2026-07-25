# PRD — Aplikasi Auto-Generate Video Konten Produk

## 1. Ringkasan

Aplikasi web yang mengubah data produk (nama, harga, deskripsi, foto) menjadi video promosi pendek (15–20 detik) siap posting ke TikTok, Instagram, dan Facebook — tanpa skill editing video. User cukup input data, pilih template, dan sistem otomatis membuat naskah/copy dengan AI serta merender video.

**Tech stack**
- Frontend & backend: Next.js (App Router)
- Database: Neon (Postgres, serverless)
- Animasi UI: Framer Motion (untuk transisi UI, bukan render video)
- Render video: Remotion *atau* API render hosted (Creatomate/Shotstack) — lihat bagian 6
- AI teks: Gemini API atau DeepSeek API
- Storage file: Vercel Blob / Cloudflare R2
- Job queue: Inngest atau Trigger.dev (untuk proses render async)

---

## 2. Problem Statement

UMKM dan reseller online kesulitan membuat konten video promosi yang konsisten dan cepat untuk platform short-video. Proses manual (foto → edit → tulis caption → render) memakan waktu dan butuh skill desain/editing yang tidak semua orang punya.

## 3. Goals

- User dapat menghasilkan video 15–20 detik dari input produk dalam < 5 menit
- Tidak memerlukan skill desain/editing video sama sekali
- Output otomatis dalam format vertikal (9:16) sesuai kebutuhan TikTok/Reels/Shorts

## 4. Non-Goals (v1)

- Bukan full video editor manual (tidak ada timeline editing)
- Bukan auto-publish langsung ke TikTok/IG/FB (user download & upload manual dulu)
- Tidak mendukung multi-bahasa di tahap awal (fokus Bahasa Indonesia)
- Tidak ada kolaborasi tim/multi-user per project di MVP

## 5. Target User

- Reseller/dropshipper online
- Pemilik UMKM yang jualan di marketplace/social commerce
- Admin toko online yang perlu produksi konten harian dengan cepat

---

## 6. Keputusan Teknis Penting: Render Engine

Framer Motion **tidak bisa** menghasilkan file video (.mp4) — dia hanya animasi di browser. Untuk render video sungguhan, ada dua opsi:

| Opsi | Kelebihan | Kekurangan |
|---|---|---|
| **Remotion** (video dari komponen React, render di server) | Kontrol penuh, skill React langsung terpakai, cocok jangka panjang | Setup render infra sendiri (butuh compute, bukan serverless-friendly), ada lisensi berbayar untuk perusahaan di atas revenue tertentu — cek dulu |
| **API render hosted** (Creatomate, Shotstack, JSON2Video) | Setup cepat, tidak perlu urus infra render, cocok untuk validasi MVP | Biaya per-render (usage-based), kontrol desain template lebih terbatas |

**Rekomendasi:** Mulai dari API hosted untuk MVP → migrasi ke Remotion kalau volume sudah besar dan butuh efisiensi biaya jangka panjang.

Render video butuh waktu (detik hingga menit), jadi wajib pakai job queue async — jangan render langsung di API route Next.js karena akan kena timeout serverless function.

---

## 7. Fitur MVP

1. **Auth** — login sederhana (email atau Google OAuth)
2. **Form input produk**
   - Nama produk
   - Harga
   - Deskripsi singkat
   - Upload gambar (maksimal 3, validasi ukuran & format)
3. **Pilihan CTA**
   - Preset: "Order Now", "DM to Order", "Cek Link di Bio", dll
   - Opsi custom text
4. **AI copy generation** (Gemini/DeepSeek)
   - Hook line (kalimat pembuka penarik perhatian)
   - Caption untuk posting
   - Script per-scene (teks overlay tiap adegan video)
5. **Pilihan template video** — 3–5 preset siap pakai (bukan dari nol), durasi 15–20 detik
6. **Render video** — proses async dengan status (queued → processing → done/failed)
7. **Preview & download** — preview hasil, download mp4
8. **Riwayat project** — daftar video yang sudah dibuat user

## 8. Fitur v2 (Nice to Have, di luar MVP)

- Publish langsung ke TikTok/IG via API resmi masing-masing platform
- Custom brand kit (logo, warna, font khusus)
- Voice over otomatis (text-to-speech)
- Generate beberapa varian caption/CTA sekaligus (A/B variant)
- Analitik performa video (jika terhubung ke platform)

---

## 9. User Flow

1. User login
2. Buat project baru → isi form: nama produk, harga, deskripsi, upload max 3 gambar
3. Pilih CTA (preset atau custom)
4. Sistem panggil AI (Gemini/DeepSeek) → generate hook, caption, script per-scene
5. User review/edit hasil AI (opsional, tapi disarankan ada supaya user bisa koreksi)
6. User pilih template video
7. Submit → job render masuk antrian (async)
8. User dapat notifikasi saat render selesai
9. Preview video → download atau lanjut ke project baru

## 10. Data Model

```
users
  id, email, name, plan, created_at

products
  id, user_id (FK), name, price, description, image_urls[], created_at

generated_copy
  id, product_id (FK), hook, caption, script_json, cta_text, created_at

templates
  id, name, duration_seconds, config_json, preview_url

renders
  id, product_id (FK), template_id (FK), status, video_url, error_message, created_at, completed_at
```

## 11. Arsitektur Alur Sistem

```
User Input (form + upload gambar)
        ↓
Next.js API Route → simpan ke Neon DB (produk) + upload gambar ke Blob/R2
        ↓
Panggil Gemini/DeepSeek API → generate copy (hook, caption, script, CTA)
        ↓
User pilih template video
        ↓
Trigger job render (async, via Inngest/Trigger.dev) → Remotion / API render hosted
        ↓
Video hasil disimpan ke storage (Blob/R2)
        ↓
Notifikasi ke user → preview, download, share manual
```

## 12. Non-Functional Requirements

- **Performance**: proses input hingga masuk antrian render < 5 detik
- **Reliability**: retry otomatis jika render gagal (max 2x), tampilkan error jelas ke user jika tetap gagal
- **Storage**: gambar & video disimpan di object storage (bukan di DB), simpan hanya URL/reference
- **Format output**: video vertikal 9:16, resolusi minimum 1080x1920, mp4 H.264
- **Cost control**: batasi jumlah render per user/hari di tier gratis (jika ada model freemium)

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Render video lambat/timeout | Pakai job queue async, jangan render sinkron di API route |
| Biaya API render hosted membengkak | Set limit render per user, monitor usage, evaluasi migrasi ke Remotion jika volume besar |
| AI generate klaim produk yang salah/berlebihan | Beri disclaimer, sediakan tombol edit manual sebelum render final |
| Lisensi Remotion untuk komersial | Cek term lisensi sebelum pakai di skala production/komersial |
| Aspect ratio/kualitas gambar user tidak konsisten | Validasi & auto-crop/resize gambar saat upload |

## 14. Metrik Sukses (MVP)

- Waktu rata-rata dari input produk sampai video selesai render
- Tingkat penyelesaian (berapa % user yang submit produk berhasil sampai download video)
- Jumlah video yang di-generate per user per minggu
- Retention: user kembali membuat project baru dalam 7 hari

---

## 15. Roadmap Build (Urutan Disarankan)

1. Skeleton: Next.js + Neon (Drizzle/Prisma ORM) — CRUD produk + upload gambar ke object storage
2. Integrasi AI teks: endpoint panggil Gemini/DeepSeek dengan prompt terstruktur → output JSON (hook, caption, cta, script per-scene)
3. Pilih & integrasikan render engine (mulai dari API hosted untuk kecepatan MVP)
4. Setup job queue untuk proses render async + notifikasi status
5. UI preview & download hasil video
6. Testing end-to-end, lalu iterasi ke fitur v2
