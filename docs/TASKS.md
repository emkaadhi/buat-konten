# TASKS.md — Breakdown Task Bertahap

Cara pakai: jalankan satu task per prompt ke Cline. Review & commit sebelum lanjut ke task berikutnya. Jangan gabung beberapa task jadi satu prompt besar.

---

## Phase 0 — Setup Project

- [x] **0.1** Init project Next.js (App Router, TypeScript, Tailwind)
- [x] **0.2** Setup Neon Postgres — buat project di neon.tech, ambil connection string, simpan di `.env.local`
- [x] **0.3** Install & setup ORM (Drizzle)
- [x] **0.4** Buat file `.clinerules` / instruksi project
- [x] **0.5** Setup storage (Vercel Blob) untuk upload gambar & video
- [x] **0.6** Push repo awal ke GitHub

**Definition of done:** project jalan lokal, konek ke Neon, deploy kosong berhasil di Vercel.

---

## Phase 1 — CRUD Produk

- [x] **1.1** Buat schema Drizzle sesuai `ERD.md` (tabel `users`, `products`) — sudah ada di `db/schema.ts`
- [x] **1.2** Migrasi database (`drizzle-kit push`) — siap, schema sudah sesuai ERD
- [x] **1.3** Buat form input produk: nama, harga, deskripsi, upload max 3 gambar (client-side validasi jumlah & ukuran file) — `app/products/new/page.tsx`
- [x] **1.4** API route untuk simpan produk + upload gambar ke storage, simpan URL ke DB — `app/api/products/route.ts` (POST) + `app/api/products/[id]/route.ts` (GET)
- [x] **1.5** Halaman list produk (riwayat project user) — `app/products/page.tsx`
- [x] **1.6** Halaman detail produk — `app/products/[id]/page.tsx`

**Definition of done:** user bisa input produk baru, gambar ke-upload, data muncul di list & detail.

---

## Phase 2 — Auth

- [x] **2.1** Setup NextAuth/Auth.js dengan Google OAuth + email login
- [ ] **2.2** Proteksi route produk (hanya user login yang bisa akses)
- [ ] **2.3** Relasikan produk ke `user_id`

**Definition of done:** user harus login untuk akses fitur, data produk ter-scope per user.

---

## Phase 3 — Integrasi AI Copy Generation

- [x] **3.1** Buat API route `/api/generate-copy` yang terima product data, panggil Gemini API
- [x] **3.2** Desain prompt terstruktur, minta output JSON: `{ hook, caption, cta_text, script: [{scene, text}] }`
- [x] **3.3** Simpan hasil generate ke tabel `generated_copy`
- [x] **3.4** UI untuk preview hasil AI + tombol edit manual sebelum lanjut — `app/products/[id]/generate/page.tsx`
- [x] **3.5** Handle error/retry kalau API AI gagal atau response bukan JSON valid

**Definition of done:** dari 1 produk, sistem hasilkan copy AI yang bisa direview & diedit user.

---

## Phase 4 — Template Video (Testing Dulu, Belum Terintegrasi Penuh)

- [x] **4.1** Ambil 2–3 template Remotion gratis (dari locomotion.pro / repo ali-abassi/remotion-templates) — digunakan sebagai referensi komponen animasi
- [x] **4.2** Coba render lokal (`npx remotion render`) — berhasil, 90 frame/3 detik video test di `out/test-modern.mp4`
- [x] **4.3** Sesuaikan template supaya bisa terima props dinamis: semua template menerima `ProductPromoProps` (productName, price, description, imageUrl, hook, cta, colors)
- [x] **4.4** Buat 3 varian preset template siap pilih user (`ModernMinimal`, `VibrantBold`, `ElegantWhite`)

**Definition of done:** minimal 1 template bisa di-render lokal dengan data dummy produk.

---

## Phase 5 — Pilih Template & Trigger Render

- [ ] **5.1** UI pilih template (preview thumbnail/gif tiap template)
- [ ] **5.2** Buat tabel `templates` & `renders` sesuai `ERD.md`
- [ ] **5.3** Setup job queue (Inngest/Trigger.dev) untuk proses render async
- [ ] **5.4** API route trigger render job → status `queued`
- [ ] **5.5** Worker/function yang render video (Remotion atau panggil API hosted seperti Creatomate)
- [ ] **5.6** Update status render (`processing` → `done`/`failed`) + simpan `video_url`

**Definition of done:** submit dari UI menghasilkan job render yang jalan di background, status ter-update di DB.

---

## Phase 6 — Notifikasi, Preview, Download

- [ ] **6.1** Polling atau websocket/SSE sederhana untuk update status render ke UI
- [ ] **6.2** Halaman preview video hasil render
- [ ] **6.3** Tombol download mp4
- [ ] **6.4** Tombol "buat project baru" dari hasil yang sama (reuse produk, ganti template)

**Definition of done:** end-to-end flow dari input produk sampai download video berjalan.

---

## Phase 7 — Polish & Testing

- [ ] **7.1** Error handling menyeluruh (upload gagal, AI gagal, render gagal)
- [ ] **7.2** Loading states & empty states di semua halaman
- [ ] **7.3** Rate limiting sederhana (batasi jumlah render per user/hari)
- [ ] **7.4** Testing end-to-end manual dengan beberapa produk berbeda
- [ ] **7.5** Review biaya aktual (API AI + render + storage) vs asumsi awal

**Definition of done:** MVP siap dipakai user beta.

---

## Backlog v2 (Setelah MVP Jalan)

- Publish langsung ke TikTok/IG via API resmi
- Custom brand kit (logo, warna, font)
- Voice over otomatis (TTS)
- A/B variant caption/CTA otomatis
- Analitik performa video