import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
        Buat Video Promosi Produk
        <br />
        <span className="text-gray-500">Dalam Hitungan Menit</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-500">
        Upload foto produk, isi harga & deskripsi, pilih template — AI kami
        otomatis bikin naskah hook, caption, CTA dan render video 15–20 detik
        siap upload ke TikTok, Instagram, dan Reels.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="rounded-xl bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
        >
          Mulai Gratis
        </Link>
        <Link
          href="/login"
          className="rounded-xl border px-6 py-3 font-medium transition-colors hover:bg-gray-50"
        >
          Login
        </Link>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border p-6 text-left">
          <div className="mb-2 text-2xl">📝</div>
          <h3 className="font-semibold">Input Produk</h3>
          <p className="mt-1 text-sm text-gray-500">
            Nama, harga, deskripsi + upload sampai 3 foto
          </p>
        </div>
        <div className="rounded-xl border p-6 text-left">
          <div className="mb-2 text-2xl">🤖</div>
          <h3 className="font-semibold">AI Generate</h3>
          <p className="mt-1 text-sm text-gray-500">
            Hook, caption, CTA, dan script per-scene otomatis
          </p>
        </div>
        <div className="rounded-xl border p-6 text-left">
          <div className="mb-2 text-2xl">🎬</div>
          <h3 className="font-semibold">Render Video</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pilih template, render async, download mp4 siap upload
          </p>
        </div>
      </div>
    </div>
  );
}