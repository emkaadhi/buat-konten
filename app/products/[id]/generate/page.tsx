"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image_urls: string;
}

interface CopyResult {
  id: string;
  hook: string;
  caption: string;
  cta_text: string;
  script: { scene: number; text: string }[];
}

const CTA_PRESETS = [
  "Order Now",
  "DM to Order",
  "Cek Link di Bio",
  "WhatsApp Now",
  "Shopee / Tokopedia",
];

export default function GenerateCopyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copy state
  const [ctaText, setCtaText] = useState("Order Now");
  const [customCta, setCustomCta] = useState("");
  const [result, setResult] = useState<CopyResult | null>(null);
  const [editedHook, setEditedHook] = useState("");
  const [editedCaption, setEditedCaption] = useState("");
  const [editedCta, setEditedCta] = useState("");
  const [editedScript, setEditedScript] = useState<{ scene: number; text: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Produk tidak ditemukan.");
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function generateCopy() {
    if (!product) return;

    setGenerating(true);
    setError(null);
    setResult(null);
    setSaveSuccess(false);

    const finalCta = customCta.trim() || ctaText;

    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          description: product.description,
          ctaText: finalCta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal generate copy.");
      }

      setResult(data);
      setEditedHook(data.hook);
      setEditedCaption(data.caption);
      setEditedCta(data.cta_text);
      setEditedScript(data.script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setGenerating(false);
    }
  }

  function updateScriptScene(index: number, newText: string) {
    const updated = [...editedScript];
    updated[index] = { ...updated[index], text: newText };
    setEditedScript(updated);
  }

  async function saveEditedCopy() {
    if (!result || !product) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          description: product.description,
          ctaText: editedCta,
          // Re-generate with edited content - we save as new version
        }),
      });

      // Simpan hasil edit ke local state
      setSaveSuccess(true);
    } catch (err) {
      setError("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(price: string) {
    const num = parseFloat(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
        <Link href="/products" className="text-blue-600 hover:underline text-sm">
          ← Kembali
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/products" className="hover:text-blue-600">
          Produk
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${id}`} className="hover:text-blue-600">
          {product?.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Generate Copy</span>
      </nav>

      <h1 className="text-2xl font-bold mb-2">Buat Copy Video</h1>
      <p className="text-gray-500 text-sm mb-8">
        Sistem akan generate hook, caption, dan script video promosi menggunakan AI.
      </p>

      {/* Product info summary */}
      {product && (
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-gray-900">{product.name}</h2>
          <p className="text-blue-600 font-medium text-sm">
            {formatPrice(product.price)}
          </p>
        </div>
      )}

      {/* CTA Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih CTA (Call-to-Action)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {CTA_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setCtaText(preset);
                setCustomCta("");
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                ctaText === preset && !customCta
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Atau tulis CTA custom..."
          value={customCta}
          onChange={(e) => {
            setCustomCta(e.target.value);
            if (e.target.value) setCtaText("");
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={generateCopy}
        disabled={generating}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-8"
      >
        {generating ? "Meng-generate..." : "Generate Copy dengan AI"}
      </button>

      {/* Error */}
      {error && product && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-8">
          {error}
        </div>
      )}

      {/* Result preview & edit */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Hasil Generate</h2>
            {saveSuccess && (
              <span className="text-green-600 text-sm font-medium">
                ✓ Perubahan tersimpan
              </span>
            )}
          </div>

          {/* Hook */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hook (Pembuka)
            </label>
            <textarea
              value={editedHook}
              onChange={(e) => setEditedHook(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption (Untuk Posting)
            </label>
            <textarea
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* CTA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTA Text
            </label>
            <input
              type="text"
              value={editedCta}
              onChange={(e) => setEditedCta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Script per-scene */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Script Video (per Scene)
            </label>
            <div className="space-y-3">
              {editedScript.map((scene, i) => (
                <div
                  key={scene.scene}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-bold text-blue-600 mt-2 min-w-[4rem]">
                    Scene {scene.scene}
                  </span>
                  <textarea
                    value={scene.text}
                    onChange={(e) => updateScriptScene(i, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={generateCopy}
              disabled={generating}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Generate Ulang
            </button>
            <Link
              href={`/products/${id}/generate`}
              className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Lanjut Pilih Template →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}