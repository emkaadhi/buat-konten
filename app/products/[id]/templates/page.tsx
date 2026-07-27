"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  duration_seconds: number;
  config_json: string;
  preview_url: string;
}

interface TemplateConfig {
  description: string;
  scenes: { name: string; duration_percent: number }[];
  colors: { primary: string; secondary: string };
}

const TEMPLATE_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  ModernMinimal: { primary: "#1a1a2e", secondary: "#e94560", bg: "#0f3460" },
  VibrantBold: { primary: "#ff6b35", secondary: "#f7c59f", bg: "#2b2d42" },
  ElegantWhite: { primary: "#1a1a2e", secondary: "#c9a96e", bg: "#faf9f6" },
};

export default function SelectTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) throw new Error("Gagal mengambil data template.");
        const data = await res.json();
        setTemplates(data.templates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  async function handleRender() {
    if (!selectedId) return;
    // Nanti akan trigger render job (Phase 5.4)
    router.push(`/products/${id}/generate`);
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
        <Link href={`/products/${id}/generate`} className="text-blue-600 hover:underline text-sm">
          ← Kembali
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/products" className="hover:text-blue-600">Produk</Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${id}`} className="hover:text-blue-600">Detail</Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${id}/generate`} className="hover:text-blue-600">Copy</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Pilih Template</span>
      </nav>

      <h1 className="text-2xl font-bold mb-2">Pilih Template Video</h1>
      <p className="text-gray-500 text-sm mb-8">
        Setiap template memiliki gaya visual yang berbeda. Pilih yang paling cocok dengan produk kamu.
      </p>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {templates.map((tpl) => {
          const config: TemplateConfig = JSON.parse(tpl.config_json);
          const colors = TEMPLATE_COLORS[tpl.name] || TEMPLATE_COLORS.ModernMinimal;
          const isSelected = selectedId === tpl.id;

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedId(tpl.id)}
              className={`relative text-left rounded-xl overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-blue-600 shadow-lg scale-[1.02]"
                  : "hover:shadow-md"
              }`}
            >
              {/* Template preview thumbnail */}
              <div
                className="h-48 flex items-center justify-center"
                style={{ background: colors.bg }}
              >
                <div className="text-center px-4">
                  {/* Mini preview blocks */}
                  <div className="space-y-2">
                    <div
                      className="h-3 rounded-full w-3/4 mx-auto"
                      style={{ background: colors.secondary }}
                    />
                    <div
                      className="h-2 rounded-full w-1/2 mx-auto"
                      style={{ background: colors.secondary, opacity: 0.5 }}
                    />
                  </div>
                  {/* Simulated scenes */}
                  <div className="flex gap-1 mt-4 justify-center">
                    {config.scenes.map((scene, i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full"
                        style={{
                          width: `${scene.duration_percent * 30}px`,
                          background: isSelected ? colors.secondary : "#ffffff44",
                        }}
                      />
                    ))}
                  </div>
                  {/* Play icon */}
                  <svg
                    className="w-10 h-10 mx-auto mt-4"
                    style={{ color: isSelected ? colors.secondary : "#ffffff88" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
                  <span className="text-xs text-gray-400">
                    {tpl.duration_seconds}s
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {config.description}
                </p>
                {/* Color dots */}
                <div className="flex gap-1 mt-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: config.colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: config.colors.secondary }}
                  />
                </div>
              </div>

              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Dipilih
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Link
          href={`/products/${id}/generate`}
          className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          ← Kembali Edit Copy
        </Link>
        <button
          onClick={handleRender}
          disabled={!selectedId}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {selectedId ? "Lanjut ke Render" : "Pilih Template Dulu"}
        </button>
      </div>
    </main>
  );
}