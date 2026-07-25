# FLOW.md — User Flow & System Flow

## 1. User Flow (Perspektif Pengguna)

1. **Login** — email atau Google OAuth
2. **Buat project baru** — klik "Buat Video Baru"
3. **Input data produk**
   - Nama produk (wajib)
   - Harga (wajib)
   - Deskripsi singkat (wajib)
   - Upload gambar, maksimal 3 (wajib minimal 1)
4. **Pilih CTA** — pilih dari preset ("Order Now", "DM to Order", "Cek Bio") atau tulis custom
5. **Generate AI copy** — sistem panggil AI, tampilkan hasil: hook, caption, script per-scene
6. **Review & edit copy** — user bisa edit teks hasil AI sebelum lanjut (penting: jangan langsung render tanpa review, untuk hindari klaim produk yang salah)
7. **Pilih template video** — tampilkan 3–5 pilihan dengan preview thumbnail/gif
8. **Submit render** — user klik "Buat Video"
9. **Menunggu proses** — tampilkan status jelas (queued → processing), user boleh tinggalkan halaman
10. **Notifikasi selesai** — in-app notification atau badge di halaman riwayat
11. **Preview hasil** — tonton video di browser
12. **Download** — download mp4
13. **(Opsional) Buat varian baru** — reuse data produk yang sama, ganti template atau edit copy, render ulang

---

## 2. System Flow (Perspektif Teknis)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT (Next.js)                                          │
│    Form input produk + upload gambar                         │
└───────────────────────┬───────────────────────────────────────┘
                         │ POST /api/products
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. API ROUTE                                                  │
│    - Validasi input                                           │
│    - Upload gambar ke Blob/R2 → dapat URL                     │
│    - Simpan produk ke Neon DB (tabel products)                │
└───────────────────────┬───────────────────────────────────────┘
                         │ POST /api/generate-copy
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. AI COPY GENERATION                                         │
│    - Kirim prompt terstruktur ke Gemini/DeepSeek API           │
│    - Parse response JSON (hook, caption, cta, script)          │
│    - Simpan ke tabel generated_copy                            │
│    - Kalau gagal parse JSON → retry 1x, lalu tampilkan error   │
└───────────────────────┬───────────────────────────────────────┘
                         │ User pilih template
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. TRIGGER RENDER JOB                                          │
│    - POST /api/render → insert row ke tabel renders            │
│      (status: queued)                                          │
│    - Kirim event ke job queue (Inngest/Trigger.dev)            │
│    - Response langsung ke client (tidak menunggu render selesai)│
└───────────────────────┬───────────────────────────────────────┘
                         │ async
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. WORKER / RENDER ENGINE                                      │
│    - Update status → processing                                │
│    - Render video (Remotion lokal/lambda ATAU panggil API      │
│      hosted seperti Creatomate/Shotstack)                      │
│    - Upload hasil mp4 ke storage                                │
│    - Update status → done, simpan video_url                    │
│    - Kalau gagal → status: failed, simpan error_message         │
└───────────────────────┬───────────────────────────────────────┘
                         │ webhook/polling
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CLIENT                                                       │
│    - Poll status render tiap beberapa detik, atau               │
│      pakai SSE/websocket untuk update realtime                  │
│    - Tampilkan notifikasi saat status = done                    │
│    - Preview & download video dari video_url                    │
└─────────────────────────────────────────────────────────────┘
```

## 3. Error Handling per Tahap

| Tahap | Kemungkinan Error | Penanganan |
|---|---|---|
| Upload gambar | File terlalu besar/format salah | Validasi client-side sebelum submit |
| AI copy generation | API timeout, response bukan JSON valid | Retry 1x otomatis, lalu tampilkan tombol "generate ulang" manual |
| Render job | Job gagal di worker | Retry otomatis max 2x, jika tetap gagal tampilkan error_message ke user + tombol "coba lagi" |
| Render job | Timeout (video terlalu lama diproses) | Set max duration di job queue, auto-fail setelah threshold (misal 5 menit) |

## 4. Catatan Implementasi

- **Jangan render secara sinkron di API route** — akan kena timeout serverless function di Vercel. Wajib pakai job queue.
- **Polling interval** disarankan 3–5 detik saat status masih `queued`/`processing`, berhenti otomatis saat `done`/`failed`.
- Simpan `completed_at` untuk analitik nanti (rata-rata waktu render).
