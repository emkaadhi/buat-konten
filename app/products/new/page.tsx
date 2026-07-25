"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface FormErrors {
  name?: string;
  price?: string;
  description?: string;
  images?: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const newErrors: FormErrors = {};

    // Check total files
    if (files.length + selected.length > MAX_FILES) {
      newErrors.images = `Maksimal ${MAX_FILES} gambar.`;
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // Validate each file
    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.images = `${file.name} tidak didukung. Gunakan JPEG, PNG, WebP, atau AVIF.`;
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.images = `${file.name} terlalu besar. Maksimal 5MB per file.`;
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }
    }

    // Clear image errors
    setErrors((prev) => ({ ...prev, images: undefined }));

    // Add files
    const newFiles = [...files, ...selected];
    setFiles(newFiles);

    // Generate previews
    const newPreviews = [...previews];
    for (const file of selected) {
      newPreviews.push(URL.createObjectURL(file));
    }
    setPreviews(newPreviews);
  }

  function removeFile(index: number) {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    // Attach files with the right field names
    files.forEach((file, i) => {
      formData.set(`image_${i}`, file);
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan produk.");
      }

      const data = await res.json();
      router.push(`/products/${data.product.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Buat Produk Baru</h1>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Produk */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Kemeja Flanel Premium"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Harga */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Harga (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: 150000"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Deskripsi */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Deskripsi Produk <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            maxLength={2000}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Jelaskan keunggulan produk Anda..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* Upload Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gambar Produk <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Maksimal {MAX_FILES} gambar. Format: JPEG, PNG, WebP, AVIF.
            Maksimal 5MB per file.
          </p>

          {/* Drop zone / upload button */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-500">
                Klik untuk upload gambar
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={files.length >= MAX_FILES}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
          )}

          {/* Preview images */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {previews.map((preview, i) => (
                <div key={i} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting || files.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Menyimpan..." : "Simpan Produk"}
        </button>
      </form>
    </main>
  );
}